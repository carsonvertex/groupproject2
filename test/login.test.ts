import { AccountService } from '../services/accountService';
import { Client } from 'pg';
import * as hash from '../utils/hash';

jest.mock('pg', () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return {
        query: jest.fn(),
      };
    }),
  };
});

jest.mock('../utils/hash', () => {
  return {
    hashPassword: jest.fn().mockResolvedValue('$2a$10$PyjdEg6CcwaExDIF6PRhHugj9cxw5uTAuQU9/sTX82rBa3nSSZjKu'),
    checkPassword: jest.fn().mockResolvedValue(true),
  };
});

describe('AccountService', () => {
  let accountService: AccountService;
  let mockClient: Client;

  beforeEach(() => {
    mockClient = new Client();
    accountService = new AccountService(mockClient);
  });

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const password = 'testpassword';
      const returningId = { rows: [{ id: 1 }] };

      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      (mockClient.query as jest.Mock).mockResolvedValueOnce(returningId);

      const result = await accountService.signUp(email, username, password);
      expect(mockClient.query).toHaveBeenCalledTimes(2);
      expect(mockClient.query).toHaveBeenNthCalledWith(1, 'SELECT username,password,id FROM users WHERE email = $1 OR username = $2', [email, username]);
      expect(mockClient.query).toHaveBeenNthCalledWith(2, 'INSERT INTO users (email,username,  password) VALUES ($1, $2, $3) RETURNING id', [email, username, '$2a$10$PyjdEg6CcwaExDIF6PRhHugj9cxw5uTAuQU9/sTX82rBa3nSSZjKu']);
      expect(result.rows[0]).toEqual(returningId.rows[0]);
    });

    it('should throw an error for a duplicate entry', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const password = 'testpassword';
      const userQueryResult = { rows: [{ username, password, id: 1 }] };

      (mockClient.query as jest.Mock).mockResolvedValueOnce(userQueryResult);

      await expect(accountService.signUp(email, username, password)).rejects.toThrow('Duplicate entry.');
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT username,password,id FROM users WHERE email = $1 OR username = $2', [email, username]);
    });
  });

  describe('logIn', () => {
    it('should successfully log in a user', async () => {
      const username = 'testuser';
      const password = 'testpassword';
      const userQueryResult = { rows: [{ username, password, id: 1 }] };

      (mockClient.query as jest.Mock).mockResolvedValueOnce(userQueryResult);
      (hash.checkPassword as jest.Mock).mockResolvedValueOnce(true);

      const result = await accountService.logIn(username, password);
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT username, password, id FROM users WHERE username = $1', [username]);
      expect(result).toEqual(userQueryResult);
    });

    it('should throw an error for wrong username', async () => {
      const username = 'wronguser';
      const password = 'testpassword';

      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await expect(accountService.logIn(username, password)).rejects.toThrow('Login Failed wrong username');
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT username, password, id FROM users WHERE username = $1', [username]);
    });

    it('should throw an error for wrong password', async () => {
      const username = 'testuser';
      const password = 'wrongpassword';
      const userQueryResult = { rows: [{ username, password, id: 1 }] };

      (mockClient.query as jest.Mock).mockResolvedValueOnce(userQueryResult);
      (hash.checkPassword as jest.Mock).mockResolvedValueOnce(false);

      await expect(accountService.logIn(username, password)).rejects.toThrow('Login Failed wrong password');
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT username, password, id FROM users WHERE username = $1', [username]);
    });
  });

  describe('users', () => {
    it('should return all users', async () => {
      const usersQueryResult = { rows: [{ username: 'user1', id: 1 }, { username: 'user2', id: 2 }] };
      (mockClient.query as jest.Mock).mockResolvedValueOnce(usersQueryResult);

      const result = await accountService.users();
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM users;');
      expect(result).toEqual(usersQueryResult);
    });
  });
});