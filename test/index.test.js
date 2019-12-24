import test from 'ava';
import Worker from '..';

let worker;

function createModuleWorker(url) {
	const worker = new Worker(url, { type: 'module' });
	worker.events = [];
	worker.addEventListener('message', e => {
		worker.events.push(e);
	});
	return worker;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

test.after.always(t => {
	if (worker) worker.terminate();
});

test.serial('instantiation', async t => {
	worker = createModuleWorker('./fixtures/worker.mjs');
	await sleep(500);
	t.is(worker.events.length, 1, 'should have received a message event');
	t.is(worker.events[0].data, 42);
});

test.serial('postMessage', async t => {
	// reset events list
	worker.events.length = 0;

	const msg = { greeting: 'hello' };
	worker.postMessage(msg);
	const timestamp = Date.now();

	await sleep(500);

	t.is(worker.events.length, 2, 'should have received two message responses');
	
	const first = worker.events[0];
	t.is(first.data[0], 'received onmessage');
	t.assert(Math.abs(timestamp - first.data[1]) < 500);
	t.deepEqual(first.data[2], msg);
	t.not(first.data[2], msg);

	const second = worker.events[1];
	t.is(second.data[0], 'received message event');
	t.assert(Math.abs(timestamp - second.data[1]) < 500);
	t.deepEqual(second.data[2], msg);
	t.not(second.data[2], msg);
});
