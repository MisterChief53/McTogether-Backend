# Authentication System Design

## Overview
This document outlines the design for implementing a simple but secure authentication system for the MC Together application. The system will use JWT-based authentication with email/password login, replacing the current hardcoded user IDs system.

## Core Features
1. User Registration
2. User Login
3. JWT-based Authentication
4. Frontend Token Management

## Data Models

### User (Updated)
```typescript
interface User {
  _id: string;          // MongoDB ObjectId
  email: string;        // Unique email address
  username: string;     // Unique username
  password: string;     // Hashed password
  currency: number;     // User's currency balance
  groupId?: string;     // Reference to current group (if any)
  role?: 'leader' | 'member';  // Role in current group
}
```

### Auth Token
```typescript
interface AuthToken {
  token: string;        // JWT token
  expiresIn: number;    // Token expiration time in seconds
}
```

## Authentication Flow
1. User registers with email, username, and password
2. Password is hashed using bcrypt before storage
3. User logs in with email/username and password
4. Server validates credentials and returns JWT
5. Frontend stores JWT in AsyncStorage
6. All subsequent requests include JWT in Authorization header

## API Endpoints

### Auth Endpoints
- `POST /auth/register` - Register new user
  ```typescript
  Request Body: {
    email: string;
    username: string;
    password: string;
  }
  Response: {
    user: {
      _id: string;
      email: string;
      username: string;
      currency: number;
    };
    token: string;
  }
  ```

- `POST /auth/login` - Login user
  ```typescript
  Request Body: {
    email: string;
    password: string;
  }
  Response: {
    user: {
      _id: string;
      email: string;
      username: string;
      currency: number;
    };
    token: string;
  }
  ```

- `GET /auth/me` - Get current user info
  ```typescript
  Response: {
    _id: string;
    email: string;
    username: string;
    currency: number;
    groupId?: string;
    role?: 'leader' | 'member';
  }
  ```

## Frontend Implementation

### Token Storage
- Use Expo's AsyncStorage for JWT storage
- Simple implementation that works in Expo Go
- Persists between app restarts
- Example usage:
  ```typescript
  // Save token
  await AsyncStorage.setItem('jwt', token);
  
  // Get token
  const token = await AsyncStorage.getItem('jwt');
  ```

### API Request Headers
- Add JWT to all API requests:
  ```typescript
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
  ```

### Auth Context
- Create React Context for auth state
- Handle token storage/retrieval
- Manage user session state
- Provide login/logout functions

## Security Considerations
1. Passwords are hashed using bcrypt
2. JWT tokens have expiration (24 hours)
3. Use HTTPS in production
4. Input validation for all auth endpoints
5. Rate limiting for login attempts

## Database Reset
- Modify existing seed service to:
  - Drop existing collections
  - Create new users with proper auth fields
  - Add test users with known credentials
Remember to still do this at start and avoid changes if users are already present
- Example test users:
  ```typescript
  const testUsers = [
    {
      email: 'test1@example.com',
      username: 'test1',
      password: 'password1',
      currency: 1000
    },
    // ... more test users
  ];
  ```

## Error Cases to Handle
1. Invalid credentials
2. Email already registered
3. Username already taken
4. Invalid token
5. Expired token
6. Missing token

## Implementation Stages

### Stage 1: Backend Setup
1. Add auth dependencies
2. Update User schema
3. Implement password hashing
4. Create auth module and service

### Stage 2: Auth Endpoints
1. Implement registration
2. Implement login
3. Add JWT generation
4. Create protected routes

### Stage 3: Frontend Integration
1. Add AsyncStorage setup
2. Create auth context
3. Implement login/register screens
4. Add token to API requests

### Stage 4: Testing & Cleanup
1. Test auth flow
2. Update seed service
3. Remove old user ID system
4. Add error handling

## Future Considerations
1. Password reset functionality
2. Email verification
3. Social login integration
4. Refresh token implementation
5. Upgrade to SecureStore for token storage 