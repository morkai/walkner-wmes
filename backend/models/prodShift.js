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
    prodLine: {
      type: String,
      ref: 'ProdLine',
      required: true
    },
    date: {
      type: Date,
      trim: true
    },
    shift: {
      type: Number,
      min: 1,
      max: 3,
      required: true
    },
    state: {
      type: String,
      enum: ['idle', 'working', 'downtime'],
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
