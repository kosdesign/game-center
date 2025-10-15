import { Router } from 'express'
import { OpenApiController } from '../controllers/openApi.controller'

const router = Router()
const openApiController = new OpenApiController()

router.post('/info', openApiController.getGameInfo)

export default router
