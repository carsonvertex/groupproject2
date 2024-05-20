import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // 刪除現有的數據
  await knex("users").del();
  
  // 插入users表格的種子數據
  await knex("users").insert([
    { id: 1, username: "user1", password: "password1" },
    { id: 2, username: "user2", password: "password2" },
    { id: 3, username: "user3", password: "password3" }
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