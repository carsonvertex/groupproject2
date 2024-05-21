import { Client } from "pg";
import { Router, Request, Response } from "express";
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

  async logIn() {}
  async logOut() {}
  async getusername() {}
  async users() {}
  async user() {}
}
