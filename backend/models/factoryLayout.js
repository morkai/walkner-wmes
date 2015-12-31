// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupFactoryLayoutModel(app, mongoose)
{
  var factoryLayoutSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    live: {},
    draft: {}
  }, {
    id: false
  });

  mongoose.model('FactoryLayout', factoryLayoutSchema);
};
