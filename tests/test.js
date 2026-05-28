import mwt from '../index.js';
import { TTL_HOUR } from '../index.js';

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
	emptryString: '',
	normalString: 'HongKilDong',
	negativaIntegerTest: -100,
	positiveIntegerTest: 128,
	shortfloat64Test: 0.25,
	longfloat64Test: -0.3,
	zeroTest: 0,
	minusOneTest: -1,
	testUserObj: sampleObject,
	testPrimitiveValue: testPrimitiveValue
}

const tokenEnv = mwt({
	alg: 'hs256',
	secretKey: 'testpass',
});

tokenEnv.set(mwt.expIn(TTL_HOUR, mwt.SINCE_2026));
tokenEnv.setUserCode('A', sampleObject);
tokenEnv.setUserCode('B', undefined);

tokenEnv.set("user_group", {
	getter: (value, targetObj) => {
		if(value > 0) targetObj.isWritable = false;
		else targetObj.isWritable = true;
	}
});

// In a login router or refresh router.
const resultMwtStr = tokenEnv.sign(samplePayload);		
console.log("Resulting mwt: ", resultMwtStr);
console.log("Legnth of mwt: ", resultMwtStr.length);

const faultyMwtStr = resultMwtStr + "BC";

// In a router.
let recoveredObj;

try {
	recoveredObj = tokenEnv.verify(faultyMwtStr);
} catch(error) {
	if(error === mwt.ERRORS.INVALID_SIGNATURE) console.log("Invalid signature detected.");
	else if(error === mwt.ERRORS.TOKEN_EXPIRED) console.log("Refresh needed");
}
console.log("Recovered Object: ", recoveredObj);

console.log("TestTry: ", Buffer.from('*AAA*', "base64url"));
