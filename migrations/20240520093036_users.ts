import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", function (table) {
    table.increments("id");
    table.string("email");
    table.string("username");
    table.string("password");
    table.timestamp("created_at").defaultTo(knex.fn.now()); // 添加created_at字段並設置默認值為當前時間戳
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users");
}