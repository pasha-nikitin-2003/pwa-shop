import { Router } from 'express'
import { getSuperAppToken } from './getSuperAppToken'

const router = Router()

router.route('/get-superapp-token').post(getSuperAppToken)

export default router
