# MC Together API Specification

## Authentication

### JWT Token
All authenticated requests must include a JWT token in the Authorization header:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Register User
```typescript
interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

interface RegisterResponse {
  user: {
    _id: string;
    email: string;
    username: string;
    currency: number;
    groupId?: string;
    role?: 'leader' | 'member';
  };
  token: string;  // JWT token
}

// Example request
const register = async (email: string, username: string, password: string): Promise<RegisterResponse> => {
  const response = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, username, password }),
  });
  if (!response.ok) throw new Error('Failed to register');
  return response.json();
};
```

### Login
```typescript
interface LoginRequest {
  identifier: string;  // Can be either email or username
  password: string;
}

interface LoginResponse {
  user: {
    _id: string;
    email: string;
    username: string;
    currency: number;
    groupId?: string;
    role?: 'leader' | 'member';
  };
  token: string;  // JWT token
}

// Example request
const login = async (identifier: string, password: string): Promise<LoginResponse> => {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identifier, password }),
  });
  if (!response.ok) throw new Error('Failed to login');
  return response.json();
};
```

### Get Current User
```typescript
interface CurrentUserResponse {
  _id: string;
  email: string;
  username: string;
  currency: number;
  groupId?: string;
  role?: 'leader' | 'member';
}

// Example request
const getCurrentUser = async (token: string): Promise<CurrentUserResponse> => {
  const response = await fetch('http://localhost:3000/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to get current user');
  return response.json();
};
```

## User Management

### Get User Information
```typescript
interface UserResponse {
  _id: string;
  email: string;
  username: string;
  currency: number;
  groupId?: string;
  role?: 'leader' | 'member';
}

// Example request
const getUser = async (userId: string, token: string): Promise<UserResponse> => {
  const response = await fetch(`http://localhost:3000/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};
```

### Update User Currency
```typescript
interface UpdateCurrencyRequest {
  amount: number;  // Can be positive or negative
}

interface UpdateCurrencyResponse extends UserResponse {}

// Example request
const updateCurrency = async (userId: string, amount: number, token: string): Promise<UpdateCurrencyResponse> => {
  const response = await fetch(`http://localhost:3000/users/${userId}/currency`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });
  if (!response.ok) throw new Error('Failed to update currency');
  return response.json();
};
```

## Group Management

### Create Group
```typescript
interface CreateGroupRequest {
  name?: string;  // Optional group name
}

interface CreateGroupResponse {
  _id: string;      // Group ID
  leaderId: string; // User ID of the leader
  members: string[]; // Array of member user IDs
  status: 'active' | 'disbanded';
  name?: string;
  createdAt: Date;
}

// Example request
const createGroup = async (name: string | undefined, token: string): Promise<CreateGroupResponse> => {
  const response = await fetch('http://localhost:3000/groups', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create group');
  }
  return response.json();
};
```

### Get Group Information
```typescript
interface GroupResponse extends CreateGroupResponse {}

