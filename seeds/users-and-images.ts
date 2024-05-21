import { Knex } from "knex";
import { hashPassword } from "../utils/hash";

export async function seed(knex: Knex): Promise<void> {
  // 刪除現有的數據
  await knex("users").del();
  
  // 插入users表格的種子數據
  let password1 = "password1"
  let password2 = "password2"
  let password3 = "password3"
  let hashedPassword1 = await hashPassword(password1);
  let hashedPassword2 = await hashPassword(password2);
  let hashedPassword3 = await hashPassword(password3);
  await knex("users").insert([
    { id: 1, email:"test@gmail.com",username: "user1", password: hashedPassword1 },
    { id: 2, email:"test2@gmail.com",username: "user2", password: hashedPassword2 },
    { id: 3, email:"test3@gmail.com",username: "user3", password: hashedPassword3 }
  ]);

  // 刪除現有的數據
  await knex("images").del();
  
  // 插入images表格的種子數據
  await knex("images").insert([
    { id: 1, user_id: 1, image_url: "image1.jpg" },
    { id: 2, user_id: 2, image_url: "image2.jpg" },
    { id: 3, user_id: 1, image_url: "image3.jpg" }
  ]);
}