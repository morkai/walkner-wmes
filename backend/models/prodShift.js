'use strict';

module.exports = function setupProdShiftModel(app, mongoose)
{
  var quantitySchema = mongoose.Schema({
    planned: {
      type: Number,
      default: 0,
      min: 0
    },
    actual: {
      type: Number,
      default: 0,
      min: 0
    }
  }, {
    _id: false
  });

  var prodShiftSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    division: {
      type: String,
      ref: 'Division',
      default: null
    },
    subdivision: {
      type: String,
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
    date: {
      type: Date,
      required: true
    },
    shift: {
      type: Number,
      min: 1,
      max: 3,
      required: true
    },
    quantitiesDone: [quantitySchema],
    creator: {},
    createdAt: {
      type: Date,
      required: true
    },
    master: {},
    leader: {},
    operator: {}
  }, {
    id: false
  });

  prodShiftSchema.statics.TOPIC_PREFIX = 'prodShifts';

  mongoose.model('ProdShift', prodShiftSchema);
};
