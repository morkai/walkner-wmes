// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');

module.exports = function setupIsaRequestModel(app, mongoose)
{
  var orgUnitSchema = mongoose.Schema({
    type: String,
    id: String
  }, {
    _id: false
  });

  var isaRequestSchema = mongoose.Schema({
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
    var startTime = this.requestedAt.getTime();
    var endTime = (this.finishedAt || this.respondedAt || this.requestedAt).getTime();

    this.duration = (endTime - startTime) / 1000;
    this._wasNew = this.isNew;
    this._changes = this.modifiedPaths();

    next();
  });

  isaRequestSchema.post('save', function(doc)
  {
    if (doc._wasNew)
    {
      app.broker.publish('isaRequests.created.' + doc._id, doc.toJSON());
    }
    else if (Array.isArray(doc._changes) && doc._changes.length)
    {
      var changes = {_id: doc._id};

      _.forEach(doc._changes, function(modifiedPath)
      {
        changes[modifiedPath] = doc.get(modifiedPath);
      });
      doc._changes = null;

      app.broker.publish('isaRequests.updated.' + doc._id, changes);
    }
  });

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
