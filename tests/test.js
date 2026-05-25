import mwt from '../index.js';
import { TTL_HOUR, SINCE_2026 } from '../index.js';

const sampleObject = {
	isWritable: true,
	isReadable: true,
	isExecutable: false,
}

const samplePayload = {
	truefalseTest: true,
	falsetrueTest: false,
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
	test002: 0.4,
	testUserReg: sampleObject,
}

const tokenEnv = mwt({
	alg: 'hs256',
	secretKey: 'testpass',
});

tokenEnv.set(mwt.expIn(TTL_HOUR, SINCE_2026));
tokenEnv.regUserObject('A', sampleObject);

// In a login router or refresh router.
const resultMwtStr = tokenEnv.sign(samplePayload);		
console.log("Resulting mwt: ", resultMwtStr);
console.log("Legnth of mwt: ", resultMwtStr.length);

// In a router.
const recoveredObj = tokenEnv.verify(resultMwtStr);
console.log("Recovered Object: ", recoveredObj);

