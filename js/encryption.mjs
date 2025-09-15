// The goal is a generator that creates a function that decodes a string.
// The string is a secret that should not be in the source code.
// The generator will be run manually to create the function.
// The function will be called at runtime to get the secret.
// The secret is in the form of a string.

// The API is that we take in a string and return an encoder/decoder pair



/*
Get some key material to use as input to the deriveKey method.
The key material is a password supplied by the user.
*/

async function encrypt(password, plaintext, salt, iv) {
  const key = await getPasswordKey(password);

  return window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
}

const keys = {};

export default function makeEncryptor(password) {

  async function getPasswordKey(password) {
    if (keys[password]) return keys[password];
    return keys[password] = await (async () => {
      const enc = new TextEncoder();
      const raw = window.crypto.subtle.importKey(
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
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"],
      );

      keys[password] = key;
      return key;
    })();
  }
  async function encrypt(message, initializationVector) {
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

  async function decrypt(ciphertext, initializationVector) {
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