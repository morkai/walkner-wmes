// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setup8DProblemSourceModel(app, mongoose)
{
  var d8ProblemSourceSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      match: /^[A-Za-z0-9-_]+$/
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: Number,
      default: 0
    }
  }, {
    id: false
  });

  d8ProblemSourceSchema.statics.TOPIC_PREFIX = 'd8.problemSources';
  d8ProblemSourceSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('D8ProblemSource', d8ProblemSourceSchema);
};
