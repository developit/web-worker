/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
	worker = createModuleWorker('./test/fixtures/worker.mjs');
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
