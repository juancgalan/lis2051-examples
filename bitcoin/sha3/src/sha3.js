/**
 * Create a state array from a string. Defined on FIPS 202 sec. 3.5.2, a state
 * A[x,y,z] is defined as a three dimensinal binary array that can be created 
 * from a string as following:
 * 
 * A[0,0,0] = S[0],    | A[1,0,0] = S[64],   | ...
 * A[0,0,1] = S[1],    | A[1,0,1] = S[65],   | ...
 * ...                 | ...                 | ...
 * A[0,0,63] = S[63],  | A[1,0,63] = S[127], | ...
 * 
 * A[0,1,0] = S[320],  | A[1,1,0] = S[384],  | ...
 * A[0,1,1] = S[321],  | A[1,1,1] = S[385],  | ...
 * ...                 | ...                 | ...
 * A[0,1,63] = S[383], | A[1,1,63] = S[447], | ...
 * 
 * where A is a 5x5xw array and S is a binary string.
 * 
 * By observation, we can determine that A can be represented using a 5x5 array
 * of a word (64 bits) for sha3-256 where b = 1600 and S using a string. In
 * other words, each /lane/ will be represented by a WORD.
 * 
 * @param {string} s - A string to be used for creating a sha3 state of length 
 *                     of 1600
 * @return {number[][]} - A state of sha3
 */
export function createState(s) {
  var a = [[0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0]];
  for (var i = 0; i < 5; i++) {
    for (var j = 0; j < 5; j++) {
      var idx = i * 5 + j;
      a[j][i] = stringToWord(s.slice(idx * 8, idx * 8 + 8));
    }
  }
  return a;
}

/**
 * Create a string from a state. Inverse of createState(s).
 * 
 * @param {number[][]} a - State
 * @return {string} string representation of the state a
 */
export function createString(a) {
  var s = "";
  for (var i = 0; i < 5; i++) {
    for (var j = 0; j < 5; j++) {
      var idx = i * 5 + j;
      var subs = wordToString(a[j][i]);
      s += subs;
    }
  }
  return s;
}

/**
 * Create a number from a string of length 8.
 * 
 * @param {string} s - The string to be converted
 * @return {BigInt} A number of 64 bits
 */
export function stringToWord(s) {
  var ans = BigInt(0);
  for (var i = 0; i < 8; i++) {
    ans = (ans << BigInt(8)) | BigInt(s.charCodeAt(i));
  }
  return ans;
}

/**
 * Create a string from a word (number of 64bits).
 * 
 * @param {BigInt} n - A number of 64 bits
 * @return {string} A string of length 8
 */
export function wordToString(n) {
  var s = "";
  for (var i = 0; i < 8; i++) {
    s = String.fromCharCode(Number((n >> BigInt(i * 8)) & BigInt(0xFF))) + s;
  }
  return s;
}
