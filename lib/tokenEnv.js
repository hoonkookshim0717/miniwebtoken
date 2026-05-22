import webSignature from './websignature.js';
import Key from './key.js';
import ISON from './ison.js';

//	MARKER_REGEXP: /([\.~!])/,

class TokenEnv {
	
	constructor(wsOptions = {}) {

		wsOptions.payloadEncoding = 'utf8';
		wsOptions.signatureEncoding = 'base64url';

		this.ws = webSignature(wsOptions);
		this.keys = [];			// To be properties of the resulting payload.
		
		this.keys.push(Key.signature(this.ws));
	}

	set(...keys) {

		for(const curKey of keys) {
			if(typeof curKey === 'string') this.keys.push(new Key(curKey));
			else if(typeof curKey === 'object' && curKey.setter && curKey.getter) this.keys.push(curKey);
			else if(typeof curKey === 'function') this.keys.push(curKey());
			else throw new Error("Key should be one of string, Key object or function.");
		}
		return this;
	}

	sign(payload) {
		let resultTokenStr = '';
		this.keys.forEach((curKey, index) => {
			// if(payload[curKey.keyName])
			resultTokenStr += curKey.setter(payload[curKey.keyName]);
			// else resultTokenStr += curKey.setter
		});

		const signature = this.ws.sign(resultTokenStr);
		return signature + resultTokenStr;
	}

	verify(tokenStr) {
		const isonStrs = ISON.splitTokenStr(tokenStr);
		const result = {};
		
		isonStrs.forEach((isonStr, index) => {

			this.keys[index].getter(isonStr, result, tokenStr);
		});

		return result;
	}
}

export default TokenEnv;
