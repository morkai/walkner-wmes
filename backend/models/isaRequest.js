// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function setupIsaRequestModel(app, mongoose)
{
  const orgUnitSchema = new mongoose.Schema({
    type: String,
    id: String
  }, {
    _id: false
  });

  const isaRequestSchema = new mongoose.Schema({
    _id: String,
    orgUnits: [orgUnitSchema],
    type: {
      type: String,
      enum: ['pickup', 'delivery'],
      required: true
    },
    status: {
      type: String,
      enum: ['new', 'accepted', 'finished', 'cancelled'],
      default: 'new'
    },
    data: {},
    requester: {
      type: {},
      required: true
    },
    requestedAt: {
      type: Date,
      required: true
    },
    responder: {
      type: {},
      default: null
    },
    respondedAt: {
      type: Date,
      default: null
    },
    finisher: {
      type: {},
      default: null
    },
    finishedAt: {
      type: Date,
      default: null
    },
    duration: {
      type: Number,
      default: 0
    },
    updatedAt: {
      type: Date,
      default: null
    }
  }, {
    id: false,
    minimize: false
  });

  isaRequestSchema.statics.TOPIC_PREFIX = 'isaRequests';
  isaRequestSchema.statics.BROWSE_LIMIT = 100;

  isaRequestSchema.index({requestedAt: -1});
  isaRequestSchema.index({orgUnits: 1, requestedAt: -1});
  isaRequestSchema.index({status: 1, requestedAt: -1});
  isaRequestSchema.index({type: 1, requestedAt: -1});

  isaRequestSchema.pre('save', function(next)
  {
    const startTime = this.requestedAt.getTime();
    const endTime = (this.finishedAt || this.respondedAt || this.requestedAt).getTime();

    this.duration = (endTime - startTime) / 1000;
    this.updatedAt = new Date();
    this._wasNew = this.isNew;
    this._changes = this.modifiedPaths();

    next();
  });

  isaRequestSchema.post('save', function(doc)
  {
    if (doc._wasNew)
    {
      app.broker.publish(`isaRequests.created.${this.getProdLineId()}.${doc._id}`, doc);
    }
    else if (Array.isArray(doc._changes) && doc._changes.length)
    {
      const changes = {_id: doc._id};

      _.forEach(doc._changes, function(modifiedPath)
      {
        changes[modifiedPath] = doc.get(modifiedPath);
      });
      doc._changes = null;

      app.broker.publish(`isaRequests.updated.${this.getProdLineId()}.${doc._id}`, changes);
    }
  });

  isaRequestSchema.methods.getProdLineId = function()
  {
    const lastOrgUnit = _.last(this.orgUnits);

    if (lastOrgUnit.type === 'prodLine')
    {
      return lastOrgUnit.id;
    }

    const prodLine = this.orgUnits.find(orgUnit => orgUnit.type === 'prodLine');

    return prodLine ? prodLine.id : null;
  };

  isaRequestSchema.methods.accept = function(responder)
  {
    this.status = 'accepted';
    this.responder = responder;
    this.respondedAt = new Date();
  };

  isaRequestSchema.methods.finish = function(finisher)
  {
    this.status = 'finished';
    this.finisher = finisher;
    this.finishedAt = new Date();
  };

  isaRequestSchema.methods.cancel = function(finisher)
  {
    this.status = 'cancelled';
    this.finisher = finisher;
    this.finishedAt = new Date();
  };

  mongoose.model('IsaRequest', isaRequestSchema);
};
