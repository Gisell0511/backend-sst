const { Model } = require('objection');

class QuizCategory extends Model {
  static get tableName() {
    return 'quiz_categories';
  }

  static get relationMappings() {
    const Quiz = require('./Quiz');
    return {
      quizzes: {
        relation: Model.HasManyRelation,
        modelClass: Quiz,
        join: {
          from: 'quiz_categories.id',
          to: 'quizzes.category_id'
        }
      }
    };
  }
}

module.exports = QuizCategory;