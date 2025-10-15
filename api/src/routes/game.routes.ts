import { Router } from 'express'
import { GameController } from '../controllers/game.controller'
import { validate } from '../middleware/validation.middleware'
import { authenticateToken } from '../middleware/auth.middleware'
import { CreateGameSchema, UpdateGameSchema } from '@shared/types'

const router = Router()
const gameController = new GameController()

router.get('/:id', gameController.getGameById)
router.get('/', gameController.getAllGames)

router.post(
  '/',
  authenticateToken,
  validate(CreateGameSchema),
  gameController.createGame
)

router.put(
  '/:id',
  authenticateToken,
  validate(UpdateGameSchema),
  gameController.updateGame
)

router.delete(
  '/:id',
  authenticateToken,
  gameController.deleteGame
)

export default router
