exports.up = function(knex) {
  return knex.schema.createTable('quiz_categories', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('level').notNullable();
    table.text('description');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('quiz_categories');
};