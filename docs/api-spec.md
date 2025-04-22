# MC Together API Specification

## Hardcoded Users
The following users are pre-configured in the system:

```typescript
interface HardcodedUser {
  userId: number;
  currency: number;
}

const HARDCODED_USERS: HardcodedUser[] = [
  { userId: 1, currency: 1000 },
  { userId: 2, currency: 800 },
  { userId: 3, currency: 1200 },
  { userId: 4, currency: 600 },
  { userId: 5, currency: 1500 }
];
```

These users are automatically created when the backend starts if they don't already exist. The frontend should use these exact user IDs (1-5) for all operations. (so, the requets will be made with these ids!)

## Base URL
```
http://localhost:3000
```

## User Management

### Get User Information
```typescript
interface UserResponse {
  userId: number;
  currency: number;
  groupId?: string;
  role?: 'leader' | 'member';
}

// Example request
const getUser = async (userId: number): Promise<UserResponse> => {
  const response = await fetch(`http://localhost:3000/users/${userId}`);
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
const updateCurrency = async (userId: number, amount: number): Promise<UpdateCurrencyResponse> => {
  const response = await fetch(`http://localhost:3000/users/${userId}/currency`, {
    method: 'PATCH',
    headers: {
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
  userId: number;
  name?: string;
}

interface CreateGroupResponse {
  _id: string;      // Group ID
  leaderId: number;
  members: number[];
  status: 'active' | 'disbanded';
  name?: string;
  createdAt: string;
}

// Example request
const createGroup = async (userId: number, name?: string): Promise<CreateGroupResponse> => {
  const response = await fetch('http://localhost:3000/groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, name }),
  });
  if (!response.ok) throw new Error('Failed to create group');
  return response.json();
};
```

### Get Group Information
```typescript
interface GroupResponse extends CreateGroupResponse {}

// Example request
const getGroup = async (groupId: string): Promise<GroupResponse> => {
  const response = await fetch(`http://localhost:3000/groups/${groupId}`);
  if (!response.ok) throw new Error('Failed to fetch group');
  return response.json();
};
```

### Join Group
```typescript
interface JoinGroupRequest {
  userId: number;
}

interface JoinGroupResponse extends GroupResponse {}

// Example request
const joinGroup = async (groupId: string, userId: number): Promise<JoinGroupResponse> => {
  const response = await fetch(`http://localhost:3000/groups/${groupId}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) throw new Error('Failed to join group');
  return response.json();
};
```

### Leave Group
```typescript
interface LeaveGroupRequest {
  userId: number;
}

// Example request
const leaveGroup = async (groupId: string, userId: number): Promise<void> => {
  const response = await fetch(`http://localhost:3000/groups/${groupId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
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
- `404 Not Found`: User or group not found
- `400 Bad Request`: Invalid input or business rule violation
- `500 Internal Server Error`: Server-side error

## Example Usage

```typescript
// Example: Create a group and have another user join it
async function example() {
  try {
    // User 1 creates a group
    const group = await createGroup(1, 'My Group');
    console.log('Group created:', group);

    // User 2 joins the group
    const updatedGroup = await joinGroup(group._id, 2);
    console.log('User 2 joined:', updatedGroup);

    // Check user 2's status
    const user2 = await getUser(2);
    console.log('User 2 status:', user2);

    // User 2 leaves the group
    await leaveGroup(group._id, 2);
    console.log('User 2 left the group');

  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Notes
1. All user IDs must be between 1 and 5
2. Users can only be in one group at a time
3. Only the group leader can delete the group
4. When the leader leaves, the group is automatically disbanded
5. Currency can be positive or negative (for adding or subtracting) 