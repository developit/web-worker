# web-worker

A web-compatible Worker implementation atop Node's [worker_threads](https://nodejs.org/api/worker_threads.html).

**Features and differences from worker_threads:**

- makes Worker code compatible across browser and Node
- uses DOM-style events (Event.data, Event.type, etc)
- supports event handler properties (`worker.onmessage=..`)
- `Worker()` constructor accepts a module URL
- Supports the `{ type: 'module' }` option natively in Node 12.8+
- emulates browser-style WorkerGlobalScope within the worker

### Usage Example

<table>
<thead><tr><th><strong>main.mjs</strong></th><th><strong>worker.mjs</strong></th></tr></thead>
<tbody><tr><td>

```js
import Worker from 'web-worker';

const worker = new Worker('./worker.mjs', {
	type: 'module'
});
worker.addEventListener('message', e => {
  console.log(e.data)  // ['main.mjs', 'worker.mjs']
});
worker.postMessage('ls');
```

</td><td>

```js
import fs from 'fs';

addEventListener('message', e => {
	if (e.data === 'ls') {
		const ls = fs.readdirSync('.');
		postMessage(ls);
	}
});
```

</td></tr></tbody>
</table>

### Data URLs

Instantiating Worker using a Data URL is supported in both module and classic workers:

```js
import Worker from 'web-worker';

const worker = new Worker(`data:application/javascript,postMessage(42)`);
worker.addEventListener('message', e => {
  console.log(e.data)  // 42
});
```
