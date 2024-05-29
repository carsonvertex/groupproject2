import { table } from "console";
import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("users",(table)=>{
        table.text("newVerifyImage")
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("users",(table)=>{
        table.dropColumn("newVerifyImage")
    })
}

