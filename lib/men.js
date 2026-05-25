/*
	men.js - 'MEN' stands for Miniwebtoken Element Notation.
		Provides functions to convert property values to token elements, and vice versa.
*/

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const addon = require('../src/build/Release/addon.node');

const MEN = {
	POSITIVE_MARKER: ".",
	STRING_MARKER: '~',
	NEGATIVE_MARKER: '!',
	FLOAT64_MARKER: "*",
	RESERVED_MARKER: "'",		//	Reserved for future use.
	SP_MARKER: '(',
	USER_REG_MARKER: ')',

	MARKERS: new Set([".", "~", "!", "*", "'", "(", ")"]),

	SP_ENCODE_TABLE: new Map([[undefined, 'A'], [null, 'B'], [true, 'C'], [false, 'D']]),
	SP_DECODE_TABLE: new Map([['A', undefined], ['B', null], ['C', true], ['D', false]]),

	errMsgs: {
		INVALID_ARGS_FOR_SET: 'Arguments for set() function should be either a string, a Key object or functions which return a key object.',
	},

	splitTokenStr: (tokenStr) => {
		const elements = [];
		let curIndex = 0, nextIndex = 0;

		while(nextIndex < tokenStr.length) {
			if(isMarker(tokenStr[nextIndex])) {
				elements.push(tokenStr.slice(curIndex, nextIndex));
				curIndex = nextIndex;
			}
			nextIndex++;
		}
		elements.push(tokenStr.slice(curIndex, nextIndex));
		return elements;
	},

	encodeNumber: (value) => addon.encode(value),
	decodeNumber: (menStr) => addon.decode(menStr),

	decodeSp: (menStr) => {
		const spCode = menStr.slice(1, menStr.length);
		if(MEN.SP_DECODE_TABLE.has(spCode)) return MEN.SP_DECODE_TABLE.get(spCode);
		else throw new Error('Unregistered SP code: ', spCode);
	},
}

function isMarker(ch) { return MEN.MARKERS.has(ch); }

export default MEN;
