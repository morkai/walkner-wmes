// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var deepEqual = require('deep-equal');
var autoIncrement = require('mongoose-auto-increment');

module.exports = function setupKaizenOrderModel(app, mongoose)
{
  var TYPES = [
    'nearMiss',
    'suggestion',
    'kaizen'
  ];

  var STATUSES = [
    'new',
    'accepted',
    'todo',
    'inProgress',
    'paused',
    'finished',
    'cancelled'
  ];

  var observerSchema = mongoose.Schema({
    user: {},
    role: {
      type: String,
      required: true,
      enum: ['creator', 'owner', 'confirmer', 'subscriber']
    },
    lastSeenAt: Date,
    notify: Boolean,
    changes: {}
  }, {
    _id: false,
    minimize: false
  });

  var attachmentSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }, {
    id: false,
    minimize: false
  });

  var changeSchema = mongoose.Schema({
    date: Date,
    user: {},
    data: {},
    comment: {
      type: String,
      trim: true,
      default: ''
    }
  }, {
    _id: false,
    minimize: false
  });

  var kaizenOrderSchema = mongoose.Schema({
    types: {
      type: [String],
      required: true
    },
    creator: {},
    createdAt: Date,
    updater: {},
    updatedAt: Date,
    confirmer: {},
    confirmedAt: Date,
    finisher: {},
    finishedAt: Date,
    status: {
      type: 'String',
      required: true,
      enum: STATUSES
    },
    subject: {
      type: String,
      required: true
    },
    eventDate: {
      type: Date,
      default: null
    },
    section: {
      type: String,
      ref: 'KaizenSection',
      default: null
    },
    area: {
      type: String,
      ref: 'KaizenArea',
      default: null
    },
    nearMissCategory: {
      type: String,
      ref: 'KaizenCategory',
      default: null
    },
    suggestionCategory: {
      type: String,
      ref: 'KaizenCategory',
      default: null
    },
    cause: {
      type: String,
      ref: 'KaizenCause',
      default: null
    },
    causeText: {
      type: String,
      default: ''
    },
    risk: {
      type: String,
      ref: 'KaizenRisk',
      default: null
    },
    description: {
      type: String,
      default: ''
    },
    correctiveMeasures: {
      type: String,
      default: ''
    },
    suggestion: {
      type: String,
      default: ''
    },
    nearMissOwners: [{}],
    suggestionOwners: [{}],
    kaizenOwners: [{}],
    kaizenStartDate: {
      type: Date,
      default: null
    },
    kaizenFinishDate: {
      type: Date,
      default: null
    },
    kaizenDuration: {
      type: Number,
      default: 0
    },
    kaizenImprovements: {
      type: String,
      default: ''
    },
    kaizenEffect: {
      type: String,
      default: ''
    },
    observers: [observerSchema],
    attachments: [attachmentSchema],
    changes: [changeSchema]
  }, {
    id: false,
    minimize: false
  });

  kaizenOrderSchema.plugin(autoIncrement.plugin, {
    model: 'KaizenOrder',
    field: 'rid',
    startAt: 1,
    incrementBy: 1
  });

  kaizenOrderSchema.path('types').validate(function(types)
  {
    return Array.isArray(types) && types.length && types.every(function(type) { return TYPES.indexOf(type) !== -1; });
  }, 'INVALID_TYPES');

  kaizenOrderSchema.index({
    'observers.user.id': 1,
    'observers.notify': 1
  });

  kaizenOrderSchema.index({
    subject: 'text',
    causeText: 'text',
    description: 'text',
    correctiveMeasures: 'text',
    suggestion: 'text',
    kaizenImprovements: 'text',
    kaizenEffect: 'text'
  }, {
    name: 'text'
  });

  kaizenOrderSchema.statics.TOPIC_PREFIX = 'kaizen.orders';
  kaizenOrderSchema.statics.TYPES = TYPES;
  kaizenOrderSchema.statics.STATUSES = STATUSES;

  kaizenOrderSchema.pre('save', function(next)
  {
    if (this.isNew)
    {
      this.createdAt = new Date();
      this.updatedAt = this.createdAt;

      this.createObservers();
    }

    if (this.isModified('status'))
    {
      if (this.status === 'accepted')
      {
        this.confirmedAt = this.updatedAt;
      }

      if (this.status === 'finished')
      {
        this.finisher = this.updater;
        this.finishedAt = this.updatedAt;
      }
      else
      {
        this.finisher = null;
        this.finishedAt = null;
      }
    }

    this.recalcKaizenDuration();

    next();
  });

  kaizenOrderSchema.statics.markAsSeen = function(orderId, userId, done)
  {
    var KaizenOrder = this;

    KaizenOrder.findById(orderId, {_id: 1}).lean().exec(function(err, kaizenOrder)
    {
      if (err)
      {
        return done(err);
      }

      if (!kaizenOrder)
      {
        return done();
      }

      var conditions = {
        _id: kaizenOrder._id,
        'observers.user.id': userId
      };
      var update = {
        $set: {
          'observers.$.lastSeenAt': new Date(),
          'observers.$.notify': false,
          'observers.$.changes': {}
        }
      };

      KaizenOrder.collection.update(conditions, update, function(err)
      {
        if (err)
        {
          return done(err);
        }

        app.broker.publish('kaizen.orders.seen.' + userId, {
          orderId: orderId,
          userId: userId
        });
      });
    });
  };

  kaizenOrderSchema.statics.observe = function(orderId, state, userInfo, done)
  {
    this.findById(orderId, function(err, kaizenOrder)
    {
      if (err)
      {
        return done(err);
      }

      if (!kaizenOrder)
      {
        return done();
      }

      var now = new Date();
      var userId = userInfo.id.toString();
      var observerIndex = _.findIndex(kaizenOrder.observers, function(observer)
      {
        return observer.user.id === userId;
      });

      if (state)
      {
        if (observerIndex !== -1)
        {
          return done();
        }

        kaizenOrder.observers.push({
          user: {
            id: userId,
            label: userInfo.label
          },
          role: 'subscriber',
          lastSeenAt: now,
          notify: false,
          changes: {}
        });
        kaizenOrder.changes.push({
          date: now,
          user: userInfo,
          data: {observer: [0, 1]},
          comment: ''
        });
      }
      else
      {
        if (observerIndex === -1 || kaizenOrder.observers[observerIndex].role !== 'subscriber')
        {
          return done();
        }

        kaizenOrder.observers.splice(observerIndex, 1);
        kaizenOrder.changes.push({
          date: now,
          user: userInfo,
          data: {observer: [1, 0]},
          comment: ''
        });
      }

      kaizenOrder.markModified('observers');
      kaizenOrder.markModified('changes');
      kaizenOrder.save(function(err)
      {
        if (err)
        {
          return done(err);
        }

        app.broker.publish('kaizen.orders.edited', {
          model: kaizenOrder,
          user: userInfo,
          notify: null
        });
      });
    });
  };

  kaizenOrderSchema.methods.recalcKaizenDuration = function()
  {
    if (this.kaizenStartDate && this.kaizenFinishDate)
    {
      this.kaizenDuration = (this.kaizenFinishDate.getTime() - this.kaizenStartDate.getTime()) / 1000;
    }
    else
    {
      this.kaizenDuration = 0;
    }
  };

  kaizenOrderSchema.methods.createObservers = function()
  {
    var observers = {};

    observers[this.creator.id] = {
      user: this.creator,
      role: 'creator',
      lastSeenAt: this.createdAt,
      notify: false,
      changes: {}
    };

    if (this.confirmer && !observers[this.confirmer.id])
    {
      observers[this.confirmer.id] = {
        user: this.confirmer,
        role: 'confirmer',
        lastSeenAt: null,
        notify: true,
        changes: {}
      };
    }

    if (_.includes(this.types, 'nearMiss'))
    {
      _.forEach(this.nearMissOwners, addOwner);
    }

    if (_.includes(this.types, 'suggestion'))
    {
      _.forEach(this.suggestionOwners, addOwner);
    }

    if (_.includes(this.types, 'kaizen'))
    {
      _.forEach(this.kaizenOwners, addOwner);
    }

    this.observers = _.values(observers);

    function addOwner(owner)
    {
      if (!observers[owner.id])
      {
        observers[owner.id] = {
          user: owner,
          role: 'owner',
          lastSeenAt: null,
          notify: true,
          changes: {}
        };
      }
    }
  };

  kaizenOrderSchema.methods.updateObservers = function(changedProperties)
  {
    var changes = {};

    _.forEach(changedProperties, function(property) { changes[property] = true; });

    var usersToNotify = {};
    var oldObserverMap = {};
    var newObserverMap = {};

    // Observers
    _.forEach(this.observers, function(observer)
    {
      oldObserverMap[observer.user.id] = observer;

      if (observer.role === 'observer')
      {
        _.extend(observer.changes, changes);

        if (!observer.notify)
        {
          observer.notify = true;
          usersToNotify[observer.user.id] = observer.changes;
        }

        newObserverMap[observer.user.id] = observer;
      }
    });

    // Creator
    var creator = newObserverMap[this.creator.id] = oldObserverMap[this.creator.id];

    _.extend(creator.changes, changes);

    if (!creator.notify)
    {
      creator.notify = true;
      usersToNotify[creator.user.id] = creator.changes;
    }

    // Confirmer
    if (this.confirmer && !newObserverMap[this.confirmer.id])
    {
      var confirmer = oldObserverMap[this.confirmer.id];

      if (!confirmer)
      {
        confirmer = {
          user: this.confirmer,
          role: 'confirmer',
          lastSeenAt: null,
          notify: false,
          changes: {}
        };
      }

      _.extend(confirmer.changes, changes);

      if (!confirmer.notify)
      {
        confirmer.notify = true;
        usersToNotify[confirmer.user.id] = confirmer.changes;
      }

      newObserverMap[confirmer.user.id] = confirmer;
    }

    // Owners
    var owners = [];

    if (_.includes(this.types, 'nearMiss'))
    {
      owners = owners.concat(this.nearMissOwners);
    }

    if (_.includes(this.types, 'suggestion'))
    {
      owners = owners.concat(this.suggestionOwners);
    }

    if (_.includes(this.types, 'kaizen'))
    {
      owners = owners.concat(this.kaizenOwners);
    }

    _.forEach(owners, function(owner)
    {
      if (newObserverMap[owner.id])
      {
        return;
      }

      var observer = oldObserverMap[owner.id];

      if (!observer)
      {
        observer = {
          user: owner,
          role: 'owner',
          lastSeenAt: null,
          notify: false,
          changes: {}
        };
      }

      _.extend(observer.changes, changes);

      if (!observer.notify)
      {
        observer.notify = true;
        usersToNotify[observer.user.id] = observer.changes;
      }

      newObserverMap[observer.user.id] = observer;
    });

    // Updater
    var updater = newObserverMap[this.updater.id];

    if (updater)
    {
      updater.lastSeenAt = this.updatedAt;
      updater.notify = false;
      updater.changes = {};

      delete usersToNotify[updater.user.id];
    }

    this.observers = _.values(newObserverMap);

    this.markModified('observers');

    return usersToNotify;
  };

  kaizenOrderSchema.methods.applyChanges = function(input, updater)
  {
    this.updater = updater;
    this.updatedAt = new Date();

    var changes = this.compareProperties(_.pick(input, [
      'types',
      'confirmer',
      'status',
      'subject',
      'eventDate',
      'section',
      'area',
      'nearMissCategory',
      'suggestionCategory',
      'cause',
      'causeText',
      'risk',
      'description',
      'correctiveMeasures',
      'suggestion',
      'nearMissOwners',
      'suggestionOwners',
      'kaizenOwners',
      'kaizenStartDate',
      'kaizenFinishDate',
      'kaizenImprovements',
      'kaizenEffect',
      'attachments'
    ]));
    var changedProperties = Object.keys(changes);
    var comment = _.isEmpty(input.comment) || !_.isString(input.comment) ? '' : input.comment.trim();

    if (!_.isEmpty(input.comment))
    {
      changedProperties.push('comment');
    }

    if (!changedProperties.length)
    {
      return null;
    }

    this.changes.push({
      date: this.updatedAt,
      user: updater,
      data: changes || {},
      comment: comment
    });

    return this.updateObservers(changedProperties);
  };

  kaizenOrderSchema.methods.compareProperties = function(input)
  {
    var changes = {};

    _.forEach(input, function(value, key) { this.compareProperty(key, input, changes); }, this);

    return changes;
  };

  kaizenOrderSchema.methods.compareProperty = function(property, input, changes)
  {
    var oldValue = this[property];
    var newValue = input[property];

    if (/Date$/.test(property))
    {
      newValue = newValue ? new Date(newValue) : null;

      if (newValue !== null && isNaN(newValue.getTime()))
      {
        newValue = null;
      }
    }
    else if (_.isObject(oldValue) && _.isFunction(oldValue.toObject))
    {
      oldValue = oldValue.toObject();
    }
    else if (_.isString(newValue))
    {
      newValue = newValue.trim();
    }

    if (deepEqual(newValue, oldValue, {strict: true}))
    {
      return false;
    }

    changes[property] = [oldValue, newValue];
    this[property] = newValue;

    return true;
  };

  mongoose.model('KaizenOrder', kaizenOrderSchema);
};
