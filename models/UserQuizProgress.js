const { Model } = require('objection');

class UserQuizProgress extends Model {
  static get tableName() {
    return 'user_quiz_progress';
  }
}

module.exports = UserQuizProgress;