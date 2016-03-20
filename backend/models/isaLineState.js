// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');

module.exports = function setupIsaLineStateModel(app, mongoose)
{
  var isaLineState = mongoose.Schema({
    _id: String,
    updatedAt: {
      type: Date,
      required: true
    },
    requestId: {
      type: String,
      default: null
    },
    requestType: {
      type: String,
      enum: [null, 'pickup', 'delivery'],
      default: null
    },
    status: {
      type: String,
      enum: ['idle', 'request', 'response'],
      required: true
    },
    data: {},
    requester: {
      type: {},
      default: null
    },
    requestedAt: {
      type: Date,
      default: null
    },
    responder: {
      type: {},
      default: null
    },
    respondedAt: {
      type: Date,
      default: null
    }
  }, {
    id: false,
    minimize: false
  });

  isaLineState.statics.TOPIC_PREFIX = 'isaLineStates';
  isaLineState.statics.BROWSE_LIMIT = 1000;

  isaLineState.pre('save', function(next)
  {
    this.updatedAt = new Date();
    this._wasNew = this.isNew;
    this._changes = this.modifiedPaths();

    next();
  });

  isaLineState.post('save', function(doc)
  {
    if (doc._wasNew)
    {
      app.broker.publish('isaLineStates.created.' + doc._id, doc.toJSON());
    }
    else if (Array.isArray(doc._changes) && doc._changes.length)
    {
      var changes = {_id: doc._id};

      _.forEach(doc._changes, function(modifiedPath)
      {
        changes[modifiedPath] = doc.get(modifiedPath);
      });
      doc._changes = null;

      app.broker.publish('isaLineStates.updated.' + doc._id, changes);
    }
  });

  isaLineState.methods.update = function(request)
  {
    if (request.status === 'new')
    {
      this.set({
        status: 'request',
        requestId: request._id,
        requestType: request.type,
        requester: request.requester,
        requestedAt: request.requestedAt,
        data: request.data
      });
    }
    else if (request.status === 'accepted')
    {
      this.set({
        status: 'response',
        responder: request.responder,
        respondedAt: request.respondedAt,
        data: request.data
      });
    }
    else
    {
      this.set({
        status: 'idle',
        requestId: null,
        requestType: null,
        requester: null,
        requestedAt: null,
        responder: null,
        respondedAt: null,
        data: {}
      });
    }

    return this;
  };

  mongoose.model('IsaLineState', isaLineState);
};
