const keys = {};

export default function makeEncryptor(password) {
  async function getPasswordKey(password) {
    if (keys[password]) return keys[password];
    const salt = new Uint8Array([215, 75, 51, 27, 82, 113, 30, 204]);
    return keys[password] = await (async () => {
      const enc = new TextEncoder();
      const raw = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"],
      );
      const key = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        raw,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"],
      );

      keys[password] = key;
      return key;
    })();
  }
  async function encrypt(message, initializationVector = new ArrayBuffer(16)) {
    const key = await getPasswordKey(password);
    const encoder = new TextEncoder();
    encodedMessage = encoder.encode(message);
    // iv will be needed for decryption
    return await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: initializationVector },
      key,
      encodedMessage,
    );
  }

  async function decrypt(ciphertext, initializationVector = new ArrayBuffer(16)) {
    const key = await getPasswordKey(password);
    const decryptedText = await window.crypto.subtle.decrypt(
      // The iv value must be the same as that used for encryption
      { name: "AES-GCM", iv: initializationVector },
      key,
      ciphertext,
    );

    const utf8Decoder = new TextDecoder();
    return utf8Decoder.decode(decryptedText);
  }

  return { encrypt, decrypt };
}