/* 鹿群符号编码：旧格式读取、新格式损坏检测，均在本地处理。 */
(function (root) {
  "use strict";

  var POOL = ["鹿", "🦌", "🌿", "🍃", "✨", "🌟", "💫", "🌈", "🍀", "🐾", "🌸", "💮", "🌺", "🌼", "⭐", "🌙"];
  var SYMBOLS = new Map(POOL.map(function (symbol, index) { return [symbol, index]; }));
  var LIMITS = { textCharacters: 4000, cipherCharacters: 150000, inputUnits: 300000, passwordUnits: 256 };
  var MAGIC = 0xd34e0001;
  var crcTable = new Uint32Array(256);
  for (var t = 0; t < 256; t++) {
    var value = t;
    for (var bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    crcTable[t] = value >>> 0;
  }

  function fail(code) { var error = new Error(code); error.code = code; throw error; }
  function countCharacters(text) { var count = 0; for (var character of text) count++; return count; }
  function validateInput(text, password) {
    if (typeof text !== "string" || typeof password !== "string") fail("invalid-input");
    if (text.length > LIMITS.inputUnits) fail("cipher-limit");
    if (password.length > LIMITS.passwordUnits) fail("key-limit");
  }
  function fnv1a(bytes) {
    var hash = 0x811c9dc5;
    for (var i = 0; i < bytes.length; i++) hash = Math.imul(hash ^ bytes[i], 0x01000193);
    return hash >>> 0;
  }
  function makePRNG(seed) {
    var state = seed >>> 0;
    return function () {
      state ^= state << 13; state >>>= 0;
      state ^= state >> 17;
      state ^= state << 5; state >>>= 0;
      return state >>> 0;
    };
  }
  function keyedPerm(seed) {
    var random = makePRNG(seed), permutation = [];
    for (var i = 0; i < POOL.length; i++) permutation.push(i);
    for (var j = POOL.length - 1; j > 0; j--) {
      var k = random() % (j + 1), previous = permutation[j];
      permutation[j] = permutation[k]; permutation[k] = previous;
    }
    return permutation;
  }
  function pickFiller(random) {
    var value = random();
    if (value % 2 === 0) return value % 4 < 2 ? "鹿" : "🦌";
    return POOL[random() % POOL.length];
  }
  function crc32(bytes) {
    var crc = 0xffffffff;
    for (var i = 0; i < bytes.length; i++) crc = crcTable[(crc ^ bytes[i]) & 255] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }
  function encodeFrame(bytes, password) {
    var seed = fnv1a(new TextEncoder().encode(password)), permutation = keyedPerm(seed);
    var gapRandom = makePRNG((seed ^ 0x9e3779b9) >>> 0), fillerRandom = makePRNG((seed ^ 0x85ebca6b) >>> 0);
    var output = [];
    for (var i = 0; i < bytes.length * 2; i++) {
      var gap = gapRandom() % 4;
      for (var g = 0; g < gap; g++) output.push(pickFiller(fillerRandom));
      var nibble = i % 2 ? bytes[i >>> 1] & 15 : bytes[i >>> 1] >>> 4;
      output.push(POOL[permutation[nibble]]);
    }
    return output.join("");
  }
  function encrypt(text, password) {
    password = password || "";
    validateInput(text, password);
    if (countCharacters(text) > LIMITS.textCharacters) fail("text-limit");
    var bytes = new TextEncoder().encode(text);
    // 不让不完整的UTF-16代理项在编码时被悄悄替换。
    if (new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes) !== text) fail("invalid-text");
    var frame = new Uint8Array(12 + bytes.length), view = new DataView(frame.buffer);
    view.setUint32(0, MAGIC);
    view.setUint32(4, bytes.length);
    view.setUint32(8, crc32(bytes));
    frame.set(bytes, 12);
    return encodeFrame(frame, password);
  }
  function decodeFrame(cipher, password) {
    validateInput(cipher, password);
    var characters = [];
    for (var character of cipher) {
      if (SYMBOLS.has(character)) characters.push(character);
      if (characters.length > LIMITS.cipherCharacters) fail("cipher-limit");
    }
    if (!characters.length) fail("invalid-cipher");
    var seed = fnv1a(new TextEncoder().encode(password)), permutation = keyedPerm(seed), inverse = [];
    for (var i = 0; i < permutation.length; i++) inverse[permutation[i]] = i;
    var gapRandom = makePRNG((seed ^ 0x9e3779b9) >>> 0), fillerRandom = makePRNG((seed ^ 0x85ebca6b) >>> 0);
    var nibbles = [], position = 0;
    while (position < characters.length) {
      var gap = gapRandom() % 4;
      if (position + gap >= characters.length) fail("invalid-cipher");
      for (var g = 0; g < gap; g++) {
        if (characters[position++] !== pickFiller(fillerRandom)) fail("invalid-cipher");
      }
      nibbles.push(inverse[SYMBOLS.get(characters[position++])]);
    }
    if (nibbles.length < 8 || nibbles.length % 2) fail("invalid-cipher");
    var frame = new Uint8Array(nibbles.length / 2);
    for (var n = 0; n < frame.length; n++) frame[n] = (nibbles[n * 2] << 4) | nibbles[n * 2 + 1];
    return frame;
  }
  function decryptDetailed(cipher, password) {
    var frame = decodeFrame(cipher, password || ""), view = new DataView(frame.buffer);
    var marker = view.getUint32(0), format = marker === MAGIC ? "v1" : "legacy";
    var headerLength = format === "v1" ? 12 : 4;
    if (frame.length < headerLength) fail("invalid-cipher");
    var length = format === "v1" ? view.getUint32(4) : marker;
    if (frame.length !== headerLength + length) fail("invalid-cipher");
    var bytes = frame.subarray(headerLength);
    if (format === "v1" && view.getUint32(8) !== crc32(bytes)) fail("invalid-cipher");
    var text;
    try { text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes); }
    catch (error) { fail("invalid-cipher"); }
    return { text: text, format: format };
  }
  function decrypt(cipher, password) { return decryptDetailed(cipher, password).text; }
  function looksLikeCipher(text) {
    var total = 0, symbols = 0;
    for (var character of text) { total++; if (SYMBOLS.has(character)) symbols++; }
    return total >= 4 && symbols / total > 0.6;
  }
  function convert(mode, text, password) {
    validateInput(text, password || "");
    if (!text) fail("empty-input");
    if (mode === "smart") mode = looksLikeCipher(text) ? "decrypt" : "encrypt";
    if (mode !== "encrypt" && mode !== "decrypt") fail("invalid-input");
    var decoded = mode === "encrypt" ? { text: encrypt(text, password), format: "v1" } : decryptDetailed(text, password);
    var offsets = [], offset = 0;
    for (var character of decoded.text) { offset += character.length; offsets.push(offset); }
    return { mode: mode, text: decoded.text, format: decoded.format, ends: new Uint32Array(offsets) };
  }
  var api = { encrypt: encrypt, decrypt: decrypt, decryptDetailed: decryptDetailed, looksLikeCipher: looksLikeCipher, convert: convert, POOL: POOL, LIMITS: LIMITS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DeerCodec = api;
})(typeof self !== "undefined" ? self : globalThis);
