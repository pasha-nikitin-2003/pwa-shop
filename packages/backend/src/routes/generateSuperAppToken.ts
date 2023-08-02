import { Request, Response } from 'express'
import { genAccessToken } from '../utils/genAccessToken'
import { genSuperAppToken } from '../utils/genSuperAppToken'
import { validateSuperAppToken } from '../utils/validateSuperAppToken'

/** Генерация superApp токена */
export async function generateSuperAppToken(req: Request, res: Response) {
  const token = req.body.silentToken
  const uuid = req.body.uuid

  const accessToken = await genAccessToken(token, uuid)
  const superAppToken = await genSuperAppToken(accessToken)
  const validation = await validateSuperAppToken(superAppToken)
  return res.status(200).json({ superAppToken, accessToken, validation })
}
