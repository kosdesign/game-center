import dotenv from 'dotenv'
import { connectDatabase, disconnectDatabase } from '../config/database'
import { AdminModel } from '../models/Admin.model'
import { GameParentModel } from '../models/GameParent.model'
import { GameDetailsModel } from '../models/GameDetails.model'

dotenv.config()

const cleanDatabase = async () => {
  try {
    await connectDatabase()
    console.log('🧹 Starting database cleanup...')

    await AdminModel.deleteMany({})
    console.log('✅ Admins collection cleared')

    await GameDetailsModel.deleteMany({})
    console.log('✅ Game Details collection cleared')

    await GameParentModel.deleteMany({})
    console.log('✅ Game Parents collection cleared')

    console.log('\n🎉 Database cleaned successfully!')

    await disconnectDatabase()
    process.exit(0)
  } catch (error) {
    console.error('❌ Clean failed:', error)
    await disconnectDatabase()
    process.exit(1)
  }
}

cleanDatabase()
