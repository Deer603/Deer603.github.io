const test = require("node:test");
const assert = require("node:assert/strict");
const codec = require("./codec-core.js");

// 旧版脚本生成的固定样本，避免用新版编码器验证兼容性。
const legacy = {
  text: "hello 603", password: "603",
  cipher: "鹿🌈🌈🌈鹿🌈鹿🌸🌈鹿🍃🌈鹿鹿🌈鹿🌟🦌🌼💫🦌⭐🌼🦌🦌🍃鹿鹿🦌🌼鹿鹿🌙🌼🌿🌙🌼🌺🌼🌟✨🦌鹿🌈🦌💫🦌🌼🦌🦌🐾💫🦌⭐🌈🌙💮💫鹿🦌🍃💫"
};
const legacyUnicode = "🌿🍀🍀鹿🦌🍀🍀鹿🍀💫🍀🦌🌼🍀✨🐾⭐⭐🦌🌟🍃🌿🐾💫🌟🌟鹿鹿🦌🦌🦌鹿⭐🌟🍀鹿🦌🌙💫🍃✨🌺🦌🌺🦌鹿🌺🌿鹿鹿🌙鹿🌟💮🦌✨✨💮🌸🍀💮🌟💮🦌鹿✨💫💮🌟🦌🌙鹿🌿鹿🌟⭐🌈🐾🍀🦌🍀🦌🌺🦌🌈🌙✨鹿鹿✨🌙🌈鹿🌟🦌鹿🌈🌼鹿🍀🌙🦌鹿💫鹿🌺💮✨🦌鹿⭐🦌💫✨🦌鹿🍃✨✨🍃🦌✨🌸🌼鹿🌟鹿🌼鹿🦌🌟🌺🦌⭐";

test("新版密文保留Unicode、换行、BOM、空密钥与字符边界", () => {
  for (const password of ["", "鹿群603🔑"]) {
    const text = "\uFEFF今晚603见🦌\nCafé👩‍💻\u0000";
    const cipher = codec.encrypt(text, password);
    assert.deepEqual(codec.decryptDetailed(cipher, password), { text, format: "v1" });
    const converted = codec.convert("decrypt", cipher, password);
    assert.equal(converted.ends.length, Array.from(text).length);
    assert.equal(converted.ends.at(-1), text.length);
    for (const end of converted.ends) assert.ok(!/[\uD800-\uDBFF]$/.test(text.slice(0, end)));
    assert.equal(codec.convert("smart", cipher, password).mode, "decrypt");
    assert.equal(codec.convert("smart", "今晚603见", password).mode, "encrypt");
  }
});

test("正常旧版密文、Unicode与复制带入的空白仍可读取", () => {
  assert.deepEqual(codec.decryptDetailed(legacy.cipher, legacy.password), { text: legacy.text, format: "legacy" });
  assert.equal(codec.decrypt(legacyUnicode, "鹿群"), "今晚603见🦌\nCafé");
  const symbols = Array.from(legacy.cipher);
  assert.equal(codec.decrypt("  " + symbols.slice(0, 4).join("") + "\n" + symbols.slice(4).join(""), "603"), legacy.text);
});

test("旧版长度头损坏不再静默截断，附加或删除符号均拒绝", () => {
  const changed = Array.from(legacy.cipher);
  changed[15] = "🦌";
  for (const cipher of [changed.join(""), legacy.cipher + "鹿", Array.from(legacy.cipher).slice(0, -1).join("")]) {
    assert.throws(() => codec.decrypt(cipher, "603"), { code: "invalid-cipher" });
  }
  const invalidUtf8 = "鹿🌈🌈🌈鹿🌈鹿🌸🌈鹿🍃🌈鹿鹿🌈🍀🌟🦌🌺💫🦌🌺";
  assert.throws(() => codec.decrypt(invalidUtf8, "603"), { code: "invalid-cipher" });
});

test("新版密文的任一单符号替换、截断及错误密钥均拒绝", () => {
  const cipher = codec.encrypt("hello 603🦌", "603"), characters = Array.from(cipher);
  for (let index = 0; index < characters.length; index++) {
    const changed = characters.slice();
    changed[index] = codec.POOL[(codec.POOL.indexOf(changed[index]) + 1) % codec.POOL.length];
    assert.throws(() => codec.decrypt(changed.join(""), "603"), { code: "invalid-cipher" });
  }
  assert.throws(() => codec.decrypt(characters.slice(0, -1).join(""), "603"), { code: "invalid-cipher" });
  assert.throws(() => codec.decrypt(cipher, "wrong-key"), { code: "invalid-cipher" });
  assert.throws(() => codec.decrypt(legacy.cipher, "wrong-key"), { code: "invalid-cipher" });
});

test("边界内容可正常转换，超限输入和不完整Unicode明确拒绝", () => {
  const text = "🦌".repeat(codec.LIMITS.textCharacters);
  assert.equal(codec.decrypt(codec.encrypt(text, ""), ""), text);
  assert.throws(() => codec.encrypt(text + "鹿", ""), { code: "text-limit" });
  assert.throws(() => codec.encrypt("hello", "x".repeat(257)), { code: "key-limit" });
  assert.throws(() => codec.decrypt("鹿".repeat(150001), ""), { code: "cipher-limit" });
  assert.throws(() => codec.encrypt("\ud800", ""), { code: "invalid-text" });
});
