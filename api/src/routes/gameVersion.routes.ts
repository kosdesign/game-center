import { Router } from 'express'
import { GameVersionController } from '../controllers/gameVersion.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()
const gameVersionController = new GameVersionController()

router.get('/:gameId/versions', gameVersionController.getVersionsByGameId)
router.post('/:gameId/versions', authenticateToken, gameVersionController.createVersion)
router.put('/:gameId/versions/:version', authenticateToken, gameVersionController.updateVersion)
router.delete('/:gameId/versions/:version', authenticateToken, gameVersionController.deleteVersion)

router.get('/:gameId/versions/:version/changelog', gameVersionController.getVersionChangelog)
router.get('/:gameId/changelog', gameVersionController.getGameChangelog)

export default router
