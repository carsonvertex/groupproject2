import { Client } from "pg";
import { AccountService } from "../services/accountService";
import { checkPassword, hashPassword } from "../utils/hash";

describe("AccountService", () => {
  let accountService: AccountService;
  let mockClient: Client;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
    } as unknown as Client;
    accountService = new AccountService(mockClient);
  });

  describe("signUp", () => {
    it("should successfully sign up a new user", async () => {
      const email = "test@example.com";
      const username = "testuser";
      const password = "testpassword";
      const hashedPassword = await hashPassword(password);
      const returningId = { rows: [{ id: 1 }] };

      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce(returningId);

      const result = await accountService.signUp(email, username, password);
      expect(mockClient.query).toHaveBeenCalledTimes(2);
      expect(mockClient.query).toHaveBeenNthCalledWith(1, "SELECT username,password,id FROM users WHERE email = $1 OR username = $2", [email, username]);
      expect(mockClient.query).toHaveBeenNthCalledWith(2, "INSERT INTO users (email,username,  password) VALUES ($1, $2, $3) RETURNING id", [email, username, hashedPassword]);
      expect(result).toEqual(returningId);
    });

    it("should throw an error for a duplicate entry", async () => {
      const email = "test@example.com";
      const username = "testuser";
      const password = "testpassword";
      const userQueryResult = { rows: [{ username: "testuser", password: "hashedpassword", id: 1 }] };

      (mockClient.query as jest.Mock).mockResolvedValueOnce(userQueryResult);

      await expect(accountService.signUp(email, username, password)).rejects.toThrow("Duplicate entry.");
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith("SELECT username,password,id FROM users WHERE email = $1 OR username = $2", [email, username]);
    });
  });

  describe("logIn", () => {
    it("should successfully log in a user", async () => {
      const username = "testuser";
      const password = "testpassword";
      const hashedPassword = await hashPassword(password);
      const userQueryResult = { rows: [{ username, password: hashedPassword, id: 1 }] };

      (mockClient.query as jest.Mock).mockResolvedValueOnce(userQueryResult);
      (checkPassword as jest.Mock).mockResolvedValueOnce(true);

      const result = await accountService.logIn(username, password);
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith("SELECT username, password, id FROM users WHERE username = $1", [username]);
      expect(checkPassword).toHaveBeenCalledWith({
        plainPassword: password,
        hashedPassword: hashedPassword,
      });
      expect(result).toEqual(userQueryResult);
    });

    it("should throw an error for wrong username", async () => {
      const username = "wronguser";
      const password = "testpassword";
      const userQueryResult = { rows: [] };

      (mockClient.query as jest.Mock).mockResolvedValueOnce(userQueryResult);

      await expect(accountService.logIn(username, password)).rejects.toThrow("Login Failed wrong username");
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith("SELECT username, password, id FROM users WHERE username = $1", [username]);
    });

    it("should throw an error for wrong password", async () => {
      const username = "testuser";
      const password = "wrongpassword";
      const hashedPassword = await hashPassword("testpassword");
      const userQueryResult = { rows: [{ username, password: hashedPassword, id: 1 }] };

      (mockClient.query as jest.Mock).mockResolvedValueOnce(userQueryResult);
      (checkPassword as jest.Mock).mockResolvedValueOnce(false);

      await expect(accountService.logIn(username, password)).rejects.toThrow("Login Failed wrong password");
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith("SELECT username, password, id FROM users WHERE username = $1", [username]);
      expect(checkPassword).toHaveBeenCalledWith({
        plainPassword: password,
        hashedPassword: hashedPassword,
      });
    });
  });

  describe("users", () => {
    it("should return all users", async () => {
      const userQueryResult = { rows: [{ id: 1, username: "testuser1" }, { id: 2, username: "testuser2" }] };

      (mockClient.query as jest.Mock).mockResolvedValueOnce(userQueryResult);

      const result = await accountService.users();
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith("SELECT * FROM users;");
      expect(result).toEqual(userQueryResult);
    });
  });
});