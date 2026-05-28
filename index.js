import TokenEnv from './lib/tokenEnv.js';
import MEN from './lib/men.js';
import Key from './lib/key.js';
import ERRORS from './lib/errors.js';

function miniWebToken(settings) {
	return new TokenEnv(settings);
}

// Built-in fuctions.
miniWebToken.expIn = Key.expIn;
miniWebToken.ERRORS = ERRORS;

// Constatns for ttl.
const TTL_HOUR = Key.TTL_HOUR;
const TTL_DAY = Key.TTL_DAY;

// constants for basetime.
const SINCE_EPOCH = TokenEnv.SINCE_EPOCH;
const SINCE_2000 = TokenEnv.SINCE_2000;
const SINCE_2020 = TokenEnv.SINCE_2020;
const SINCE_2026 = TokenEnv.SINCE_2026;

export default miniWebToken;
export { TTL_HOUR, TTL_DAY, SINCE_EPOCH, SINCE_2000, SINCE_2020, SINCE_2026 };
