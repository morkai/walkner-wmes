// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const moment = require('moment');
const deepEqual = require('deep-equal');
const autoIncrement = require('mongoose-plugin-autoinc-fix');
const businessDays = require('../modules/reports/businessDays');

module.exports = function setupSuggestionModel(app, mongoose)
{
  const STATUSES = [
    'new',
    'accepted',
    'todo',
    'inProgress',
    'paused',
    'finished',
    'cancelled'
  ];

  const ownerSchema = new mongoose.Schema({
    id: String,
    label: String
  }, {
    _id: false,
    minimize: false
  });

  const observerSchema = new mongoose.Schema({
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

  const attachmentSchema = new mongoose.Schema({
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

  const changeSchema = new mongoose.Schema({
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

  const suggestionSchema = new mongoose.Schema({
    creator: {},
    createdAt: Date,
    updater: {},
    updatedAt: Date,
    remindedAt: Number,
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
    date: {
      type: Date,
      default: null
    },
    tzOffsetMs: {
      type: Number,
      default: 0
    },
    section: {
      type: String,
      ref: 'KaizenSection',
      default: null
    },
    categories: [{
      type: String,
      ref: 'KaizenCategory'
    }],
    productFamily: {
      type: String,
      ref: 'KaizenProductFamily',
      default: null
    },
    howItIs: {
      type: String,
      default: ''
    },
    howItShouldBe: {
      type: String,
      default: ''
    },
    suggestion: {
      type: String,
      default: ''
    },
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
    finishDuration: {
      type: Number,
      default: 0
    },
    owners: [ownerSchema],
    observers: [observerSchema],
    attachments: [attachmentSchema],
    changes: [changeSchema]
  }, {
    id: false,
    minimize: false
  });

  suggestionSchema.plugin(autoIncrement.plugin, {
    model: 'Suggestion',
    field: 'rid',
    startAt: 1,
    incrementBy: 1
  });

  suggestionSchema.index({
    'observers.user.id': 1,
    'observers.notify': 1
  });
  suggestionSchema.index({date: -1});
  suggestionSchema.index({status: 1});
  suggestionSchema.index({section: 1});
  suggestionSchema.index({categories: 1});
  suggestionSchema.index({productFamily: 1});
  suggestionSchema.index({'owners.id': 1});

  suggestionSchema.statics.TOPIC_PREFIX = 'suggestions';
  suggestionSchema.statics.STATUSES = STATUSES;

  suggestionSchema.pre('save', function(next)
  {
    if (this.isNew)
    {
      this.createdAt = new Date();
      this.updatedAt = this.createdAt;
      this.remindedAt = this.createdAt.getTime();

      this.createObservers();
    }

    const dateModified = this.isModified('date');
    const statusModified = this.isModified('status');
    const kaizenDateModified = this.isModified('kaizenFinishDate') || this.isModified('kaizenStartDate');

    if (statusModified)
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

    if (statusModified || dateModified || kaizenDateModified)
    {
      this.recalcFinishDuration();
    }

    if (dateModified || kaizenDateModified)
    {
      this.recalcKaizenDuration();
    }

    this.updateOwners();

    this.tzOffsetMs = (this.date ? this.date.getTimezoneOffset() : 0) * 60 * 1000 * -1;

    next();
  });

  suggestionSchema.statics.markAsSeen = function(orderId, userId, done)
  {
    const Suggestion = this;

    Suggestion.findById(orderId, {_id: 1}).lean().exec(function(err, suggestion)
    {
      if (err)
      {
        return done(err);
      }

      if (!suggestion)
      {
        return done();
      }

      const conditions = {
        _id: suggestion._id,
        'observers.user.id': userId
      };
      const update = {
        $set: {
          'observers.$.lastSeenAt': new Date(),
          'observers.$.notify': false,
          'observers.$.changes': {}
        }
      };

      Suggestion.collection.updateOne(conditions, update, function(err)
      {
        if (err)
        {
          return done(err);
        }

        app.broker.publish(`${Suggestion.TOPIC_PREFIX}.seen.${userId}`, {
          orderId: orderId,
          userId: userId
        });
      });
    });
  };

  suggestionSchema.statics.observe = function(orderId, state, userInfo, done)
  {
    const Suggestion = this;

    Suggestion.findById(orderId, function(err, suggestion)
    {
      if (err)
      {
        return done(err);
      }

      if (!suggestion)
      {
        return done();
      }

      const now = new Date();
      const userId = userInfo.id.toString();
      const observerIndex = _.findIndex(suggestion.observers, observer => observer.user.id === userId);

      if (state)
      {
        if (observerIndex !== -1)
        {
          return done();
        }

        suggestion.observers.push({
          user: {
            id: userId,
            label: userInfo.label
          },
          role: 'subscriber',
          lastSeenAt: now,
          notify: false,
          changes: {}
        });
        suggestion.changes.push({
          date: now,
          user: userInfo,
          data: {observer: [0, 1]},
          comment: ''
        });
      }
      else
      {
        if (observerIndex === -1 || suggestion.observers[observerIndex].role !== 'subscriber')
        {
          return done();
        }

        suggestion.observers.splice(observerIndex, 1);
        suggestion.changes.push({
          date: now,
          user: userInfo,
          data: {observer: [1, 0]},
          comment: ''
        });
      }

      suggestion.markModified('observers');
      suggestion.markModified('changes');
      suggestion.save(function(err)
      {
        if (err)
        {
          return done(err);
        }

        app.broker.publish(`${Suggestion.TOPIC_PREFIX}.edited`, {
          model: suggestion,
          user: userInfo,
          notify: null
        });
      });
    });
  };

  suggestionSchema.statics.recalcFinishDuration = function(doc, currentDate)
  {
    if (doc.status === 'cancelled')
    {
      return 0;
    }

    const fromDate = doc.date;
    const toDate = doc.kaizenFinishDate || doc.finishedAt || currentDate || moment().startOf('day').toDate();

    return 1 + businessDays.countBetweenDates(fromDate.getTime(), toDate.getTime());
  };

  suggestionSchema.statics.recalcKaizenDuration = function(doc, currentDate)
  {
    if (doc.status === 'cancelled')
    {
      return 0;
    }

    const fromDate = doc.kaizenStartDate || doc.date;
    const toDate = doc.kaizenFinishDate || currentDate || moment().startOf('day').toDate();

    return 1 + businessDays.countBetweenDates(fromDate.getTime(), toDate.getTime());
  };

  suggestionSchema.methods.recalcFinishDuration = function()
  {
    this.finishDuration = this.model('Suggestion').recalcFinishDuration(this);
  };

  suggestionSchema.methods.recalcKaizenDuration = function()
  {
    this.kaizenDuration = this.model('Suggestion').recalcKaizenDuration(this);
  };

  suggestionSchema.methods.createObservers = function()
  {
    const observers = {};

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

    _.forEach(this.suggestionOwners, addOwner);

    if (this.status !== 'new' && this.status !== 'cancelled')
    {
      _.forEach(this.kaizenOwners, addOwner);
    }

    _.forEach(this.observers, function(subscriber)
    {
      if (!observers[subscriber.user.id])
      {
        observers[subscriber.user.id] = subscriber;
      }
    });

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

  suggestionSchema.methods.updateObservers = function(changedPropertyList, changes, newSubscribers)
  {
    const changedPropertyMap = {};

    _.forEach(changedPropertyList, property => { changedPropertyMap[property] = true; });

    const usersToNotify = {};
    const oldObserverMap = {};
    const newObserverMap = {};

    // Old observers
    _.forEach(this.observers, function(observer)
    {
      oldObserverMap[observer.user.id] = observer;

      if (observer.role === 'subscriber')
      {
        _.assign(observer.changes, changedPropertyMap);

        if (!observer.notify)
        {
          observer.notify = true;
          usersToNotify[observer.user.id] = observer.changes;
        }

        newObserverMap[observer.user.id] = observer;
      }
    });

    // Creator
    const creator = newObserverMap[this.creator.id] = oldObserverMap[this.creator.id];

    _.assign(creator.changes, changedPropertyMap);

    if (!creator.notify)
    {
      creator.notify = true;
      usersToNotify[creator.user.id] = creator.changes;
    }

    // Confirmer
    if (this.confirmer && !newObserverMap[this.confirmer.id])
    {
      let confirmer = oldObserverMap[this.confirmer.id];

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

      _.assign(confirmer.changes, changedPropertyMap);

      if (!confirmer.notify)
      {
        confirmer.notify = true;
        usersToNotify[confirmer.user.id] = confirmer.changes;
      }

      newObserverMap[confirmer.user.id] = confirmer;
    }

    // Owners
    let owners = [].concat(this.suggestionOwners);

    if (this.status !== 'new' && this.status !== 'cancelled')
    {
      owners = owners.concat(this.kaizenOwners);
    }

    _.forEach(owners, function(owner)
    {
      if (newObserverMap[owner.id])
      {
        return;
      }

      let observer = oldObserverMap[owner.id];

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

      _.assign(observer.changes, changedPropertyMap);

      if (!observer.notify)
      {
        observer.notify = true;
        usersToNotify[observer.user.id] = observer.changes;
      }

      newObserverMap[observer.user.id] = observer;
    });

    // New subscribers specified in the form
    const subscribers = [];

    _.forEach(newSubscribers, function(newSubscribers)
    {
      if (!newObserverMap[newSubscribers.user.id])
      {
        newObserverMap[newSubscribers.user.id] = newSubscribers;
        usersToNotify[newSubscribers.user.id] = {};
        subscribers.push(newSubscribers.user.label);
      }
    });

    if (subscribers.length)
    {
      changes.subscribers = [null, subscribers];
    }

    // Updater
    const updater = newObserverMap[this.updater.id];

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

  suggestionSchema.methods.applyChanges = function(input, updater)
  {
    this.updater = updater;
    this.updatedAt = new Date();
    this.remindedAt = this.updatedAt.getTime();

    const changes = this.compareProperties(_.pick(input, [
      'confirmer',
      'status',
      'subject',
      'date',
      'section',
      'categories',
      'productFamily',
      'howItIs',
      'howItShouldBe',
      'suggestion',
      'suggestionOwners',
      'kaizenOwners',
      'kaizenStartDate',
      'kaizenFinishDate',
      'kaizenImprovements',
      'kaizenEffect',
      'attachments'
    ]));
    const changedProperties = Object.keys(changes);
    const comment = _.isEmpty(input.comment) || !_.isString(input.comment) ? '' : input.comment.trim();

    if (!_.isEmpty(input.comment))
    {
      changedProperties.push('comment');
    }

    if (!_.isEmpty(input.subscribers))
    {
      changedProperties.push('subscribers');
    }

    if (!changedProperties.length)
    {
      return null;
    }

    const usersToNotify = this.updateObservers(changedProperties, changes, input.subscribers);

    if (!_.isEmpty(input.subscribers))
    {
      if (_.isEmpty(changes.subscribers))
      {
        changedProperties.pop();
      }

      if (!changedProperties.length)
      {
        return null;
      }
    }

    this.changes.push({
      date: this.updatedAt,
      user: updater,
      data: changes,
      comment: comment
    });

    return usersToNotify;
  };

  suggestionSchema.methods.compareProperties = function(input)
  {
    const changes = {};

    _.forEach(input, (value, key) => { this.compareProperty(key, input, changes); });

    return changes;
  };

  suggestionSchema.methods.compareProperty = function(property, input, changes)
  {
    let oldValue = this[property];
    let newValue = input[property];

    if (/date$/i.test(property))
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

  suggestionSchema.methods.updateOwners = function()
  {
    const owners = {};
    const suggestion = this;

    _.forEach(suggestion.suggestionOwners, addOwner);

    if (this.status !== 'new' && this.status !== 'cancelled')
    {
      _.forEach(suggestion.kaizenOwners, addOwner);
    }

    this.owners = _.values(owners);

    function addOwner(owner)
    {
      owners[owner.id] = owner;
    }
  };

  mongoose.model('Suggestion', suggestionSchema);
};
