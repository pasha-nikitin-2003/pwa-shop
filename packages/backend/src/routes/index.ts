import { Router } from 'express'
import { generateSuperAppToken } from './generateSuperAppToken'

const router = Router()

router.route('/generate-superapp-token').post(generateSuperAppToken)

export default router
