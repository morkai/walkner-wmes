// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const deepEqual = require('deep-equal');
const autoIncrement = require('mongoose-plugin-autoinc-fix');

module.exports = function setupPfepEntryModel(app, mongoose)
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
    minimize: false
  });

  const pfepEntrySchema = new mongoose.Schema({
    creator: {},
    createdAt: Date,
    updater: {},
    updatedAt: Date,
    nc12: String,
    description: String,
    unit: String,
    packType: String,
    externalPackQty: Number,
    internalPackQty: Number,
    packLength: Number,
    packWidth: Number,
    packHeight: Number,
    packGrossWeight: Number,
    componentNetWeight: Number,
    componentGrossWeight: Number,
    qtyPerLayer: Number,
    qtyOnPallet: Number,
    palletLength: Number,
    palletWidth: Number,
    palletHeight: Number,
    moq: Number,
    roundingValue: Number,
    vendor: String,
    notes: String,
    changes: [changeSchema]
  }, {
    id: false,
    minimize: false
  });

  pfepEntrySchema.plugin(autoIncrement.plugin, {
    model: 'PfepEntry',
    field: 'rid',
    startAt: 1,
    incrementBy: 1
  });

  pfepEntrySchema.statics.TOPIC_PREFIX = 'pfep.entries';

  pfepEntrySchema.pre('save', function(next)
  {
    if (this.isNew)
    {
      this.createdAt = new Date();
      this.updatedAt = this.createdAt;
    }

    next();
  });

  pfepEntrySchema.methods.applyChanges = function(input, updater)
  {
    this.updater = updater;
    this.updatedAt = new Date();

    const changes = this.compareProperties(_.pick(input, [
      'nc12',
      'description',
      'unit',
      'packType',
      'externalPackQty',
      'internalPackQty',
      'packLength',
      'packWidth',
      'packHeight',
      'packGrossWeight',
      'componentNetWeight',
      'componentGrossWeight',
      'qtyPerLayer',
      'qtyOnPallet',
      'palletLength',
      'palletHeight',
      'palletWidth',
      'moq',
      'roundingValue',
      'vendor',
      'notes'
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

  pfepEntrySchema.methods.compareProperties = function(input)
  {
    const changes = {};

    _.forEach(input, (value, key) => this.compareProperty(key, input, changes));

    return changes;
  };

  pfepEntrySchema.methods.compareProperty = function(property, input, changes)
  {
    let oldValue = this[property];
    this[property] = input[property];
    let newValue = this[property];

    if (oldValue && oldValue.toObject)
    {
      oldValue = oldValue.toObject();
    }

    if (newValue && newValue.toObject)
    {
      newValue = newValue.toObject();
    }

    if (typeof oldValue === 'string')
    {
      oldValue = oldValue.trim();
    }

    if (typeof newValue === 'string')
    {
      newValue = newValue.trim();
    }

    if (!deepEqual(newValue, oldValue, {strict: true}))
    {
      changes[property] = [oldValue, newValue];
    }
  };

  mongoose.model('PfepEntry', pfepEntrySchema);
};
