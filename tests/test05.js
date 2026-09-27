import mwt from '../index.js';

const samplePayload = {
	user_name: 'KilDong Hong',
}

const tokenEnv = mwt({
	alg: 'hs256',
	secretKey: 'testpass',
});
tokenEnv.setKeys(...Object.keys(samplePayload));
tokenEnv.setKeys(mwt.maxAge(mwt.DAY)) // this token expires 1 day after being signed.

const resultMwtStr = tokenEnv.sign(samplePayload);		
console.log("Resulting mwt: ", resultMwtStr);
console.log("Legnth of mwt: ", resultMwtStr.length);

const recoveredObj = tokenEnv.verify(resultMwtStr);
console.log("Recovered Object: ", recoveredObj);