// Example request
const getGroup = async (groupId: string, token: string): Promise<GroupResponse> => {
  const response = await fetch(`http://localhost:3000/groups/${groupId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch group');
  return response.json();
};
```

### Join Group
```typescript
interface JoinGroupResponse extends GroupResponse {}

// Example request
const joinGroup = async (groupId: string, token: string): Promise<JoinGroupResponse> => {
  const response = await fetch(`http://localhost:3000/groups/${groupId}/join`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to join group');
  }
  return response.json();
};
```

### Leave Group
```typescript
// Example request
const leaveGroup = async (groupId: string, token: string): Promise<void> => {
  const response = await fetch(`http://localhost:3000/groups/${groupId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to leave group');
  }
};
```

## User Interactions and Streaks

### Get User Streaks
```typescript
interface UserStreak {
  user1: {
    _id: string;
    username: string;
  };
  user2: {
    _id: string;
    username: string;
  };
  interactionCount: number;
  lastInteraction: Date;
}

// Example request
const getUserStreaks = async (userId: string, token: string): Promise<UserStreak[]> => {
  const response = await fetch(`http://localhost:3000/users/${userId}/streaks`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch user streaks');
  return response.json();
};
```

### Get Top Streaks
```typescript
interface TopStreaksResponse {
  streaks: UserStreak[];
  total: number;
}

// Example request
const getTopStreaks = async (limit: number = 10, token: string): Promise<TopStreaksResponse> => {
  const response = await fetch(`http://localhost:3000/streaks/top?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch top streaks');
  return response.json();
};
```

## How Streaks Work

The streak system automatically tracks and updates user interactions in the following scenarios:

1. **Group Creation**: When a user creates a group, they start with a streak count of 0 with other users.

2. **Group Joining**: When a user joins a group:
   - Streaks are automatically recorded between the joining user and all existing group members
   - The interaction count is incremented for all pairs of users in the group
   - The lastInteraction timestamp is updated to the current time

3. **Streak Data Structure**:
   - Each streak record contains two users (user1 and user2)
   - The interactionCount tracks how many times the users have been in groups together
   - The lastInteraction timestamp shows when they last interacted
   - User IDs are always stored in sorted order to avoid duplicate pairs

4. **Example Usage**:
```typescript
async function exampleStreakUsage() {
  try {
    // Login as a user
    const loginResponse = await login('user1@example.com', 'password1');
    const token = loginResponse.token;

    // Get user's streaks
    const userStreaks = await getUserStreaks(loginResponse.user._id, token);
    console.log('User streaks:', userStreaks);

    // Get top streaks across all users
    const topStreaks = await getTopStreaks(5, token);
    console.log('Top streaks:', topStreaks);

    // When users join groups, streaks are automatically updated
    // No need to manually record interactions

  } catch (error) {
    console.error('Error:', error);
  }
}
```

5. **Streak Rules**:
   - Streaks are automatically maintained by the system
   - Each group interaction increments the streak count
   - Streaks are bidirectional (user1-user2 is the same as user2-user1)
   - Streaks persist even if users leave groups
   - The system maintains a history of all interactions

6. **Performance Considerations**:
   - Streak data is optimized for quick lookups
   - User pairs are indexed for efficient querying
   - Streak updates are performed in bulk when groups change

## Error Responses

All endpoints may return the following error responses:

```typescript
interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}
```

Common error scenarios:
- `401 Unauthorized`: Invalid or missing JWT token
- `404 Not Found`: User or group not found
- `400 Bad Request`: Invalid input or business rule violation (e.g., "User is already in a group")
- `500 Internal Server Error`: Server-side error

## Notes
1. All authenticated requests require a valid JWT token
2. JWT tokens expire after 24 hours
3. Users can only be in one group at a time
4. Only the group leader can delete the group
5. When the leader leaves, the group is automatically disbanded
6. If all members leave a group, the group is automatically disbanded
7. Currency can be positive or negative (for adding or subtracting)
8. Store JWT token securely (e.g., using AsyncStorage in Expo)
9. All IDs (user and group) are MongoDB ObjectIds (strings)
10. The `/auth/me` endpoint returns the full user object including group and role information
11. Group operations (create/join/leave) require authentication and use the JWT token to identify the user
12. Error responses include detailed messages that should be shown to users
13. The group status can be either 'active' or 'disbanded'

## Example Usage

```typescript
// Example: Register, login, create group, and have another user join it
async function example() {
  try {
    // Register a new user
    const registerResponse = await register('user1@example.com', 'user1', 'password1');
    const token1 = registerResponse.token;

    // Register another user
    const registerResponse2 = await register('user2@example.com', 'user2', 'password2');
    const token2 = registerResponse2.token;

    // User 1 creates a group
    const group = await createGroup('My Group', token1);
    console.log('Group created:', group);

    // User 2 joins the group
    const updatedGroup = await joinGroup(group._id, token2);
    console.log('User 2 joined:', updatedGroup);

    // Check user 2's status
    const user2 = await getCurrentUser(token2);
    console.log('User 2 status:', user2);

    // User 2 leaves the group
    await leaveGroup(group._id, token2);
    console.log('User 2 left the group');

  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Payments

### Make Order
```typescript
interface Order {
  // Order details to be specified
}

// Example request
const makeOrder = async (order: Order, token: string): Promise<void> => {
  const response = await fetch('http://localhost:3000/payments/make-order', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  });
  if (!response.ok) throw new Error('Failed to make order');
};
```

### Process Payment
```typescript
interface Pay {
  // Payment details to be specified
}

// Example request
const pay = async (payment: Pay, token: string): Promise<void> => {
  const response = await fetch('http://localhost:3000/payments/pay', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payment),
  });
  if (!response.ok) throw new Error('Failed to process payment');
};
```

### Handle Member Left Group
```typescript
interface MemberLeftGroup {
  // Member left details to be specified
}

// Example request
const memberLeft = async (details: MemberLeftGroup, token: string): Promise<void> => {
  const response = await fetch('http://localhost:3000/payments/member-left', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(details),
  });
  if (!response.ok) throw new Error('Failed to process member left');
};
```

## Pets

### Get User's Pet
```typescript
interface PetResponse {
  // Pet details to be specified
}

// Example request
const getPet = async (userId: string, token: string): Promise<PetResponse> => {
  const response = await fetch(`http://localhost:3000/pets/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch pet');
  return response.json();
};
```

### Create Pet
```typescript
// Example request
const createPet = async (userId: string, token: string): Promise<PetResponse> => {
  const response = await fetch('http://localhost:3000/pets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) throw new Error('Failed to create pet');
  return response.json();
};
```

### Update Pet
```typescript
interface PetUpdate {
  // Pet update details to be specified
}

// Example request
const updatePet = async (pet: PetUpdate, token: string): Promise<PetResponse> => {
  const response = await fetch('http://localhost:3000/pets/update', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pet),
  });
  if (!response.ok) throw new Error('Failed to update pet');
  return response.json();
}; 