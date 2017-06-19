// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function setupProdDowntimeAlertModel(app, mongoose)
{
  const userInfoSchema = new mongoose.Schema({
    id: String,
    label: String
  }, {
    _id: false
  });

  const usedObjectSchema = new mongoose.Schema({
    type: String,
    id: String,
    label: String
  }, {
    _id: false
  });

  const conditionSchema = new mongoose.Schema({
    mode: {
      type: 'String',
      required: true,
      enum: ['include', 'exclude']
    },
    type: {
      type: 'String',
      required: true,
      enum: ['reason', 'aor', 'division', 'subdivision', 'mrpController', 'prodFlow', 'workCenter', 'prodLine']
    },
    labels: [String],
    values: [String]
  }, {
    _id: false
  });

  const actionSchema = new mongoose.Schema({
    delay: Number,
    sendEmail: Boolean,
    sendSms: Boolean,
    informAor: Boolean,
    informManager: Boolean,
    informMaster: Boolean,
    informLeader: Boolean,
    userWhitelist: [userInfoSchema],
    userBlacklist: [userInfoSchema]
  }, {
    _id: false
  });

  const prodDowntimeAlertSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    repeatInterval: {
      type: Number,
      default: 0
    },
    conditions: [conditionSchema],
    actions: [actionSchema],
    userWhitelist: [userInfoSchema],
    userBlacklist: [userInfoSchema],
    usedObjects: [usedObjectSchema]
  }, {
    id: false
  });

  prodDowntimeAlertSchema.statics.TOPIC_PREFIX = 'prodDowntimeAlerts';

  prodDowntimeAlertSchema.pre('save', function(next)
  {
    this.resetUsedObjects();

    next();
  });

  prodDowntimeAlertSchema.methods.resetUsedObjects = function()
  {
    const usedObjects = {};
    const addUser = function(userInfo)
    {
      usedObjects[userInfo.id] = {
        type: 'user',
        id: userInfo.id,
        label: userInfo.label
      };
    };

    _.forEach(this.conditions, function(condition)
    {
      _.forEach(condition.values, function(value, i)
      {
        usedObjects[condition.type + value] = {
          type: condition.type,
          id: value,
          label: condition.labels[i]
        };
      });
    });

    _.forEach(this.actions, function(action)
    {
      _.forEach(action.userWhitelist, addUser);
      _.forEach(action.userBlacklist, addUser);
    });

    _.forEach(this.userWhitelist, addUser);
    _.forEach(this.userBlacklist, addUser);

    this.usedObjects = _.values(usedObjects);
  };

  mongoose.model('ProdDowntimeAlert', prodDowntimeAlertSchema);
};
