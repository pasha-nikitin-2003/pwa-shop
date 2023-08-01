import { Request, Response } from 'express'
import { genAccessToken } from '../utils/genAccessToken'
import { genSuperAppToken } from '../utils/genSuperAppToken'

export async function generateSuperAppToken(req: Request, res: Response) {
  const token = req.body.silentToken
  const uuid = req.body.uuid

  const accessToken = await genAccessToken(token, uuid)
  const superAppToken = await genSuperAppToken(accessToken)
  return res.status(200).json({ superAppToken, accessToken })
}
