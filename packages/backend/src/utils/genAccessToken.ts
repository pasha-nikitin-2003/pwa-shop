import axios from 'axios'

export async function genAccessToken(silentToken: string, uuid: string) {
  const res = await axios({
    method: 'get',
    url: `https://api.vk.com/method/auth.exchangeSilentAuthToken?v=5.131&token=${silentToken}&access_token=${process.env.SERVICE_TOKEN}&uuid=${uuid}`,
  })

  return res.data.response.access_token as string
}
