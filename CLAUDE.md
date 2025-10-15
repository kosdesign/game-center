# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Game Center เป็น full-stack application สำหรับจัดการข้อมูลเกม ประกอบด้วย:
- **Admin Panel**: React TypeScript frontend for game management
- **API Server**: Node.js/Express backend with RESTful API
- **Database**: MongoDB with Mongoose ODM

## Architecture & Design

### Data Model Relationships
- **GameParent** (game_id, game_name) → 1:N → **GameDetails** (versions per game)
- Combined view merges parent + details for API responses
- Admin authentication with JWT tokens

### Key Design Patterns
- **Layered Architecture**: Controller → Service → Repository
- **Two-collection structure**: GameParent (master) + GameDetails (versions)
- **Combined responses**: API returns merged GameParent + GameDetails data
- **Environment types**: PROD, TEST, UAT for deployment classification
- **Protocol support**: UDP/TCP for server_game_type

### Repository Pattern
When implementing data access:
- **GameParentRepository**: Manages game master records (game_id, game_name)
- **GameDetailsRepository**: Manages game versions with parent references
- **Combined operations**: Create/update should handle parent creation if not exists
- **Filtering**: Support by environment type (PROD/TEST/UAT) and active status

## Data Types & Validation

### Core Interfaces (from design.md:113-207)
```typescript
// GameParent: game_id, game_name, is_active
// GameDetails: game_id (ref), game_version, description, port, api_url,
//              type (PROD|TEST|UAT), match_making_url, server_game_ip,
//              server_game_type (UDP|TCP), is_active
// Admin: admin_id, username, password_hash, email, role
```

### Required Fields (Requirement 4)
- game_id (unique), game_name, game_version, description
- port, api_url, server_game_ip
- type (PROD/TEST/UAT), server_game_type (UDP/TCP)
- match_making_url

## API Endpoints (design.md:84-98)

### Admin (authenticated)
```
POST   /api/auth/login
GET    /api/admin/games
POST   /api/admin/games
PUT    /api/admin/games/:id
DELETE /api/admin/games/:id
```

### Public
```
GET    /api/games/:id          # Single game by ID
GET    /api/games              # List with filters
GET    /api/health
```

## Implementation Guidelines

### Security Requirements (Requirement 5)
- JWT-based authentication for admin endpoints
- bcrypt password hashing
- Session management with token expiration
- Protected routes require authentication middleware
- Rate limiting and input sanitization

### Error Handling Standards (design.md:221-248)
- **200**: Success
- **201**: Created
- **400**: Validation errors
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict (duplicate game_id)
- **500**: Internal Server Error

Response format:
```typescript
{
  success: boolean,
  data?: T,
  error?: string,
  message?: string,
  timestamp: string
}
```

### Testing Strategy (design.md:257-315)
- **Backend**: Jest + Supertest + MongoDB Memory Server
- **Frontend**: Jest + React Testing Library + Cypress
- **Coverage**: Unit → Integration → E2E
- Unit tests for service/repository layers
- Integration tests for API endpoints
- E2E tests for complete admin workflows

### Performance Considerations (design.md:341-357)
- Database indexes on game_id and frequently queried fields
- Connection pooling for database
- Pagination for large datasets
- Caching for frequently accessed game data
- Code splitting and lazy loading for frontend

## Project Structure (Expected)

```
game-center/
├── admin/              # React TypeScript frontend
│   ├── src/
│   │   ├── components/ # LoginPage, Dashboard, GameForm, GameList, GameCard
│   │   ├── services/   # GameService, AuthService
│   │   ├── types/      # TypeScript interfaces
│   │   └── hooks/      # Authentication context
│   └── package.json
├── api/                # Node.js backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/ # GameParentRepository, GameDetailsRepository, AdminRepository
│   │   ├── models/     # Mongoose schemas
│   │   ├── middleware/ # Auth, validation, error handling
│   │   └── routes/
│   └── package.json
├── shared/             # Shared TypeScript types
│   └── types/
└── .kiro/specs/        # Project specifications (DO NOT MODIFY)
```

## Implementation Status

See `.kiro/specs/game-center/tasks.md` for detailed implementation plan.

**Completed:**
- Project structure setup (Task 1)
- Shared TypeScript interfaces (Task 2.1)
- Data validation schemas (Task 2.2)
- MongoDB connection setup (Task 3.1)
- Mongoose schemas (Task 3.2)

**In Progress:**
- Repository pattern implementation (Task 3.3, 3.4)

**Pending:**
- API server foundation (Tasks 4.x)
- React admin panel (Tasks 5.x)
- Testing suite (Tasks 6.x)
- Security & performance (Tasks 7.x)
- Deployment setup (Tasks 8.x)

## Development Notes

### When Creating Repositories
- Implement findByGameId, create, update, delete, findAll with filters
- Handle parent-child relationship in combined operations
- Add proper error handling for duplicate game_id
- Include is_active filtering capabilities

### When Building Admin Panel
- Use Material-UI or Ant Design for UI framework
- Implement real-time form validation
- Add confirmation dialogs for destructive operations (delete)
- Show success/error notifications for all operations
- Pre-populate forms when editing existing games

### When Implementing Authentication
- Store JWT in localStorage or httpOnly cookies
- Implement token refresh mechanism
- Redirect to login on 401 responses
- Clear auth state on logout

### Database Considerations
- game_id is unique identifier across GameParent
- GameDetails references GameParent via game_id
- Multiple GameDetails records can exist per GameParent (versions)
- Index game_id, type, and is_active fields
- created_at and updated_at timestamps on all collections
