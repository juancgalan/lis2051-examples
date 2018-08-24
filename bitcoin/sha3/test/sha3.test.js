import { wordToString, stringToWord, createState, createString } from '../src/sha3';

test('Transform a string to a 64bit number', () => {
  var expected = BigInt('0x4142434445464748');
  var s = stringToWord('ABCDEFGH');
  expect( s === expected).toBeTruthy();
});

test('Transform a 64bit number to a string', () => {
  var s = wordToString(BigInt('0x4142434445464748'));
  var expected = 'ABCDEFGH';
  expect( s === expected).toBeTruthy();
});

test('Create a state with lanes of the same character', () => {
  var s = "";
  var firstChar = 0x41;
  var expected = [];
  for (var i = 0; i < 25; i++) {
    var currentChar = String.fromCharCode(firstChar + i);
    var lane = '';
    for (var j = 0; j < 8; j++) {
      lane += currentChar;
    }
    s += lane;
  }
  var a = createState(s);
  var lane00 = BigInt('0x4141414141414141');
  var lane10 = BigInt('0x4242424242424242');
  var lane01 = BigInt('0x4646464646464646');
  var lane41 = BigInt('0x4a4a4a4a4a4a4a4a');
  var lane44 = BigInt('0x5959595959595959');
  expect(a[0][0] === lane00).toBeTruthy();
  expect(a[1][0] === lane10).toBeTruthy();
  expect(a[0][1] === lane01).toBeTruthy();
  expect(a[4][1] === lane41).toBeTruthy();
  expect(a[4][4] === lane44).toBeTruthy();
});

test('Create a string from a state', () => {
  var s = "";
  var firstChar = 0x41;
  var expected = [];
  for (var i = 0; i < 25; i++) {
    var currentChar = String.fromCharCode(firstChar + i);
    var lane = '';
    for (var j = 0; j < 8; j++) {
      lane += currentChar;
    }
    s += lane;
  }
  var a = createState(s);
  var newS = createString(a);
  expect(s === newS).toBeTruthy();
});