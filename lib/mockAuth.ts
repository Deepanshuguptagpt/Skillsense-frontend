// Mock authentication store for development
interface MockUser {
  userId: string;
  email: string;
  password: string;
  name: string;
  role: string;
}

class MockAuthStore {
  private users: Map<string, MockUser> = new Map();

  constructor() {
    // Add a default test user
    this.users.set('test@example.com', {
      userId: 'user-test',
      email: 'test@example.com',
      password: 'Test@123',
      name: 'Test User',
      role: 'student',
    });
  }

  signUp(email: string, password: string, name: string): { success: boolean; error?: string; userId?: string } {
    // Check if user already exists
    if (this.users.has(email.toLowerCase())) {
      return {
        success: false,
        error: 'An account with this email already exists',
      };
    }

    // Create new user
    const userId = `user-${Date.now()}`;
    this.users.set(email.toLowerCase(), {
      userId,
      email,
      password,
      name,
      role: 'student',
    });

    return {
      success: true,
      userId,
    };
  }

  signIn(email: string, password: string): { success: boolean; error?: string; user?: Omit<MockUser, 'password'> } {
    const user = this.users.get(email.toLowerCase());

    if (!user) {
      return {
        success: false,
        error: 'No account found with this email address',
      };
    }

    if (user.password !== password) {
      return {
        success: false,
        error: 'Incorrect password',
      };
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      user: userWithoutPassword,
    };
  }

  userExists(email: string): boolean {
    return this.users.has(email.toLowerCase());
  }

  getAllUsers(): string[] {
    return Array.from(this.users.keys());
  }
}

// Export singleton instance
export const mockAuthStore = new MockAuthStore();
