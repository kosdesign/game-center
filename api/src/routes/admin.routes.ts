import { Router } from 'express'
import { AdminController } from '../controllers/admin.controller'
import { authenticate } from '../middleware/auth.middleware'
import { authorizeRoles } from '../middleware/authorize.middleware'
import { validate } from '../middleware/validation.middleware'
import { CreateAdminSchema, UpdateAdminSchema } from '@shared/types'

const router = Router()
const adminController = new AdminController()

router.get('/', authenticate, authorizeRoles('admin'), adminController.getAllAdmins)
router.post('/', authenticate, authorizeRoles('admin'), validate(CreateAdminSchema), adminController.createAdmin)
router.get('/:id', authenticate, authorizeRoles('admin'), adminController.getAdmin)
router.put('/:id', authenticate, authorizeRoles('admin'), validate(UpdateAdminSchema), adminController.updateAdmin)
router.delete('/:id', authenticate, authorizeRoles('admin'), adminController.deleteAdmin)

export default router
