// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupCagGroupModel(app, mongoose)
{
  var cagGroupSchema = mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    color: {
      type: String,
      default: '#FFFFFF'
    },
    cags: [String]
  }, {
    id: false
  });

  cagGroupSchema.statics.TOPIC_PREFIX = 'cagGroups';
  cagGroupSchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('CagGroup', cagGroupSchema);
};
