# Group Management System Design

## Overview
This document outlines the design for the group management system backend API. The system allows users to create and join groups, with the first user to create a group becoming its leader.

## Core Features
1. User Management
2. Group Management
3. Currency System

## Data Models

### User
```typescript
interface User {
  _id: string;          // MongoDB ObjectId
  userId: number;       // User identifier (1-5)
  currency: number;     // User's currency balance
  groupId?: string;     // Reference to current group (if any)
  role?: 'leader' | 'member';  // Role in current group
}
```

### Group
```typescript
interface Group {
  _id: string;          // MongoDB ObjectId (used as group GUID)
  leaderId: number;     // User ID of the group leader
  members: number[];    // Array of member user IDs
  createdAt: Date;      // Group creation timestamp
  status: 'active' | 'disbanded';  // Group status
  name?: string;        // Optional group name
}
```

## User Identification Flow
1. Frontend presents users with options 1-5 to select their identity
2. Selected user ID is included in all API requests
3. Backend validates user ID exists and checks group-related constraints
4. No authentication required (hackathon simplification)

## API Endpoints

### User Endpoints
- `GET /users/:userId` - Get user information
  ```typescript
  Response: {
    userId: number;
    currency: number;
    groupId?: string;
    role?: 'leader' | 'member';
  }
  ```

- `PATCH /users/:userId/currency` - Update user currency
  ```typescript
  Request Body: {
    amount: number;  // Amount to add/subtract
  }
  ```

### Group Endpoints
- `POST /groups` - Create a new group
  ```typescript
  Request Body: {
    userId: number;  // User creating the group
    name?: string;   // Optional group name
  }
  Response: {
    groupId: string;
    leaderId: number;
  }
  ```

- `POST /groups/:groupId/join` - Join an existing group
  ```typescript
  Request Body: {
    userId: number;  // User joining the group
  }
  ```

- `GET /groups/:groupId` - Get group information
  ```typescript
  Response: {
    groupId: string;
    leaderId: number;
    members: number[];
    status: 'active' | 'disbanded';
    name?: string;
  }
  ```

- `DELETE /groups/:groupId` - Delete/disband group
  ```typescript
  Request Body: {
    userId: number;  // Must be the leader
  }
  ```

- `POST /groups/:groupId/leave` - Leave a group
  ```typescript
  Request Body: {
    userId: number;  // User leaving the group
  }
  ```

## Business Rules

### User Rules
1. Users are identified by IDs (1-5)
2. Each user has a currency balance
3. Users can only be in one group at a time
4. Users can either be a leader or member, not both

### Group Rules
1. First user to create a group becomes its leader
2. Only the leader can delete the group
3. Members can leave the group
4. If leader leaves, group is disbanded
5. Group must have at least one member (the leader)

## Implementation Stages

### Stage 1: Basic Setup
1. Set up MongoDB connection
2. Create User and Group models
3. Implement basic CRUD operations

### Stage 2: Core Group Features
1. Implement group creation
2. Implement group joining
3. Add group status management
4. Implement group deletion

### Stage 3: User Management
1. Implement user currency system
2. Add user-group relationship management
3. Implement group leaving functionality

### Stage 4: Validation & Error Handling
1. Add input validation
2. Implement error handling
3. Add business rule validation
4. Add logging

## Error Cases to Handle
1. User already in a group
2. Group not found
3. Invalid user ID
4. Insufficient permissions
5. Invalid group state transitions

## Security Considerations
1. Input validation for all endpoints
2. Rate limiting for group operations
3. Error messages should not expose internal details
4. Note: No authentication implemented (hackathon simplification)

## Future Considerations
1. Leader transfer functionality
2. Group chat system
3. Group currency pool
4. Group achievements/statistics 
