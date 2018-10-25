// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupHelpFileModel(app, mongoose)
{
  const helpFileSchema = new mongoose.Schema({
    _id: String,
    kind: String,
    mimeType: String,
    parents: [String],
    name: String,
    description: String,
    version: String,
    updatedAt: Date,
    properties: {}
  }, {
    id: false,
    minimize: false
  });

  helpFileSchema.statics.TOPIC_PREFIX = 'help.files';
  helpFileSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('HelpFile', helpFileSchema);
};
