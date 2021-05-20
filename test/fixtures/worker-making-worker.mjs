import Worker from 'web-worker';

const worker = new Worker(new URL('./worker.mjs', import.meta.url), { type: 'module' });
worker.addEventListener('message', e => {
    postMessage(e);
});
