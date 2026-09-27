import MEN from "./men.js";
import ERRORS from "./errors.js";

class Key {

	static maxAge = maxAge;
	static issuedAt = issuedAt;
	static minAge = minAge;
	static expiresAt = expiresAt;
	static activatesAt = activatesAt;
	
	static HOUR = 3600;
	static DAY = 86400;

	constructor(keyName, envSettings) {
		if(keyName && typeof keyName === 'string') this.keyName = keyName;
		else this.keyName = Symbol();

		this.envSettings = envSettings;
	}
	
	setter(value) { return value; }
	getter(value, targetObj) { if(typeof this.keyName === 'string') targetObj[this.keyName] = value; }
}

function maxAge(ageInSec, keyName) {
	if(!Number.isFinite(ageInSec))
		throw new TypeError(ERRORS.MAXAGE_USAGE + ERRORS.INVALID_ARG_AGEINSEC);
	if(keyName && typeof keyName !== 'string')
		throw new TypeError(ERRORS.MAXAGE_USAGE + ERRORS.INVALID_ARG_KEYNAME);

	return function(envSettings) {
		return new MaxAge(keyName, envSettings, ageInSec);
	}
}

class MaxAge extends Key {
	constructor(keyName, envSettings, ageInSec) {
		super(keyName, envSettings);
		this.maxAge = ageInSec;
	}

	setter(value) {
		return Math.floor(Date.now() / 1000) + this.maxAge - this.envSettings.baseTimestamp;
	}
	
	getter(value, targetObj) {
		const rTimestamp = value + this.envSettings.baseTimestamp;
		if(rTimestamp < Math.floor(Date.now() / 1000)) throw ERRORS.TOKEN_EXPIRED;
		if(typeof this.keyName === 'string') targetObj[this.keyName] = rTimestamp;
	}

}

function minAge(ageInSec, keyName) {
	if(!Number.isFinite(ageInSec))
		throw new TypeError(ERRORS.MINAGE_USAGE + ERRORS.INVALID_ARG_AGEINSEC);
	if(keyName && typeof keyName !== 'string')
		throw new TypeError(ERRORS.MINAGE_USAGE + ERRORS.INVALID_ARG_KEYNAME);

	return function(envSettings) { return new MinAge(keyName, envSettings, ageInSec); }
}

class MinAge extends Key {
	constructor(keyName, envSettings, ageInSec) {
		super(keyName, envSettings);
		this.minAge = ageInSec;
	}
	
	setter(value) {
		return Math.floor(Date.now() / 1000) + this.minAge - this.envSettings.baseTimestamp;
	}
	
	getter(value, targetObj) {
		const rTimestamp = value + this.envSettings.baseTimestamp;
		if(rTimestamp > Math.floor(Date.now() / 1000)) throw ERRORS.NOT_VALID_YET;
		if(typeof this.keyName === 'string') targetObj[this.keyName] = rTimestamp;
	}
}

function expiresAt(timestampInSec, keyName) {
	if(!Number.isFinite(timestampInSec))
		throw new TypeError(ERRORS.EXPIRESAT_USAGE + ERRORS.INVALID_ARG_TIMESTAMPINSEC);
	if(keyName && typeof keyName !== 'string')
		throw new TypeError(ERRORS.EXPIRESAT_USAGE + ERRORS.INVALID_ARG_KEYNAME);

	return function(envSettings) { return new ExpiresAt(keyName, envSettings, timestampInSec); }
}

class ExpiresAt extends Key {
	constructor(keyName, envSettings, timestampInSec) {
		super(keyName, envSettings);
		this.timestamp = timestampInSec;
	}
	setter(value) { return this.timestamp - this.envSettings.baseTimestamp; }
	getter(value, targetObj) { 
		const rTimestamp = value + this.envSettings.baseTimestamp;
		if(rTimestamp < Math.floor(Date.now() / 1000)) throw ERRORS.TOKEN_EXPIRED;
		if(typeof this.keyName === 'string') targetObj[this.keyName] = rTimestamp;
	}
}

function activatesAt(timestampInSec, keyName) {

	if(!Number.isFinite(timestampInSec))
		throw new TypeError(ERRORS.ACTIVATESAT_USAGE + ERRORS.INVALID_ARG_TIMESTAMPINSEC);
	if(keyName && typeof keyName !== 'string')
		throw new TypeError(ERRORS.ACTIVATESAT_USAGE + ERRORS.INVALID_ARG_KEYNAME);
	
	return function(envSettings) { return new ActivatesAt(keyName, envSettings, timestampInSec); }
}

class ActivatesAt extends Key {
	constructor(keyName, envSettings, timestampInSec) {
		super(keyName, envSettings);
		this.timestamp = timestampInSec;
	}
	setter(value) { return this.timestamp - this.envSettings.baseTimestamp; }
	getter(value, targetObj) {
		const rTimestamp = value + this.envSettings.baseTimestamp;
		if(rTimestamp > Math.floor(Date.now() / 1000)) throw ERRORS.NOT_VALID_YET;
		if(typeof this.keyName === 'string') targetObj[this.keyName] = rTimestamp;
	}
}

function issuedAt(keyName) {
	if(keyName && typeof keyName !== 'string') throw new TypeError(ERRORS.ISSUEDAT_USAGE);
	return function(envSettings) { return new IssuedAt(keyName, envSettings) };
}

class IssuedAt extends Key {
	constructor(keyName, envSettings) {
		super(keyName, envSettings);
	}
	
	setter(value) { return Math.floor(Date.now() / 1000) - this.envSettings.baseTimestamp; }
	getter(value, targetObj) { if(typeof this.keyName === 'string') targetObj[this.keyName] = value + this.envSettings.baseTimestamp; }
}

export default Key;
