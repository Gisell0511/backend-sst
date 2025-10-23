const { Model } = require('objection');

class Quiz extends Model {
  static get tableName() {
    return 'quizzes';
  }

  static get relationMappings() {
    const QuizCategory = require('./QuizCategory');
    return {
      category: {
        relation: Model.BelongsToOneRelation,
        modelClass: QuizCategory,
        join: {
          from: 'quizzes.category_id',
          to: 'quiz_categories.id'
        }
      }
    };
  }
}

module.exports = Quiz;