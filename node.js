import URL from 'url';
import threads from 'worker_threads';
import { EventEmitter } from 'events';

const WORKER = Symbol.for('worker');

// this module is used self-referentially on both sides of the
// thread boundary, but behaves differently in each context.
export default threads.isMainThread ? mainThread() : workerThread();

function mainThread() {

	/**
	 * A web-compatible Worker implementation atop Node's worker_threads.
	 *  - uses DOM-style events (Event.data, Event.type, etc)
	 *  - supports event handler properties (worker.onmessage)
	 *  - Worker() constructor accepts a module URL
	 *  - accepts the {type:'module'} option
	 *  - emulates WorkerGlobalScope within the worker
	 * @param {string} url  The URL or module specifier to load
	 * @param {object} [options]  Worker construction options
	 * @param {string} [options.name]  Available as `self.name` within the Worker
	 * @param {string} [options.type="classic"]  Pass "module" to create a Module Worker.
	 */
	class Worker extends EventEmitter {
		constructor(url, options) {
			super();
			const { name, type } = options || {};
			// hack: grab the caller's filename from a stack trace
			let relativeTo = process.cwd();
			try {
				relativeTo = Error().stack.split('\n')[2].match(/ \((.+):[^:]+:[^:]+\)$/)[1];
			}
			catch (e) {}
			const mod = URL.fileURLToPath(new URL.URL(url, 'file://' + relativeTo));
			// console.log({ url, mod, relativeTo });
			const worker = this[WORKER] = new threads.Worker(
				__filename,
				{ workerData: { mod, name, type } }
			);
			worker.on('message', data => {
				this.dispatchEvent({ type: 'message', data });
			});
			worker.on('error', error => {
				error.type = 'error';
				this.dispatchEvent(error);
			});
			worker.on('exit', () => {
				this.dispatchEvent({ type: 'close' });
			});
		}
		postMessage(data, transferList) {
			this[WORKER].postMessage(data, transferList);
		}
		dispatchEvent(e) {
			dispatchEvent(this, e);
		}
		addEventListener(type, fn) {
			this.on(type, fn);
		}
		removeEventListener(type, fn) {
			this.removeListener(type, fn);
		}
		terminate() {
			this[WORKER].terminate();
		}
	}
	Worker.prototype.onmessage = Worker.prototype.onerror = Worker.prototype.onclose = null;
	return Worker;
}

function workerThread() {
	const { mod, name, type } = threads.workerData;

	// turn global into a mock WorkerGlobalScope
	const self = global.self = global;

	// use an internal emitter for WorkerGlobalScope events
	const events = new EventEmitter();
	// enqueue messages to dispatch after modules are loaded
	let q = [];
	function flush() {
		const buffered = q;
		q = null;
		buffered.forEach(event => { dispatchEvent(self, event, events); });
	}
	threads.parentPort.on('message', data => {
		const event = { type: 'message', data };
		if (q == null) return dispatchEvent(self, event, events);
		// save timestamp and enqueue for deferred dispatch:
		event.timeStamp = Date.now();
		q.push(event);
	});
	threads.parentPort.on('error', err => {
		err.type = 'Error';
		dispatchEvent(self, err, events);
	});

	Object.assign(self, /** @lends WorkerGlobalScope */ {
		name,
		postMessage(data, transferList) {
			threads.parentPort.postMessage(data, transferList);
		},
		dispatchEvent(e) {
			dispatchEvent(self, e, events);
		},
		addEventListener(type, fn) {
			events.on(type, fn);
		},
		removeEventListener(type, fn) {
			events.removeListener(type, fn);
		}
	});

	if (type === 'module') {
		import(mod).then(flush);
	}
	else {
		require(mod);
		Promise.resolve().then(flush);
	}
}


/**
 * @private
 * Easier than wiring up getter/setter pairs for `onmessage` et al.
 * Does not implement phased capture or propagation.
 * @param {object} target  The host object on which to fire events.
 * @param {object} e       A mock Event object
 * @param {string} e.type  The event type to fire.
 * @param {EventEmitter} [emitter=target]  The emitter instance to use for firing events.
 */
function dispatchEvent(target, e, emitter) {
	const event = new Event(e.type, target);
	Object.assign(event, e);
	if (target['on'+event.type]) {
		target['on'+event.type](e);
	}
	(emitter || target).emit(event.type, event);
}

function Event(type, target) {
	this.type = type;
	this.target = this.currentTarget = target;
	this.timeStamp = Date.now();
}
