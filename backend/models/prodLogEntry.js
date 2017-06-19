// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const moment = require('moment');
const logEntryHandlers = require('../modules/production/logEntryHandlers');

module.exports = function setupProdLogEntryModel(app, mongoose)
{
  const prodLogEntrySchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true,
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
    },
    instanceId: {
      type: String,
      default: null
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

  prodLogEntrySchema.statics.addShift = function(creator, data)
  {
    if (!validateQuantitiesDone(data.quantitiesDone))
    {
      return null;
    }

    data.quantitiesDone = data.quantitiesDone.map(quantityDone => _.pick(quantityDone, ['actual', 'planned']));

    editPersonnel(data, data);

    data.creator = creator;
    data.createdAt = new Date();
    data._id = generateId(data.createdAt, data.prodLine);

    const ProdShift = mongoose.model('ProdShift');
    const prodShift = new ProdShift(data);

    return this.createFromProdModel(prodShift, creator, 'addShift', prodShift.toJSON(), prodShift.createdAt);
  };

  prodLogEntrySchema.statics.editShift = function(prodShift, creator, changes)
  {
    if (_.isEmpty(changes))
    {
      return null;
    }

    const data = {};
    const modelData = prodShift.toJSON();

    if (validateQuantitiesDone(changes.quantitiesDone))
    {
      data.quantitiesDone = changes.quantitiesDone.map(function(quantityDone)
      {
        return _.pick(quantityDone, ['actual', 'planned']);
      });

      compareProperty(data, modelData, 'quantitiesDone');
    }

    editPersonnel(data, changes, modelData);

    if (_.isEmpty(data))
    {
      return null;
    }

    return this.createFromProdModel(prodShift, creator, 'editShift', data);
  };

  prodLogEntrySchema.statics.addOrder = function(creator, data)
  {
    editDateValue(data, data, null, 'startedAt');
    editDateValue(data, data, null, 'finishedAt');

    if (!validateTimes(data.startedAt, data.finishedAt, data.date))
    {
      return null;
    }

    editPersonnel(data, data);
    editNumericValue(data, data, null, 'quantityDone', 0);
    editNumericValue(data, data, null, 'workerCount', 1);
    editOrder(data, data);

    const createdAt = new Date();

    data.creator = creator;
    data._id = generateId(createdAt, data.prodLine);

    const ProdShiftOrder = mongoose.model('ProdShiftOrder');
    const prodShiftOrder = new ProdShiftOrder(data);

    return this.createFromProdModel(prodShiftOrder, creator, 'addOrder', prodShiftOrder.toJSON(), createdAt);
  };

  prodLogEntrySchema.statics.editOrder = function(prodShiftOrder, creator, changes)
  {
    if (_.isEmpty(changes))
    {
      return null;
    }

    const data = {};
    const modelData = prodShiftOrder.toJSON();

    editDateValue(data, changes, modelData, 'startedAt');
    editDateValue(data, changes, modelData, 'finishedAt');

    if (!validateTimes(changes.startedAt, changes.finishedAt, prodShiftOrder.date))
    {
      return null;
    }

    editPersonnel(data, changes, modelData);
    editNumericValue(data, changes, modelData, 'quantityDone', 0);
    editNumericValue(data, changes, modelData, 'workerCount', 1);
    editOrder(data, changes, modelData);

    if (_.isEmpty(data))
    {
      return null;
    }

    return this.createFromProdModel(prodShiftOrder, creator, 'editOrder', data);
  };

  prodLogEntrySchema.statics.addDowntime = function(prodShiftOrder, creator, data)
  {
    editDateValue(data, data, null, 'startedAt');
    editDateValue(data, data, null, 'finishedAt');

    const min = prodShiftOrder ? prodShiftOrder.startedAt : data.date;
    const max = prodShiftOrder ? prodShiftOrder.finishedAt : null;

    if (!validateTimes(data.startedAt, data.finishedAt, min, max))
    {
      return null;
    }

    editPersonnel(data, data);
    editStringValue(data, data, null, 'reason');
    editStringValue(data, data, null, 'reasonComment');
    editStringValue(data, data, null, 'aor');

    const createdAt = new Date();

    if (data.status !== 'undecided')
    {
      editStringValue(data, data, null, 'status');
      editStringValue(data, data, null, 'decisionComment');

      if (data.status)
      {
        data.corroborator = creator;
        data.corroboratedAt = createdAt;
      }
    }

    data.creator = creator;
    data._id = generateId(createdAt, data.prodLine);

    const ProdDowntime = mongoose.model('ProdDowntime');
    const prodDowntime = new ProdDowntime(data);

    return this.createFromProdModel(prodDowntime, creator, 'addDowntime', prodDowntime.toJSON(), createdAt);
  };

  prodLogEntrySchema.statics.editDowntime = function(prodDowntime, creator, changes)
  {
    if (_.isEmpty(changes))
    {
      return null;
    }

    const createdAt = new Date();
    const data = {};
    const modelData = prodDowntime.toJSON();

    editDateValue(data, changes, modelData, 'startedAt');
    editDateValue(data, changes, modelData, 'finishedAt');

    if (!validateTimes(changes.startedAt, changes.finishedAt, prodDowntime.date))
    {
      return null;
    }

    editPersonnel(data, changes, modelData);
    editStringValue(data, changes, modelData, 'reason');
    editStringValue(data, changes, modelData, 'reasonComment');
    editStringValue(data, changes, modelData, 'aor');

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

    if (_.isEmpty(data))
    {
      return null;
    }

    data._id = prodDowntime._id;

    return this.createFromProdModel(prodDowntime, creator, 'editDowntime', data, createdAt);
  };

  prodLogEntrySchema.statics.deleteDowntime = function(prodDowntime, creator)
  {
    return this.createFromProdModel(prodDowntime, creator, 'deleteDowntime', prodDowntime.toJSON());
  };

  prodLogEntrySchema.statics.deleteOrder = function(prodShiftOrder, creator)
  {
    return this.createFromProdModel(prodShiftOrder, creator, 'deleteOrder', prodShiftOrder.toJSON());
  };

  prodLogEntrySchema.statics.deleteShift = function(prodShift, creator)
  {
    return this.createFromProdModel(prodShift, creator, 'deleteShift', {});
  };

  prodLogEntrySchema.statics.createFromProdModel = function(prodModel, creator, type, data, createdAt)
  {
    const ProdLogEntry = this;

    if (createdAt === undefined)
    {
      createdAt = new Date();
    }

    const modelName = prodModel.constructor.modelName;
    let prodShift = null;
    let prodShiftOrder = null;

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
  let hash = 0;

  for (let i = 0; i < str.length; ++i)
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
  _.forEach(['master', 'leader', 'operator'], function(personnelProperty)
  {
    const userInfo = changes[personnelProperty];

    if (validateUserInfo(userInfo))
    {
      logEntryData[personnelProperty] = userInfo === null
        ? null
        : _.pick(userInfo, ['id', 'label']);

      if (modelData)
      {
        compareProperty(logEntryData, modelData, personnelProperty);
      }
    }
  });

  if (Array.isArray(changes.operators))
  {
    logEntryData.operators = changes.operators.filter(validateUserInfo).map(function(userInfo)
    {
      return _.pick(userInfo, ['id', 'label']);
    });

    if (modelData)
    {
      compareProperty(logEntryData, modelData, 'operators');
    }
  }
}

function editNumericValue(data, changes, modelData, numericProperty, minValue)
{
  const value = changes[numericProperty];

  if (typeof value === 'number'
    && value >= minValue
    && (!modelData || value !== modelData[numericProperty]))
  {
    data[numericProperty] = value;
  }
}

function editStringValue(data, changes, modelData, stringProperty)
{
  const value = changes[stringProperty];

  if (typeof value === 'string' && (!modelData || value !== String(modelData[stringProperty])))
  {
    data[stringProperty] = value;
  }
}

function editDateValue(data, changes, modelData, dateProperty)
{
  let newValue = changes[dateProperty];

  if (typeof newValue === 'string')
  {
    newValue = Date.parse(newValue);
  }

  if (isNaN(newValue) || typeof newValue !== 'number' || newValue <= 0)
  {
    return;
  }

  const oldValue = modelData ? modelData[dateProperty] : new Date(0);

  if (oldValue === newValue)
  {
    return;
  }

  const oldTime = Math.floor(oldValue.getTime() / 1000);
  const newTime = Math.floor(newValue / 1000);

  if (oldValue === null || newTime !== oldTime)
  {
    data[dateProperty] = new Date(newValue);
  }
  else if (!modelData)
  {
    data[dateProperty] = null;
  }
}

function editOrder(data, changes, modelData)
{
  if (changes.orderId
    && (!modelData || !_.isEqual(changes.orderId, modelData.orderId)))
  {
    data.mechOrder = !!changes.mechOrder;
    data.orderId = changes.orderId;
    data.orderData = changes.orderData;
  }

  if (changes.operationNo
    && (!modelData || !_.isEqual(changes.operationNo, modelData.operationNo)))
  {
    data.operationNo = changes.operationNo;
  }
}

function validateQuantitiesDone(quantitiesDone)
{
  return Array.isArray(quantitiesDone)
    && quantitiesDone.length === 8
    && quantitiesDone.every(quantityDone => quantityDone.planned >= 0 && quantityDone.actual >= 0);
}

function validateUserInfo(userInfo)
{
  return userInfo === null
    || (typeof userInfo === 'object'
      && typeof userInfo.id === 'string'
      && typeof userInfo.label === 'string');
}

function validateTimes(startedAt, finishedAt, min, max)
{
  startedAt = moment(startedAt).valueOf();
  finishedAt = moment(finishedAt).valueOf();
  min = moment(min).valueOf();

  if (!max)
  {
    max = moment(min).add(8, 'hours').valueOf();
  }

  return !isNaN(startedAt)
    && !isNaN(finishedAt)
    && !isNaN(min)
    && startedAt !== finishedAt
    && startedAt >= min
    && finishedAt <= max;
}

function compareProperty(logEntryData, modelData, property)
{
  if (_.isEqual(logEntryData[property], modelData[property]))
  {
    delete logEntryData[property];
  }
}
