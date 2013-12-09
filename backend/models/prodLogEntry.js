'use strict';

module.exports = function setupProdLogEntryModel(app, mongoose)
{
  var prodLogEntrySchema = mongoose.Schema({
    type: {
      type: 'String',
      required: true
    },
    data: {},
    prodLine: {
      type: String,
      ref: 'ProdLine',
      required: true
    },
    prodShift: {
      type: String,
      ref: 'ProdShift',
      required: true
    },
    prodShiftOrder: {
      type: String,
      ref: 'ProdShiftOrder',
      default: null
    },
    creator: {},
    createdAt: {
      type: Date,
      required: true
    },
    todo: {
      type: Boolean,
      default: true
    }
  }, {
    id: false
  });

  mongoose.model('ProdLogEntry', prodLogEntrySchema);
};
