// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const deepEqual = require('deep-equal');
const autoIncrement = require('mongoose-auto-increment');
const businessDays = require('../modules/reports/businessDays');

module.exports = function setupD8EntryModel(app, mongoose)
{
  const STATUSES = [
    'open',
    'closed'
  ];

  const memberSchema = mongoose.Schema({
    id: String,
    label: String
  }, {
    _id: false,
    minimize: false
  });

  const stripSchema = mongoose.Schema({
    no: String,
    date: Date,
    family: String
  }, {
    _id: false,
    minimize: false
  });

  const userInfoSchema = mongoose.Schema({
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  }, {
    _id: false,
    minimize: false
  });

  const attachmentSchema = mongoose.Schema({
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
    }
  }, {
    id: false,
    minimize: false
  });

  const observerSchema = mongoose.Schema({
    user: {},
    role: {
      type: String,
      required: true,
      enum: ['creator', 'owner', 'member', 'subscriber']
    },
    lastSeenAt: Date,
    notify: Boolean,
    changes: {}
  }, {
    _id: false,
    minimize: false
  });

  const changeSchema = mongoose.Schema({
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

  const d8EntrySchema = mongoose.Schema({
    creator: userInfoSchema,
    createdAt: Date,
    updater: userInfoSchema,
    updatedAt: Date,
    owner: userInfoSchema,
    status: {
      type: 'String',
      required: true,
      enum: STATUSES
    },
    division: {
      type: String,
      ref: 'Division',
      default: null
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    strips: [stripSchema],
    problemDescription: {
      type: String,
      default: '',
      trim: true
    },
    problemSource: {
      type: String,
      ref: 'D8ProblemSource',
      required: true
    },
    entrySource: {
      type: String,
      ref: 'D8EntrySource',
      required: true
    },
    crsRegisterDate: {
      type: Date,
      default: null
    },
    d8OpenDate: {
      type: Date,
      default: null
    },
    d8CloseDate: {
      type: Date,
      default: null
    },
    d5CloseDate: {
      type: Date,
      default: null
    },
    d5PlannedCloseDate: {
      type: Date,
      default: null
    },
    attachment: attachmentSchema,
    duration: {
      type: Number,
      default: 0
    },
    members: [memberSchema],
    observers: [observerSchema],
    changes: [changeSchema]
  }, {
    id: false,
    minimize: false
  });

  d8EntrySchema.plugin(autoIncrement.plugin, {
    model: 'D8Entry',
    field: 'rid',
    startAt: 1,
    incrementBy: 1
  });

  d8EntrySchema.index({
    'observers.user.id': 1,
    'observers.notify': 1
  });
  d8EntrySchema.index({'strips.date': -1});
  d8EntrySchema.index({'strips.no': -1});
  d8EntrySchema.index({status: 1});
  d8EntrySchema.index({division: 1});
  d8EntrySchema.index({d8OpenDate: -1});

  d8EntrySchema.statics.TOPIC_PREFIX = 'd8.entries';
  d8EntrySchema.statics.STATUSES = STATUSES;

  d8EntrySchema.pre('save', function(next)
  {
    if (this.isNew)
    {
      this.createdAt = new Date();
      this.updatedAt = this.createdAt;

      this.createObservers();
    }

    if (this.isModified('status')
      || this.isModified('d8OpenDate')
      || this.isModified('d8CloseDate')
      || this.isModified('strips'))
    {
      this.recalcDuration();
    }

    next();
  });

  d8EntrySchema.statics.recalcDuration = function(doc, currentDate)
  {
    let fromDate = doc.d8OpenDate;

    if (!fromDate)
    {
      let minStripDate = null;

      _.forEach(doc.strips, function(strip)
      {
        if (strip.date < minStripDate)
        {
          minStripDate = strip.date;
        }
      });

      fromDate = minStripDate || doc.createdAt;
    }

    const toDate = doc.d8CloseDate || currentDate || new Date();

    return 1 + businessDays.countBetweenDates(fromDate.getTime(), toDate.getTime());
  };

  d8EntrySchema.statics.markAsSeen = function(entryId, userId, done)
  {
    const D8Entry = this;

    D8Entry.findById(entryId, {_id: 1}).lean().exec(function(err, entry)
    {
      if (err)
      {
        return done(err);
      }

      if (!entry)
      {
        return done();
      }

      const conditions = {
        _id: entry._id,
        'observers.user.id': userId
      };
      const update = {
        $set: {
          'observers.$.lastSeenAt': new Date(),
          'observers.$.notify': false,
          'observers.$.changes': {}
        }
      };

      D8Entry.collection.update(conditions, update, function(err)
      {
        if (err)
        {
          return done(err);
        }

        app.broker.publish(D8Entry.TOPIC_PREFIX + '.seen.' + userId, {
          entryId: entryId,
          userId: userId
        });
      });
    });
  };

  d8EntrySchema.statics.observe = function(entryId, state, userInfo, done)
  {
    const D8Entry = this;

    D8Entry.findById(entryId, function(err, entry)
    {
      if (err)
      {
        return done(err);
      }

      if (!entry)
      {
        return done();
      }

      const now = new Date();
      const userId = userInfo.id.toString();
      const observerIndex = _.findIndex(entry.observers, observer => observer.user.id === userId);

      if (state)
      {
        if (observerIndex !== -1)
        {
          return done();
        }

        entry.observers.push({
          user: {
            id: userId,
            label: userInfo.label
          },
          role: 'subscriber',
          lastSeenAt: now,
          notify: false,
          changes: {}
        });
        entry.changes.push({
          date: now,
          user: userInfo,
          data: {observer: [0, 1]},
          comment: ''
        });
      }
      else
      {
        if (observerIndex === -1 || entry.observers[observerIndex].role !== 'subscriber')
        {
          return done();
        }

        entry.observers.splice(observerIndex, 1);
        entry.changes.push({
          date: now,
          user: userInfo,
          data: {observer: [1, 0]},
          comment: ''
        });
      }

      entry.markModified('observers');
      entry.markModified('changes');
      entry.save(function(err)
      {
        if (err)
        {
          return done(err);
        }

        app.broker.publish(D8Entry.TOPIC_PREFIX + '.edited', {
          model: entry,
          user: userInfo,
          notify: null
        });
      });
    });
  };

  d8EntrySchema.methods.recalcDuration = function()
  {
    this.duration = this.model('D8Entry').recalcDuration(this);
  };

  d8EntrySchema.methods.getUserRole = function(user)
  {
    if (this.creator.id === user._id)
    {
      return 'creator';
    }

    if (this.owner.id === user._id)
    {
      return 'owner';
    }

    if (_.any(this.members, member => member.id === user._id))
    {
      return 'member';
    }

    return 'observer';
  };

  d8EntrySchema.methods.createObservers = function()
  {
    const observers = {};

    if (this.owner && !observers[this.owner.id])
    {
      observers[this.owner.id] = {
        user: this.owner,
        role: 'owner',
        lastSeenAt: null,
        notify: true,
        changes: {}
      };
    }

    _.forEach(this.members, function(member)
    {
      if (!observers[member.id])
      {
        observers[member.id] = {
          user: member,
          role: 'member',
          lastSeenAt: null,
          notify: true,
          changes: {}
        };
      }
    });

    if (!observers[this.creator.id])
    {
      observers[this.creator.id] = {
        user: this.creator,
        role: 'creator',
        lastSeenAt: this.createdAt,
        notify: false,
        changes: {}
      };
    }

    _.forEach(this.observers, function(subscriber)
    {
      if (!observers[subscriber.user.id])
      {
        observers[subscriber.user.id] = subscriber;
      }
    });

    this.observers = _.values(observers);
  };

  d8EntrySchema.methods.updateObservers = function(changedPropertyList, changes, newSubscribers)
  {
    const changedPropertyMap = {};

    _.forEach(changedPropertyList, function(property) { changedPropertyMap[property] = true; });

    const usersToNotify = {};
    const oldObserverMap = {};
    const newObserverMap = {};

    // Owner
    if (this.owner && !newObserverMap[this.owner.id])
    {
      var owner = oldObserverMap[this.owner.id];

      if (!owner)
      {
        owner = {
          user: this.owner,
          role: 'owner',
          lastSeenAt: null,
          notify: false,
          changes: {}
        };
      }

      _.assign(owner.changes, changedPropertyMap);

      if (!owner.notify)
      {
        owner.notify = true;
        usersToNotify[owner.user.id] = owner.changes;
      }

      newObserverMap[owner.user.id] = owner;
    }

    // Members
    _.forEach(this.members, function(member)
    {
      if (newObserverMap[member.id])
      {
        return;
      }

      var observer = oldObserverMap[member.id];

      if (!observer)
      {
        observer = {
          user: member,
          role: 'member',
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

    // Old observers
    _.forEach(this.observers, function(observer)
    {
      oldObserverMap[observer.user.id] = observer;

      if (observer.role === 'subscriber' && !newObserverMap[observer.user.id])
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
    var creator = newObserverMap[this.creator.id] = oldObserverMap[this.creator.id];

    _.assign(creator.changes, changedPropertyMap);

    if (!creator.notify)
    {
      creator.notify = true;
      usersToNotify[creator.user.id] = creator.changes;
    }

    // New subscribers specified in the form
    var subscribers = [];

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

  d8EntrySchema.methods.applyChanges = function(input, updater)
  {
    this.updater = updater;
    this.updatedAt = new Date();

    const changes = this.compareProperties(_.pick(input, [
      'owner',
      'status',
      'division',
      'strips',
      'subject',
      'problemDescription',
      'problemSource',
      'entrySource',
      'members',
      'crsRegisterDate',
      'd8OpenDate',
      'd8CloseDate',
      'd5CloseDate',
      'd5PlannedCloseDate',
      'attachment'
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

    var usersToNotify = this.updateObservers(changedProperties, changes, input.subscribers);

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

  d8EntrySchema.methods.compareProperties = function(input)
  {
    var changes = {};

    _.forEach(input, (value, key) => { this.compareProperty(key, input, changes); });

    return changes;
  };

  d8EntrySchema.methods.compareProperty = function(property, input, changes)
  {
    let oldValue = this[property];
    this[property] = input[property];
    let newValue = this[property];

    if (property === 'strips' || property === 'members')
    {
      oldValue = oldValue.toObject();

      if (newValue && newValue.toObject)
      {
        newValue = newValue.toObject();
      }

      if (!deepEqual(newValue, oldValue, {strict: true}))
      {
        changes[property] = [oldValue, newValue];
      }

      return;
    }

    if (this.isModified(property))
    {
      changes[property] = [oldValue, newValue];
    }
  };

  mongoose.model('D8Entry', d8EntrySchema);
};
