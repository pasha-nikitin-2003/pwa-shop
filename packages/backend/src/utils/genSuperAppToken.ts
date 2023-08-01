import crypto from "crypto"
const sha = require("js-sha256");
const IV_LENGTH = 16; // For AES, this is always 16

const payload = {
  access_token: "",
  iat: Date.now() / 1000,
  exp: Date.now() / 1000 + 60 * 60,
};

const serviceKey =
  "65e43d1965e43d1965e43d190466f11494665e465e43d19012345f838b4e2d67130f219"; // Сервисный ключ приложения (можно получить в настройках приложения VK)

async function sha256(message: string) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => ("00" + b.toString(16)).slice(-2))
    .join("");
  return hashHex;
}

function encrypt(text: string, key: string) {
  const [encryptKey, signKey] = prepareKeys(key);

  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv("aes-256-cbc", encryptKey, iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);
  encrypted = Buffer.concat([iv, encrypted]);
  let signature = hmac(encrypted, signKey);

  return Buffer.concat([signature, encrypted]).toString("base64");
}

function prepareKeys(key: string) {
  const hash = crypto.createHash("sha256");
  hash.update(key);
  const hashed = hash.digest();

  return [hashed.slice(0, 32), hashed.slice(32)];
}

function hmac(data: Buffer, key: Buffer) {
  return crypto.createHmac("sha256", key).update(data).digest();
}

export async function genSuperAppToken(accessToken: string) {
  const key = await sha256(serviceKey); // Строка/buffer длинной 32 байта
  payload.access_token = accessToken
  const [iv, ciphertext] = encrypt(JSON.stringify(payload), key); // AES-CBC-256 шифрование
  const signature = sha.hmac(iv + ciphertext, key);
  const superAppToken = btoa(signature + iv + ciphertext);

  return superAppToken;
}
