const Worker = require('web-worker');

const worker = new Worker(require.resolve('./worker.cjs'));
worker.addEventListener('message', e => {
    postMessage(e);
});
