import mwt from '../index.js';
import { TTL_HOUR, SINCE_2026 } from '../index.js';

const samplePayload = {
	test0: 0,
	test_1: -1,
	user_nickname: 'KilDong Hong',
	user_group: -100,
	test0: 0,
	user_roles: 187,
	test61: 61,
	test62: 62,
	test63: 63,
	test64: 64,
	test011: 0.5,
	test022: 0.25,
	test023: 0.13,
	test002: 0.4,
}

const tokenEnv = mwt({
	alg: 'hs256',
	secretKey: 'testpass',
});

tokenEnv.set(mwt.expIn(TTL_HOUR, SINCE_2026));

// In a login router or refresh router.
const resultMwtStr = tokenEnv.sign(samplePayload);		
console.log("Resulting mwt: ", resultMwtStr);
console.log("Legnth of mwt: ", resultMwtStr.length);

// In a router.
const recoveredObj = tokenEnv.verify(resultMwtStr);
console.log("Recovered Object: ", recoveredObj);

