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

// Example usage with email
const loginWithEmail = async () => {
  return login('user@example.com', 'password');
};

// Example usage with username
const loginWithUsername = async () => {
  return login('username', 'password');
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
  name?: string;
}

interface CreateGroupResponse {
  _id: string;      // Group ID
  leaderId: string; // User ID of the leader
  members: string[]; // Array of member user IDs
  status: 'active' | 'disbanded';
  name?: string;
  createdAt: string;
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
  if (!response.ok) throw new Error('Failed to create group');
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
  if (!response.ok) throw new Error('Failed to join group');
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
  if (!response.ok) throw new Error('Failed to leave group');
};
```

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
- `400 Bad Request`: Invalid input or business rule violation
- `500 Internal Server Error`: Server-side error

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

## Notes
1. All authenticated requests require a valid JWT token
2. JWT tokens expire after 24 hours
3. Users can only be in one group at a time
4. Only the group leader can delete the group
5. When the leader leaves, the group is automatically disbanded
6. Currency can be positive or negative (for adding or subtracting)
7. Store JWT token securely (e.g., using AsyncStorage in Expo) 