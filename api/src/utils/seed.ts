import dotenv from 'dotenv'
import { connectDatabase, disconnectDatabase } from '../config/database'
import { AdminRepository } from '../repositories/Admin.repository'
import { GameParentRepository } from '../repositories/GameParent.repository'
import { GameDetailsRepository } from '../repositories/GameDetails.repository'
import { generateApiToken } from './tokenGenerator'

dotenv.config()

const seedData = async () => {
  try {
    await connectDatabase()
    console.log('🌱 Starting database seed...')

    const adminRepo = new AdminRepository()
    const gameParentRepo = new GameParentRepository()
    const gameDetailsRepo = new GameDetailsRepository()

    const existingAdmin = await adminRepo.findByUsername('admin')
    if (!existingAdmin) {
      await adminRepo.create({
        admin_id: 'admin001',
        username: 'admin',
        password: 'admin123',
        email: 'admin@gamecenter.com',
        role: 'admin'
      })
      console.log('✅ Admin user created (username: admin, password: admin123)')
    } else {
      console.log('ℹ️  Admin user already exists')
    }

    const games = [
      {
        parent: {
          game_id: 'game001',
          game_name: 'Battle Royale Arena',
          api_token: generateApiToken('game001'),
          is_active: true
        },
        details: {
          game_id: 'game001',
          game_version: '1.0',
          description: 'Fast-paced battle royale game with 100 players',
          port_type: 'fixed' as const,
          port: 3000,
          api_url: 'https://api-prod.nakamoto.com/battle-royale',
          type: 'PROD' as const,
          match_making_url: 'https://matchmaking.nakamoto.com/battle-royale',
          server_game_ip: '192.168.1.100',
          server_game_type: 'UDP' as const,
          is_active: true
        }
      },
      {
        parent: {
          game_id: 'game002',
          game_name: 'Racing Champions',
          api_token: generateApiToken('game002'),
          is_active: true
        },
        details: {
          game_id: 'game002',
          game_version: '2.1',
          description: 'High-speed racing game with multiplayer support',
          port_type: 'range' as const,
          port_start: 4000,
          port_end: 4010,
          api_url: 'https://api-test.nakamoto.com/racing',
          type: 'TEST' as const,
          match_making_url: 'https://matchmaking-test.nakamoto.com/racing',
          server_game_ip: '192.168.1.101',
          server_game_type: 'TCP' as const,
          is_active: true
        }
      },
      {
        parent: {
          game_id: 'game003',
          game_name: 'Space Warriors',
          api_token: generateApiToken('game003'),
          is_active: true
        },
        details: {
          game_id: 'game003',
          game_version: '1.5',
          description: 'Epic space combat with strategic gameplay',
          port_type: 'fixed' as const,
          port: 5000,
          api_url: 'https://api-uat.nakamoto.com/space-warriors',
          type: 'UAT' as const,
          server_game_ip: '192.168.1.102',
          server_game_type: 'UDP' as const,
          is_active: true
        }
      },
      {
        parent: {
          game_id: 'game004',
          game_name: 'Fantasy Quest Online',
          api_token: generateApiToken('game004'),
          is_active: true
        },
        details: {
          game_id: 'game004',
          game_version: '3.0',
          description: 'MMORPG with rich storyline and character progression',
          port_type: 'range' as const,
          port_start: 6000,
          port_end: 6050,
          api_url: 'https://api-prod.nakamoto.com/fantasy-quest',
          type: 'PROD' as const,
          match_making_url: 'https://matchmaking.nakamoto.com/fantasy',
          server_game_ip: '192.168.1.103',
          server_game_type: 'TCP' as const,
          is_active: true
        }
      },
      {
        parent: {
          game_id: 'game005',
          game_name: 'Zombie Survival',
          api_token: generateApiToken('game005'),
          is_active: true
        },
        details: {
          game_id: 'game005',
          game_version: '1.2',
          description: 'Cooperative zombie survival shooter',
          port_type: 'fixed' as const,
          port: 7000,
          api_url: 'https://api-prod.nakamoto.com/zombie',
          type: 'PROD' as const,
          server_game_ip: '192.168.1.104',
          server_game_type: 'UDP' as const,
          is_active: true
        }
      }
    ]

    for (const game of games) {
      const exists = await gameParentRepo.exists(game.parent.game_id)
      if (!exists) {
        await gameParentRepo.create(game.parent)
        await gameDetailsRepo.create(game.details)
        console.log(`✅ Created game: ${game.parent.game_name} (${game.details.type})`)
      } else {
        console.log(`ℹ️  Game already exists: ${game.parent.game_name}`)
      }
    }

    const game001v2Exists = await gameDetailsRepo.exists('game001', '2.0')
    if (!game001v2Exists) {
      await gameDetailsRepo.create({
        game_id: 'game001',
        game_version: '2.0',
        description: 'Battle Royale with new maps and weapons',
        port_type: 'fixed',
        port: 3005,
        api_url: 'https://api-test.nakamoto.com/battle-royale-v2',
        type: 'TEST',
        match_making_url: 'https://matchmaking-test.nakamoto.com/battle-royale-v2',
        server_game_ip: '192.168.1.105',
        server_game_type: 'UDP',
        is_active: true
      })
      console.log('✅ Created Battle Royale Arena v2.0 (TEST)')
    }

    console.log('\n🎉 Database seed completed successfully!')
    console.log('\n📝 Login credentials:')
    console.log('   Username: admin')
    console.log('   Password: admin123')
    console.log('\n🎮 Games created:')
    console.log('   - 5 games with different types (PROD, TEST, UAT)')
    console.log('   - Battle Royale Arena has 2 versions (1.0 PROD, 2.0 TEST)')

    await disconnectDatabase()
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    await disconnectDatabase()
    process.exit(1)
  }
}

seedData()
