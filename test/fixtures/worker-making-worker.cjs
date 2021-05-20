const Worker = require('web-worker');

const worker = new Worker(require.resolve('./worker.cjs'));
worker.addEventListener('message', e => {
    postMessage(e.data);
});

addEventListener('message', e => {
    worker.postMessage(e.data);
});
