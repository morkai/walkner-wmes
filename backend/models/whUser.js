// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupWhUserModel(app, mongoose)
{
  const whUserSchema = new mongoose.Schema({
    _id: String,
    label: String,
    func: String
  }, {
    id: false,
    minimize: false
  });

  whUserSchema.statics.TOPIC_PREFIX = 'wh.users';
  whUserSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('WhUser', whUserSchema);
};
