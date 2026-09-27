import TokenEnv from './lib/tokenEnv.js';
import MEN from './lib/men.js';
import Key from './lib/key.js';
import ERRORS from './lib/errors.js';

function miniWebToken(settings) {
	return new TokenEnv(settings);
}

// Constans for baseTimestamp.
miniWebToken.SINCE_EPOCH = TokenEnv.SINCE_EPOCH;
miniWebToken.SINCE_2000 = TokenEnv.SINCE_2000;
miniWebToken.SINCE_2020 = TokenEnv.SINCE_2020;
miniWebToken.SINCE_2026 = TokenEnv.SINCE_2026;

// Built-in key fuctions.
miniWebToken.maxAge = Key.maxAge;
miniWebToken.minAge = Key.minAge;
miniWebToken.expiresAt = Key.expiresAt;
miniWebToken.activatesAt = Key.activatesAt;
miniWebToken.issuedAt = Key.issuedAt;

miniWebToken.ERRORS = ERRORS;

// Constans for built-in key functions.
miniWebToken.HOUR = Key.HOUR;
miniWebToken.DAY = Key.DAY;

export default miniWebToken;
