import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { validate } from '../middleware/validation.middleware'
import { LoginSchema } from '@shared/types'

const router = Router()
const authController = new AuthController()

router.post('/login', validate(LoginSchema), authController.login)

export default router
