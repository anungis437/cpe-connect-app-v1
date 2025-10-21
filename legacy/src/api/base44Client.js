import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68f6b9a4ac0cf0f4052170b9", 
  requiresAuth: true // Ensure authentication is required for all operations
});
