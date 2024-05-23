import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("profile");
  await knex.schema.dropTableIfExists("images");
  await knex.schema.createTable("users", function (table) {
    table.increments("id");
    table.string("email");
    table.string("username");
    table.string("password");
    table.string("verificationImages");
    table.string("p1");
    table.string("p2");
    table.string("p3");
    table.string("p4");
    table.string("p5");
    table.string("p6");
    table.boolean("verificationStatus");
    table.timestamp("created_at").defaultTo(knex.fn.now()); // 添加created_at字段並設置默認值為當前時間戳
    table.timestamp("updated_at").defaultTo(knex.fn.now()); // 添加updated_at字段並設置默認值為當前時間戳
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("profile");
  await knex.schema.dropTableIfExists("images");
}