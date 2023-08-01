import axios from 'axios'

export async function validateSuperAppToken(superAppToken: string) {
  const res2 = await axios.post(
    `https://api.vk.com/method/secure.validateSuperAppToken?v=5.156&access_token=65e43d1965e43d1965e43d190466f11494665e465e43d19012345f838b4e2d67130f219&token=${superAppToken}&from_app_id=51718541`
  )
  console.log(res2.data)
  return res2.data
}
