import { Router } from 'express'
import { GameParentController } from '../controllers/gameParent.controller'
import { authenticateToken } from '../middleware/auth.middleware'
import { authorizeRoles } from '../middleware/authorize.middleware'

const router = Router()
const gameParentController = new GameParentController()

router.get('/', gameParentController.getAllGameParents)
router.get('/:id', gameParentController.getGameParentById)

router.post('/', authenticateToken, gameParentController.createGameParent)
router.put('/:id', authenticateToken, gameParentController.updateGameParent)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), gameParentController.deleteGameParent)

export default router
