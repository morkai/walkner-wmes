// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const deepEqual = require('deep-equal');
const autoIncrement = require('mongoose-auto-increment');

module.exports = function setupQiResultModel(app, mongoose)
{
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
    minimize: false,
    toObject: {
      retainKeyOrder: true
    }
  });

  const qiCorrectiveActionSchema = new mongoose.Schema({
    what: {
      type: String,
      required: true
    },
    when: {
      type: Date,
      default: null
    },
    who: {},
    status: {
      type: String,
      ref: 'QiActionStatus',
      required: true
    }
  }, {
    _id: false,
    minimize: false,
    toObject: {
      retainKeyOrder: true
    }
  });

  const qiResultSchema = new mongoose.Schema({
    ok: {
      type: Boolean,
      required: true
    },
    creator: {},
    createdAt: Date,
    updater: {},
    updatedAt: Date,
    inspector: {},
    inspectedAt: {
      type: Date,
      required: true
    },
    nokOwner: {},
    division: {
      type: String,
      required: true
    },
    orderNo: {
      type: String,
      required: true
    },
    nc12: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    productFamily: {
      type: String,
      required: true
    },
    kind: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'QiKind'
    },
    faultCode: {
      type: String,
      ref: 'QiFault'
    },
    faultDescription: {
      type: String,
      trim: true
    },
    errorCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QiErrorCategory'
    },
    problem: {
      type: String,
      trim: true
    },
    immediateActions: {
      type: String,
      trim: true
    },
    immediateResults: {
      type: String,
      trim: true,
      default: ''
    },
    rootCause: {
      type: String,
      trim: true
    },
    correctiveActions: [qiCorrectiveActionSchema],
    qtyOrder: {
      type: Number,
      default: 0,
      min: 0
    },
    qtyInspected: {
      type: Number,
      default: 0,
      min: 0
    },
    qtyToFix: {
      type: Number,
      default: 0,
      min: 0
    },
    qtyNok: {
      type: Number,
      default: 0,
      min: 0
    },
    qtyNokInspected: {
      type: Number,
      default: 0,
      min: 0
    },
    okFile: {
      type: {},
      default: null
    },
    nokFile: {
      type: {},
      default: null
    },
    changes: [changeSchema],
    users: [String]
  }, {
    id: false,
    minimize: false,
    toObject: {
      retainKeyOrder: true
    }
  });

  qiResultSchema.plugin(autoIncrement.plugin, {
    model: 'QiResult',
    field: 'rid',
    startAt: 1,
    incrementBy: 1
  });

  qiResultSchema.statics.TOPIC_PREFIX = 'qi.results';

  qiResultSchema.index({'users': 1});
  qiResultSchema.index({'inspector.id': 1});
  qiResultSchema.index({'nokOwner.id': 1});
  qiResultSchema.index({inspectedAt: -1});
  qiResultSchema.index({division: 1});
  qiResultSchema.index({orderNo: 1});
  qiResultSchema.index({nc12: 1});
  qiResultSchema.index({productFamily: 1});
  qiResultSchema.index({kind: 1});
  qiResultSchema.index({faultCode: 1});
  qiResultSchema.index({errorCategory: 1});
  qiResultSchema.index({'correctiveActions.status': 1});

  qiResultSchema.pre('save', function(next)
  {
    if (this.isNew)
    {
      this.createdAt = new Date();
      this.updatedAt = this.createdAt;
    }

    this.users = this.collectUsers();

    next();
  });

  qiResultSchema.methods.collectUsers = function()
  {
    var users = {};

    users[this.creator.id] = 1;

    if (this.updater)
    {
      users[this.updater.id] = 1;
    }

    if (this.inspector)
    {
      users[this.inspector.id] = 1;
    }

    if (this.nokOwner)
    {
      users[this.nokOwner.id] = 1;
    }

    _.forEach(this.changes, function(change)
    {
      if (change.user)
      {
        users[change.user.id] = 1;
      }
    });

    _.forEach(this.correctiveActions, function(action)
    {
      _.forEach(action.who, function(user)
      {
        users[user.id] = 1;
      });
    });

    return Object.keys(users);
  };

  qiResultSchema.methods.applyChanges = function(input, updater)
  {
    this.updater = updater;
    this.updatedAt = new Date();

    const changes = this.compareProperties(_.pick(input, [
      'ok',
      'inspector',
      'inspectedAt',
      'nokOwner',
      'division',
      'orderNo',
      'nc12',
      'productName',
      'productFamily',
      'kind',
      'faultCode',
      'faultDescription',
      'errorCategory',
      'problem',
      'immediateActions',
      'immediateResults',
      'rootCause',
      'correctiveActions',
      'qtyOrder',
      'qtyInspected',
      'qtyToFix',
      'qtyNok',
      'qtyNokInspected',
      'okFile',
      'nokFile'
    ]));
    const changedProperties = Object.keys(changes);
    const comment = _.isEmpty(input.comment) || !_.isString(input.comment) ? '' : input.comment.trim();

    if (!_.isEmpty(input.comment))
    {
      changedProperties.push('comment');
    }

    if (!changedProperties.length)
    {
      return false;
    }

    if (!this.changes)
    {
      this.changes = [];
    }

    this.changes.push({
      date: this.updatedAt,
      user: updater,
      data: changes,
      comment: comment
    });

    return true;
  };

  qiResultSchema.methods.compareProperties = function(input)
  {
    const changes = {};

    _.forEach(input, (value, key) => this.compareProperty(key, input, changes));

    return changes;
  };

  qiResultSchema.methods.compareProperty = function(property, input, changes)
  {
    let oldValue = this[property];
    this[property] = input[property];
    let newValue = this[property];

    if (typeof oldValue === 'string')
    {
      oldValue = oldValue.trim();
    }

    if (typeof newValue === 'string')
    {
      newValue = newValue.trim();
    }

    if (property === 'correctiveActions')
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

  mongoose.model('QiResult', qiResultSchema);
};
