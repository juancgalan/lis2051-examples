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
 * @return {BigInt[][]} - A state of sha3
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
 * @param {BigInt[][]} a - State
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

export var currentState;

/**
 * Returns the i, j element from currentState after mangling the rows
 * and columns as specified by the standard.
 *     
 *     2|
 *     1|
 * y   0|    A
 *     4|
 *     3|
 *       - - - - -
 *       3 4 0 1 2
 *           
 *           x
 * 
 * @param {Number} i Row coordinate
 * @param {Number} j Collumn coordinate
 */
export function getMangledState(i, j) {
  var x = mangledColumn(j); 
  var y = mangledRow(i); 
  return currentState[y][x];
}

/**
 * Calculates the theta function of SHA3 using BigInts over currentState. 
 * The theta function is defined on FIPS2020 in terms of bits. However, on 
 * this function, theta is redefined using bytes and bigints(64bits).
 * 
 * C[x] is the parity of all columns of a sheet
 * D[x] = C[mod(x-1, 5)] ^ C[mod(x+1)][5] R1<< 1
 * A'[x,y] = A[x,y] ^ D[x]
 * 
 * @return {BigInt[][]}
 */
export function theta() {
  var c = [0, 0, 0, 0, 0];
  for(var x = 0; x < 5; x++) {
    for(var y = 0; y < 5; y++) {
      c[x] ^= getMangledState(x, y);
    }
  }
  var d = [0, 0, 0, 0, 0];
  for (var x = 0; x < 5; x++) {
    d[x] = c[mod(x - 1, 5)] ^ rot1(c[mod(x + 1, 5)]);
  }
  var a = [[0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0]];
  for(var x = 0; x < 5; x++) {
    for(var y = 0; y < 5; y++) {
      a[mangledRow(x)][mangledColumn(y)] = getMangledState(x, y) ^ d[x];
    }
  }
  return a;
}

var ro_offsets = [[153, 231,   3,  10, 171],
                  [ 55, 276,  36, 300,   6],
                  [ 28,  91,   0,   1, 190],
                  [120,  78, 210,  66, 253],
                  [ 21, 136, 105,  45,  15]];

export function ro() {
  var a = [[0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0],
           [0, 0, 0, 0, 0]];
  for (var i = 0; i < 5; i++) {
    for (var j = 0; j < 5; j++) {
      a[mangledRow(i)][mangledColumn(j)] = rot(getMangledState(i)(j), 
                                  ro_offsets[mangledRow(i)][mangledColumn(j)]);
    }
  }
  return a;
}

/**
 * Calculates the rho function of SHA3 using BigInts over currentState. 
 * The theta function is defined on FIPS2020 in terms of bits. However, on 
 * this function, theta is redefined using bytes and bigints(64bits).
 * 
 * C[x] is the parity of all columns of a sheet
 * D[x] = C[mod(x-1, 5)] ^ C[mod(x+1)][5] R1<< 1
 * A'[x,y] = A[x,y] ^ D[x]
 * 
 * @return {BigInt[][]}
 */

export function mangledRow(i) {
  return (4 - i + 3) % 5;
}

export function mangledColumn(j) {
  return (j + 3) % 5; 
}

export function mod(m, n) {
  if (m >= 0)
    return m % n;
  else 
    return (n + (m % n));
}

/**
 * Rotates a big int one time to the left. The most significant bit is
 * placed as the less significant bit.
 */
export function rot1(n) {
  var msb = n && BigInt('0x8000000000000000');
  var ans = n << Bigint('1');
  if (msb > 0)
    ans |= BigInt('1');
  return ans;
}

/**
 * Rotates a big int n times to the right. The less significant bits is
 * placed as the more significant bit.
 * 
 * ex:
 *     rot(0110b, 2) =  1001b
 * 
 * @argument {BigInt} n - Integer to be rotated
 * @argument {Number} b - Places to rotate 
 * @returns {BigInt} A BigInt rotated b places
 */
export function rot(n, b) {
  ans = n;
  for (var i = 0; i < b; i++) {
    ans = rot1(ans);
  }
  return ans;
}
