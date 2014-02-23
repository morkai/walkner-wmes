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
    savedAt: Date,
    todo: {
      type: Boolean,
      default: true
    }
  }, {
    id: false
  });

  prodLogEntrySchema.index({todo: 1});
  prodLogEntrySchema.index({type: 1, createdAt: -1});
  prodLogEntrySchema.index({prodShift: 1});
  prodLogEntrySchema.index({prodShiftOrder: 1});
  prodLogEntrySchema.index({prodLine: 1, createdAt: -1});

  mongoose.model('ProdLogEntry', prodLogEntrySchema);
};
