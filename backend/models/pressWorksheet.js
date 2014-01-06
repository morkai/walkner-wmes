'use strict';

module.exports = function setupPressWorksheetModel(app, mongoose)
{
  var pressWorksheetOrderSchema = mongoose.Schema({
    nc12: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    operationNo: {
      type: String,
      required: true
    },
    operationName: {
      type: String,
      required: true
    },
    prodLine: {
      type: String,
      ref: 'ProdLine',
      required: true
    },
    quantityDone: {
      type: Number,
      min: 0,
      default: 0
    },
    startedAt: {
      type: String,
      required: true
    },
    finishedAt: {
      type: String,
      required: true
    },
    losses: [{}],
    downtimes: [{}]
  }, {
    _id: false
  });

  var pressWorksheetSchema = mongoose.Schema({
    date: {
      type: Date,
      required: true
    },
    shift: {
      type: Number,
      required: true,
      min: 1,
      max: 3
    },
    master: {},
    operator: {},
    operators: [{}],
    orders: [pressWorksheetOrderSchema],
    createdAt: {
      type: Date,
      required: true
    },
    creator: {}
  }, {
    id: false
  });

  pressWorksheetSchema.statics.TOPIC_PREFIX = 'pressWorksheets';

  mongoose.model('PressWorksheet', pressWorksheetSchema);
};
