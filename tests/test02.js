import mwt from '../index.js';

const userSymbol = Symbol();
const sampleObject = { bbsR: true, bbsW: true, bbsX: false };

const originalPayload = { userSymbol, sampleObject };

const tokenEnv = mwt({ alg: 'hs256', secretKey: 'testpass' });
tokenEnv.setKeys('userSymbol', 'sampleObject');

tokenEnv.setUserCode('A', sampleObject);
tokenEnv.setUserCode('B', userSymbol);

const token = tokenEnv.sign(originalPayload);		
const payload = tokenEnv.verify(token);

console.log(token);          // uxwH7pjhcmcCsHSF5Sd6_qDsCNnprtNDamaM5crO17M)B)A
console.log(token.length);   // 47
console.log(payload);        // { userSymbol: Symbol(), sampleObject: { bbsR: true, bbsW: true, bbsX: false } }