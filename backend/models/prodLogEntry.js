// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

    return this.createFromProdModel(prodShift, creator, 'editShift', data);
  };

  prodLogEntrySchema.statics.editOrder = function(prodShiftOrder, creator, changes)
  {
    if (lodash.isEmpty(changes))
    {
      return null;
    }

    var data = {};
    var modelData = prodShiftOrder.toJSON();

    editPersonnel(data, changes, modelData);
    editNumericValue(data, changes, modelData, 'quantityDone', 0);
    editNumericValue(data, changes, modelData, 'workerCount', 1);
    editOrder(data, changes, modelData);
    editDateValue(data, changes, modelData, 'startedAt');
    editDateValue(data, changes, modelData, 'finishedAt');

    if (lodash.isEmpty(data))
    {
      return null;
    }

    return this.createFromProdModel(prodShiftOrder, creator, 'editOrder', data);
  };

  prodLogEntrySchema.statics.editDowntime = function(prodDowntime, creator, changes)
  {
    if (lodash.isEmpty(changes))
    {
      return null;
    }

    var createdAt = new Date();
    var data = {};
    var modelData = prodDowntime.toJSON();

    editPersonnel(data, changes, modelData);
    editStringValue(data, changes, modelData, 'reason');
    editStringValue(data, changes, modelData, 'reasonComment');
    editStringValue(data, changes, modelData, 'aor');
    editDateValue(data, changes, modelData, 'startedAt');
    editDateValue(data, changes, modelData, 'finishedAt');

    if (prodDowntime.status !== 'undecided')
    {
      editStringValue(data, changes, modelData, 'status');
      editStringValue(data, changes, modelData, 'decisionComment');

      if (data.status)
      {
        data.corroborator = creator;
        data.corroboratedAt = createdAt;
      }
    }

    if (lodash.isEmpty(data))
    {
      return null;
    }

    data._id = prodDowntime._id;

    return this.createFromProdModel(prodDowntime, creator, 'editDowntime', data, createdAt);
  };

  prodLogEntrySchema.statics.deleteDowntime = function(prodDowntime, creator)
  {
    return this.createFromProdModel(
      prodDowntime, creator, 'deleteDowntime', prodDowntime.toJSON()
    );
  };

  prodLogEntrySchema.statics.deleteOrder = function(prodShiftOrder, creator)
  {
    return this.createFromProdModel(
      prodShiftOrder, creator, 'deleteOrder', prodShiftOrder.toJSON()
    );
  };

  prodLogEntrySchema.statics.deleteShift = function(prodShift, creator)
  {
    return this.createFromProdModel(prodShift, creator, 'deleteShift', {});
  };

  prodLogEntrySchema.statics.createFromProdModel = function(
    prodModel, creator, type, data, createdAt)
  {
    var ProdLogEntry = this;

    if (createdAt === undefined)
    {
      createdAt = new Date();
    }

    var modelName = prodModel.constructor.modelName;
    var prodShift;
    var prodShiftOrder;

    if (modelName === 'ProdShift')
    {
      prodShift = prodModel._id;
      prodShiftOrder = null;
    }
    else if (modelName === 'ProdShiftOrder')
    {
      prodShift = prodModel.prodShift;
      prodShiftOrder = prodModel._id;
    }
    else if (modelName === 'ProdDowntime')
    {
      prodShift = prodModel.prodShift;
      prodShiftOrder = prodModel.prodShiftOrder;
    }

    return new ProdLogEntry({
      _id: generateId(createdAt, prodModel.prodLine),
      type: type,
      division: prodModel.division,
      subdivision: prodModel.subdivision,
      mrpControllers: prodModel.mrpControllers,
      prodFlow: prodModel.prodFlow,
      workCenter: prodModel.workCenter,
      prodLine: prodModel.prodLine,
      prodShift: prodShift,
      prodShiftOrder: prodShiftOrder,
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

function editStringValue(data, changes, modelData, stringProperty)
{
  var value = changes[stringProperty];

  if (typeof value === 'string' && value !== String(modelData[stringProperty]))
  {
    data[stringProperty] = value;
  }
}

function editDateValue(data, changes, modelData, dateProperty)
{
  var newValue = changes[dateProperty];

  if (typeof newValue === 'string')
  {
    newValue = Date.parse(newValue);
  }

  if (isNaN(newValue) || typeof newValue !== 'number' || newValue <= 0)
  {
    return;
  }

  var oldValue = modelData[dateProperty];

  if (oldValue === newValue)
  {
    return;
  }

  var oldTime = Math.floor(oldValue.getTime() / 1000);
  var newTime = Math.floor(newValue / 1000);

  if (oldValue === null || newTime !== oldTime)
  {
    data[dateProperty] = new Date(newValue);
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
  if (lodash.isEqual(logEntryData[property], modelData[property]))
  {
    delete logEntryData[property];
  }
}
