import { Knex } from "knex";
import { hashPassword } from "../utils/hash";

export async function seed(knex: Knex): Promise<void> {
  // 刪除現有的數據
  await knex("users").del();
  await knex.raw("ALTER SEQUENCE users_id_seq RESTART WITH 1");
  
  // 插入users表格的種子數據
  let password1 = "password1"
  let password2 = "password2"
  let password3 = "password3"
  let hashedPassword1 = await hashPassword(password1);
  let hashedPassword2 = await hashPassword(password2);
  let hashedPassword3 = await hashPassword(password3);
  await knex("users").insert([
    {
      email: 'user1@example.com',
      username: 'user1',
      password: hashedPassword1,
      verificationImages: 'keanu.png',
      p1: 'image1.png',
      p2: 'image2.png',
      p3: 'image3.png',
      p4: 'image4.png',
      p5: 'image5.png',
      p6: 'image6.png',
      verificationStatus: true
    },
    {
      email: 'user2@example.com',
      username: 'user2',
      password: hashedPassword2,
      verificationImages: '',
      p1: 'image7.png',
      p2: 'image8.png',
      p3: 'image9.png',
      p4: 'image10.png',
      p5: 'image11.png',
      p6: 'image12.png',
      verificationStatus: true
    },
    {
      email: 'user3@example.com',
      username: 'user3',
      password: hashedPassword3,
      verificationImages: '',
      p1: 'image13.png',
      p2: 'image14.png',
      p3: 'image15.png',
      p4: 'image16.png',
      p5: 'image17.png',
      p6: 'image18.png',
      verificationStatus: false
    }
  ]);

}