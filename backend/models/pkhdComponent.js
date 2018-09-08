// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupPkhdComponentModel(app, mongoose)
{
  const pkhdComponentSchema = new mongoose.Schema({
    _id: {
      nc: String,
      sa: String
    },
    s: Number,
    t: Number
  }, {
    id: false,
    versionKey: false
  });

  pkhdComponentSchema.statics.TOPIC_PREFIX = 'pkhdComponents';

  mongoose.model('PkhdComponent', pkhdComponentSchema);
};
