/*
	men.js - 'MEN' stands for Miniwebtoken Element Notation.
		Provides functions to convert property values to token elements, and vice versa.
*/

import { createRequire } from 'module';
import ERRORS from './errors.js';

const require = createRequire(import.meta.url);
const addon = require('../addons/addon.node');


const MEN = {
	MARKERS: new Set([".", "~", "!", "*", "'", "(", ")"]),

	POSITIVE_MARKER: ".",
	STRING_MARKER: '~',
	NEGATIVE_MARKER: '!',
	FLOAT64_MARKER: "*",
	RESERVED_MARKER: "'",		// Reserved for future use.
	SP_MARKER: '(',
	USER_REG_MARKER: ')',

	TRUE_NOTATION: '!A',
	FALSE_NOTATION: '.A',
	NULL_NOTATION: '*A',

	isBase64UrlString: /^[A-Za-z0-9-_]+$/,

	SP_ENCODE_TABLE: new Map([[undefined, 'A']]),
	SP_DECODE_TABLE: new Map([['A', undefined]]),

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
		else throw ERRORS.UNREGISTERED_SP_CODE+ spCode;
	},
}

function isMarker(ch) { return MEN.MARKERS.has(ch); }

export default MEN;
