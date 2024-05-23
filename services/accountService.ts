import { Client } from "pg";
import { Knex } from "knex";
import { checkPassword, hashPassword } from "../utils/hash";


export class AccountService {
  constructor(private client: Client) {}

  async signUp(email: string, username: string, password: string) {
    const hashedPassword = await hashPassword(password);
    let userQueryResult = await this.client.query(
      "SELECT username,password,id FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );
    if (userQueryResult.rows.length > 0) {
      throw new Error("Duplicate entry.");
    }
    let returningId = await this.client.query(
      "INSERT INTO users (email,username,  password) VALUES ($1, $2, $3) RETURNING id",
      [email, username, hashedPassword]
    );
    if (returningId === null) {
      throw new Error("Error entry.");
    }
    return returningId;
  }

  async logIn(username: string, password: string) {
    const userQueryResult = await this.client.query(
      "SELECT username, password, id FROM users WHERE username = $1",
      [username]
    );
    if (userQueryResult.rows.length === 0) {
      console.log("Login failed: wrong username");
      throw new Error("Login Failed wrong username");
    }
    const truePassword = userQueryResult.rows[0].password;
    const isMatched = await checkPassword({
      plainPassword: password,
      hashedPassword: truePassword,
    });

    if (!isMatched) {
      console.log("Login failed: wrong password");
      throw new Error("Login Failed wrong password");
    }
    return userQueryResult;
  }
  
  async users() {
    const userQueryResult = await this.client.query("SELECT * FROM users;")
    return userQueryResult;
  }


}
