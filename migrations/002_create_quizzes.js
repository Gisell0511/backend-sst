exports.up = function(knex) {
  return knex.schema.createTable('quizzes', function(table) {
    table.increments('id').primary();
    table.integer('category_id').unsigned().notNullable();
    table.text('question').notNullable();
    table.text('option_a').notNullable();
    table.text('option_b').notNullable();
    table.text('option_c').notNullable();
    table.text('option_d').notNullable();
    table.string('correct_answer', 1).notNullable();
    table.text('explanation');
    table.string('difficulty').defaultTo('medium');
    table.timestamps(true, true);
    
    table.foreign('category_id').references('id').inTable('quiz_categories').onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('quizzes');
};