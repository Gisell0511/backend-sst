exports.up = function(knex) {
  return knex.schema.createTable('user_quiz_progress', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('quiz_id').unsigned().notNullable();
    table.string('user_answer', 1).notNullable();
    table.boolean('is_correct').notNullable();
    table.timestamp('completed_at').defaultTo(knex.fn.now());
    
    table.foreign('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_quiz_progress');
};