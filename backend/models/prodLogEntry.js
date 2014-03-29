'use strict';

var lodash = require('lodash');
var logEntryHandlers = require('../modules/production/logEntryHandlers');

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
      enum: Object.keys(logEntryHandlers),
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

  prodLogEntrySchema.index({todo: 1, prodLine: 1, createdAt: 1});
  prodLogEntrySchema.index({createdAt: -1});
  prodLogEntrySchema.index({prodLine: 1, createdAt: -1});
  prodLogEntrySchema.index({type: 1, createdAt: -1});
  prodLogEntrySchema.index({prodShift: 1});
  prodLogEntrySchema.index({prodShiftOrder: 1});

  prodLogEntrySchema.statics.generateId = generateId;

  prodLogEntrySchema.statics.editShift = function(prodShift, creator, changes)
  {
    if (lodash.isEmpty(changes))
    {
      return null;
    }

    var ProdLogEntry = this;
    var createdAt = new Date();
    var data = {};
    var modelData = prodShift.toJSON();

    if (validateQuantitiesDone(changes.quantitiesDone))
    {
      data.quantitiesDone = changes.quantitiesDone.map(function(quantityDone)
      {
        return lodash.pick(quantityDone, ['actual', 'planned']);
      });

      compareProperty(data, modelData, 'quantitiesDone');
    }

    editPersonnel(data, changes, modelData);

    if (lodash.isEmpty(data))
    {
      return null;
    }

    return new ProdLogEntry({
      _id: generateId(createdAt, modelData.prodLine),
      type: 'editShift',
      division: modelData.division,
      subdivision: modelData.subdivision,
      mrpControllers: modelData.mrpControllers,
      prodFlow: modelData.prodFlow,
      workCenter: modelData.workCenter,
      prodLine: modelData.prodLine,
      prodShift: modelData._id,
      prodShiftOrder: null,
      creator: creator,
      createdAt: createdAt,
      savedAt: createdAt,
      todo: false,
      data: data
    });
  };

  prodLogEntrySchema.statics.editOrder = function(prodShiftOrder, creator, changes)
  {
    if (lodash.isEmpty(changes))
    {
      return null;
    }

    var ProdLogEntry = this;
    var createdAt = new Date();
    var data = {};
    var modelData = prodShiftOrder.toJSON();

    editPersonnel(data, changes, modelData);
    editNumericValue(data, changes, modelData, 'quantityDone', 0);
    editNumericValue(data, changes, modelData, 'workerCount', 1);
    editOrder(data, changes, modelData);

    if (lodash.isEmpty(data))
    {
      return null;
    }

    return new ProdLogEntry({
      _id: generateId(createdAt, modelData.prodLine),
      type: 'editOrder',
      division: modelData.division,
      subdivision: modelData.subdivision,
      mrpControllers: modelData.mrpControllers,
      prodFlow: modelData.prodFlow,
      workCenter: modelData.workCenter,
      prodLine: modelData.prodLine,
      prodShift: modelData.prodShift,
      prodShiftOrder: modelData._id,
      creator: creator,
      createdAt: createdAt,
      savedAt: createdAt,
      todo: false,
      data: data
    });
  };

  mongoose.model('ProdLogEntry', prodLogEntrySchema);
};

// http://stackoverflow.com/a/7616484
function hashCode(str)
{
  var hash = 0;

  for (var i = 0, l = str.length; i < l; ++i)
  {
    hash = (((hash << 5) - hash) + str.charCodeAt(i)) | 0;
  }

  return hash;
}

function generateId(date, str)
{
  return date.getTime().toString(36)
    + hashCode(String(str)).toString(36)
    + Math.round(Math.random() * 10000000000000000).toString(36);
}

function editPersonnel(logEntryData, changes, modelData)
{
  ['master', 'leader', 'operator'].forEach(function(personnelProperty)
  {
    var userInfo = changes[personnelProperty];

    if (validateUserInfo(userInfo))
    {
      logEntryData[personnelProperty] = userInfo === null
        ? null
        : lodash.pick(userInfo, ['id', 'label']);

      compareProperty(logEntryData, modelData, personnelProperty);
    }
  });

  if (Array.isArray(changes.operators))
  {
    logEntryData.operators = changes.operators.filter(validateUserInfo).map(function(userInfo)
    {
      return lodash.pick(userInfo, ['id', 'label']);
    });

    compareProperty(logEntryData, modelData, 'operators');
  }
}

function editNumericValue(data, changes, modelData, numericProperty, minValue)
{
  var value = changes[numericProperty];

  if (typeof value === 'number' && value >= minValue && value !== modelData[numericProperty])
  {
    data[numericProperty] = value;
  }
}

function editOrder(data, changes, modelData)
{
  if (changes.orderId && !lodash.isEqual(changes.orderId, modelData.orderId))
  {
    data.mechOrder = !!changes.mechOrder;
    data.orderId = changes.orderId;
    data.orderData = changes.orderData;
  }

  if (changes.operationNo && !lodash.isEqual(changes.operationNo, modelData.operationNo))
  {
    data.operationNo = changes.operationNo;
  }
}

function validateQuantitiesDone(quantitiesDone)
{
  return Array.isArray(quantitiesDone)
    && quantitiesDone.length === 8
    && quantitiesDone.every(function(quantityDone)
    {
      return quantityDone.planned >= 0 && quantityDone.actual >= 0;
    });
}

function validateUserInfo(userInfo)
{
  return userInfo === null
    || (typeof userInfo === 'object'
      && typeof userInfo.id === 'string'
      && typeof userInfo.label === 'string');
}

function compareProperty(logEntryData, modelData, property)
{
  if (lodash.isEqual(logEntryData[property], modelData[property], property))
  {
    delete logEntryData[property];
  }
}
