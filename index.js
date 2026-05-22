import TokenEnv from './lib/tokenEnv.js';
import ISON from './lib/ison.js';
import Key from './lib/key.js';

function isonWebToken(settings) {
	return new TokenEnv(settings);
}

// Built-in fuctions.
isonWebToken.expIn = Key.expIn;

// Constatns for ttl.
const TTL_HOUR = 60 * 60;
const TTL_DAY = 24 * 60 * 60;

// constants for basetime.
const SINCE_EPOCH = 0;
const SINCE_2000 = 946684800;
const SINCE_2020 = 1577836800;
const SINCE_2026 = 1767225600;

export default isonWebToken;
export { TTL_HOUR, TTL_DAY, SINCE_EPOCH, SINCE_2000, SINCE_2020, SINCE_2026 };
