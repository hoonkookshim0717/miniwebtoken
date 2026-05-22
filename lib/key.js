/*
	key.js

	Format of setter function: (value) => { return isonStr; }
		value: property value from source objcet. It is converted to ISON string and attached to the token body.

	Format of getter function: (isonStr, targetObj, tokenStr) => { }
		Execution of getter function includes verification of that key.
			isonStr : ISON string from token string. getter function interprets this value and do what they want.
				i.e. save it to a property of targetObject, or doing verification for signature, etc.
			targetObj: target object to which the property value will be saved. If key.name === null, it is discarded.
			tokenStr: Full token body, excluding signature portion. used to verify the signature.
*/
import ISON from "./ison.js";

class Key {
	static expIn = expIn;

	static signature = signatureKey;

	constructor(keyName, setter, getter) {
		this.keyName = keyName;
		this.setter = setter ?? defaultSetter;
		this.getter = getter ?? defaultGetter;	
	}
}

function signatureKey(ws) {
	return new Key(
		null,		// Means enumerable.
		() => "",
		(signature, result, tokenStr) => {
			return ws.verify(tokenStr, signature);
		}
	);
}

function expIn(ttl, baseTime = 0) {
	return new Key(
		null,
		() => {
			const expAt = Math.floor(Date.now() / 1000) + ttl - baseTime;
			return ISON.valueToIson(expAt);
		},
		(isonStr) => {
			if(ISON.isonToValue(isonStr) + baseTime < Math.floor(Date.now() / 1000)) throw new Error("Token Expired");
		}
	)
}

function defaultSetter(value) { return ISON.valueToIson(value); }
function defaultGetter(isonStr, target) { if(this.keyName) target[this.keyName] = ISON.isonToValue(isonStr); }

export default Key;
