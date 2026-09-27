import mwt from '../index.js';

const sampleObject = {
	isWritable: true,
	isReadable: true,
	isExecutable: false,
}

const testPrimitiveValue = null;

const samplePayload = {
	trueTest: true,
	falseTest: false,
	undefinedTest: undefined,
	nullTest: null,
	NaNTest: NaN,
	emptryString: '',
	normalString: 'HongKilDong',
	negativaIntegerTest: -100,
	positiveIntegerTest: 128,
	shortfloat64Test: 0.25,
	longfloat64Test: -0.3,
	zeroTest: 0,
	minusOneTest: -1,
	testUserObj: sampleObject,
	testPrimitiveValue: testPrimitiveValue,
}

// Create tokenEnv instance.
const tokenEnv = mwt({
	alg: 'hs256',
	secretKey: 'testpass',
	baseTimestamp: mwt.SINCE_2026,
});

const keys = Object.keys(samplePayload);

// Register basic property names.
tokenEnv.setKeys(...keys);

// Register built-in key functions.
tokenEnv.setKeys(mwt.issuedAt('issuedAt'));
tokenEnv.setKeys(mwt.maxAge(mwt.HOUR, 'maxAge'));
tokenEnv.setKeys(mwt.minAge(0, 'minAge'));
tokenEnv.setKeys(mwt.expiresAt(Math.floor(Date.now() / 1000) + 10, 'expiresAt'));
tokenEnv.setKeys(mwt.activatesAt(Math.floor(Date.now() / 1000) - 10, 'activatesAt'));

// Register several user-defined codes.
tokenEnv.setUserCode('A', sampleObject);
tokenEnv.setUserCode('B', undefined);

// Signing a token.
const resultMwtStr = tokenEnv.sign(samplePayload);		

console.log("Resulting mwt: ", resultMwtStr);
console.log("Legnth of mwt: ", resultMwtStr.length);

// Verifying and recovering the payload.
let recoveredObj;

try {
	recoveredObj = tokenEnv.verify(resultMwtStr);
} catch(error) {
	console.log("An error occured: ", error);
}

console.log("tokenEnv.envSettings: ", tokenEnv.envSettings);
console.log("Recovered Object: ", recoveredObj);
