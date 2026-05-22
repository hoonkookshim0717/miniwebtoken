import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const addon = require('../src/build/Release/addon.node');

const ISON = {
	POSITIVE_MARKER: '.',
	STRING_MARKER: '~',
	NEGATIVE_MARKER: '!',

	splitTokenStr: (tokenStr) => {
		const elements = [];
		let curIndex = 0, nextIndex = 0;

		while(nextIndex < tokenStr.length) {
			if(tokenStr[nextIndex] === ISON.POSITIVE_MARKER || tokenStr[nextIndex] === ISON.STRING_MARKER || tokenStr[nextIndex] === ISON.NEGATIVE_MARKER) {
				elements.push(tokenStr.slice(curIndex, nextIndex));
				curIndex = nextIndex;
			}
			nextIndex++;
		}
		elements.push(tokenStr.slice(curIndex, nextIndex));

		return elements;
	},
	
	valueToIson: (value) => {
		if(Number.isInteger(value)) return addon.encode(value);
		else if(typeof value === 'string') return ISON.STRING_MARKER + Buffer.from(value).toString("base64url");
		else throw new Error("Only integers and Strings are allowed in isonwebtoken.");
	},

	isonToValue: (isonStr) => {
		switch(isonStr[0]) {
			case ISON.POSITIVE_MARKER:
				return addon.decode(isonStr);
			case ISON.STRING_MARKER:
				return Buffer.from(isonStr.slice(1, isonStr.length), 'base64url').toString();
			case ISON.NEGATIVE_MARKER:
				return addon.decode(isonStr);
			default:
				return isonStr;			// Mean this ison is a signature.
		}
	}
}

export default ISON;
