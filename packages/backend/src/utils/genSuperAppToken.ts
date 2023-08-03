import crypto from 'crypto'

const IV_LENGTH = 16 // For AES, this is always 16

/** AES-CBC-256 шифрование */
function encrypt(text: string, key: string | Buffer) {
  let [encryptKey, signKey] = prepareKeys(key)
  signKey = encryptKey

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

/** Создание подписанного сообщения */
function hmac(data: Buffer | string, key: Buffer | string) {
  return crypto.createHmac('sha256', key).update(data).digest()
}

/** Создание токена */
export async function genSuperAppToken(accessToken: string) {
  const payload = {
    access_token: accessToken,
    iat: Date.now() / 1000,
    exp: Date.now() / 1000 + 60 * 60
  }
  const serviceKey = process.env.SERVICE_TOKEN as string

  return encrypt(JSON.stringify(payload), serviceKey)
}