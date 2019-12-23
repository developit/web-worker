const assert = require('assert');
const Worker = require('..');

const worker = new Worker('./fixtures/worker.js');
const events = [];
worker.addEventListener('message', e => {
	events.push(e);
	console.log(e);
});
const msg = { greeting: 'hello' };
worker.postMessage(msg);
setTimeout(() => {
	assert.equal(events.length, 3);

	assert.equal(events[0][0], 42);

	assert.equal(events[1][0], 'received onmessage');
	assert.ok(Math.abs(Date.now() - events[1][1]) < 50);
	assert.deepStrictEqual(events[1][2], msg);
	assert.notEqual(events[1][2], msg);

	assert.equal(events[2][0], 'received onmessage');
	assert.ok(Math.abs(Date.now() - events[2][1]) < 50);
	assert.deepStrictEqual(events[2][2], msg);
	assert.notEqual(events[2][2], msg);

	process.exit(1);
}, 100);
