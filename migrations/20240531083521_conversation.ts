import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("conversation", function (table) {
        table.increments("id");
        table.integer("userid").unsigned();
        table.foreign("userid").references("users.id").onDelete("CASCADE");
        table.string("text");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
      });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("conversation");
}


