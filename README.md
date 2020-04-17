# web-worker

Native cross-platform Web Workers. Works in published npm modules.

```js
import Worker from 'web-worker';

const worker = new Worker('data:,postMessage("hello")');
worker.onmessage = e => console.log(e.data);  // "hello"
```

**In Node**, it's a web-compatible Worker implementation atop Node's [worker_threads](https://nodejs.org/api/worker_threads.html).

**In the browser** (and when bundled for the browser), it's simply an alias of `Worker`.

### Features

_Here's how this is different from worker_threads:_

- makes Worker code compatible across browser and Node
- uses DOM-style events (Event.data, Event.type, etc)
- supports event handler properties (`worker.onmessage=..`)
- `Worker()` constructor accepts a module URL
- Supports the `{ type: 'module' }` option natively in Node 12.8+
- emulates browser-style WorkerGlobalScope within the worker

### Usage Example

<table>
<thead><tr><th><strong>main.js</strong></th><th><strong>worker.js</strong></th></tr></thead>
<tbody><tr><td>

```js
import Worker from 'web-worker';

const worker = new Worker(new URL('./worker.js', import.meta.url));

worker.addEventListener('message', e => {
  console.log(e.data)  // "hiya!"
});

worker.postMessage('hello');
```

</td><td>

```js
addEventListener('message', e => {
  if (e.data === 'hello') {
    postMessage('hiya!');
  }
});
```

</td></tr></tbody>
</table>

The pattern `new URL('./worker.js', import.meta.url)` is used above to load the worker relative to the current module instead of the application base URL. Without this, Worker URLs are relative to a document's URL, which in Node.js is interpreted to be `process.cwd()`.

Support for this pattern in build tools and test frameworks is still quite limited, but we are working on growing this support (tracking issue https://github.com/developit/web-worker/issues/4).

### Module Workers

Module Workers are supported in Node 12.8+ using this plugin, leveraging Node's native ES Modules support.
In the browser, they can be used natively in Chrome 80+, or in all browsers via [worker-plugin] or [rollup-plugin-off-main-thread]. As with classic workers, there is no difference in usage between Node and the browser:

<table>
<thead><tr><th><strong>main.mjs</strong></th><th><strong>worker.mjs</strong></th></tr></thead>
<tbody><tr><td>

```js
import Worker from 'web-worker';

const worker = new Worker(new URL('./worker.mjs', import.meta.url), {
  type: 'module'
});
worker.addEventListener('message', e => {
  console.log(e.data)  // "200 OK"
});
worker.postMessage('https://httpstat.us/200');
```

</td><td>

```js
import fetch from 'isomorphic-fetch';

addEventListener('message', async e => {
  const url = e.data;
  const res = await fetch(url)
  const text = await res.text();
  postMessage(text);
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

### Special Thanks

This module aims to provide a simple and forgettable piece of infrastructure,
and as such it needed an obvious and descriptive name.
[@calvinmetcalf](https://github.com/calvinmetcalf), who you may recognize as the author of [Lie](https://github.com/calvinmetcalf/lie) and other fine modules, gratiously offered up the name from his `web-worker` package.
Thanks Calvin!


[worker-plugin]: https://github.com/googlechromelabs/worker-plugin
[rollup-plugin-off-main-thread]: https://github.com/surma/rollup-plugin-off-main-thread
