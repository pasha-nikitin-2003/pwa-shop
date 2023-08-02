import axios from 'axios'

const VALIDATION_URL = 'https://api.vk.com/method/secure.validateSuperAppToken'

/** Валидация токена */
export async function validateSuperAppToken(superAppToken: string) {
  return (
    await axios.post(
      `${VALIDATION_URL}?v=5.156&access_token=${process.env.SERVICE_TOKEN}&token=${superAppToken}&from_app_id=51718541`
    )
  ).data
}
