import { Request, Response, NextFunction } from 'express'
import { AdminService } from '../services/admin.service'
import { CreateAdminInput, UpdateAdminInput } from '@shared/types'

export class AdminController {
  private adminService: AdminService

  constructor() {
    this.adminService = new AdminService()
  }

  createAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: CreateAdminInput = req.body
      const admin = await this.adminService.createAdmin(data)

      res.status(201).json({
        success: true,
        data: admin,
        message: 'Admin created successfully',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      next(error)
    }
  }

  getAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const admin = await this.adminService.getAdminById(id)

      if (!admin) {
        res.status(404).json({
          success: false,
          error: 'Admin not found',
          timestamp: new Date().toISOString()
        })
        return
      }

      res.status(200).json({
        success: true,
        data: admin,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      next(error)
    }
  }

  getAllAdmins = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const admins = await this.adminService.getAllAdmins()

      res.status(200).json({
        success: true,
        data: admins,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      next(error)
    }
  }

  updateAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const data: UpdateAdminInput = req.body

      const admin = await this.adminService.updateAdmin(id, data)

      res.status(200).json({
        success: true,
        data: admin,
        message: 'Admin updated successfully',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      next(error)
    }
  }

  deleteAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      await this.adminService.deleteAdmin(id)

      res.status(200).json({
        success: true,
        message: 'Admin deleted successfully',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      next(error)
    }
  }
}
