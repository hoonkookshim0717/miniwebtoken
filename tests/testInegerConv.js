import mwt from '../index.js';

const MAX_INTEGER = 2048;

const tokenEnv = mwt({
	alg: 'hs256',
	secretKey: 'testpass',
});

let testObject = {}

// Positive test.
for(let index = 0; index < MAX_INTEGER; index++) testObject['test' + index] = index;

let token = tokenEnv.sign(testObject);
let revertedObject = tokenEnv.verify(token);

let testPass = true;

for(let index = 0; index < 2048; index++) {
	if(testObject['test'+ index] !== revertedObject['test' + index]) {
		testPass=false;
		break;
	}
}

testObject = {}

// Negative test.
for(let index = 0; index < MAX_INTEGER; index++) testObject['test' + index] = index * -1;

token = tokenEnv.sign(testObject);
revertedObject = tokenEnv.verify(token);

for(let index = 0; index < MAX_INTEGER; index++) {
	if(testObject['test'+ index] !== revertedObject['test' + index]) {
		testPass=false;
		break;
	}
}

console.log("Result: ", testPass);
