import axios from 'axios'

const ACCESS_GEN_URL = 'https://api.vk.com/method/auth.exchangeSilentAuthToken'

/** Генерация токена по silent токену */
export async function genAccessToken(silentToken: string, uuid: string) {
  const res = await axios({
    method: 'get',
    url: `${ACCESS_GEN_URL}?v=5.131&token=${silentToken}&access_token=${process.env.SERVICE_TOKEN}&uuid=${uuid}`,
  })

  if (res.data.response?.access_token)
    return res.data.response.access_token 
  else return "error"
}
