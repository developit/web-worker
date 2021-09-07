import  Worker from '..';

const worker = new Worker('./worker.mjs', {
	type: 'module'
});

worker.events = [];
worker.addEventListener('message', e => {
	worker.events.push(e);
});
