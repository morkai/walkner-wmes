'use strict';

module.exports = function setupProdLogEntryModel(app, mongoose)
{
  var prodLogEntrySchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    type: {
      type: 'String',
      required: true
    },
    data: {},
    division: {
      type: String,
      ref: 'Division',
      default: null
    },
    subdivision: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subdivision',
      default: null
    },
    mrpControllers: [{
      type: 'String',
      ref: 'MrpController'
    }],
    prodFlow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProdFlow',
      default: null
    },
    workCenter: {
      type: String,
      ref: 'WorkCenter',
      default: null
    },
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
