import crypto from 'crypto'

const IV_LENGTH = 16 // For AES, this is always 16

/** AES-CBC-256 шифрование */
function encrypt(text: string, key: string | Buffer) {
  const [encryptKey, signKey] = prepareKeys(key)

  let iv = crypto.randomBytes(IV_LENGTH)
  let cipher = crypto.createCipheriv('aes-256-cbc', encryptKey, iv)
  let encrypted = cipher.update(text)

  encrypted = Buffer.concat([encrypted, cipher.final()])
  encrypted = Buffer.concat([iv, encrypted])
  let signature = hmac(encrypted, signKey)

  return Buffer.concat([signature, encrypted]).toString('base64')
}

/** Cоздание ключей */
function prepareKeys(key: string | Buffer) {
  const hash = crypto.createHash('sha256')
  hash.update(key)
  const hashed = hash.digest()

  return [hashed.slice(0, 32), hashed.slice(32)]
}

function hmac(data: Buffer | string, key: Buffer | string) {
  return crypto.createHmac('sha256', key).update(data).digest()
}

/** Создание токена */
export async function genSuperAppToken(accessToken: string) {
  const payload = {
    access_token: accessToken,
    iat: Date.now() / 1000,
    exp: Date.now() / 1000 + 60 * 60,
  }
  const serviceKey = process.env.SERVICE_TOKEN as string

  const key = crypto
    .createHash('sha256')
    .update(serviceKey)
    .digest()
    .slice(0, 32) // Строка/buffer длинной 32 байта

  const [iv, ciphertext] = encrypt(JSON.stringify(payload), key)
  const signature = [...hmac(iv + ciphertext, key)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')
  const superAppToken = btoa(signature + iv + ciphertext)

  return superAppToken
}
