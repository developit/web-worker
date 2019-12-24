import { other } from './other.mjs';

postMessage(other());

self.onmessage = e => {
	postMessage(['received onmessage', e.timeStamp, e.data]);
};

addEventListener('message', e => {
	postMessage(['received message event', e.timeStamp, e.data]);
});
