import { Router } from 'express'
import { getAdminScores } from '../controllers/adminController.js'
import { adminMiddleware } from '../middleware/adminMiddleware.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const adminRouter = Router()

adminRouter.get('/admin/scores', authMiddleware, adminMiddleware, getAdminScores)

export default adminRouter
