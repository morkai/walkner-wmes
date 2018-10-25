// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function setupDacLogEntryModel(app, mongoose)
{
  const dacLogEntrySchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true
    },
    nodeId: {
      type: String,
      required: true
    },
    cardId: {
      type: String,
      required: true
    },
    scannedAt: {
      type: Date,
      required: true
    },
    sentAt: {
      type: Date,
      required: true
    },
    receivedAt: {
      type: Date,
      required: true
    }
  }, {
    id: false
  });

  dacLogEntrySchema.statics.TOPIC_PREFIX = 'dacLogEntries';

  dacLogEntrySchema.statics.importData = function(req, done)
  {
    if (req == null || typeof req !== 'object'
      || typeof req.nodeId !== 'string' || !req.nodeId.length
      || typeof req.time !== 'number' || req.time < 0
      || typeof req.data !== 'string' || !req.data.length)
    {
      return done(new Error('INVALID_REQUEST_DATA'));
    }

    const receivedAt = new Date();
    const dacLogEntries = [];

    _.forEach(req.data.trim().split('\n'), function(line)
    {
      const columns = line.split(';');
      const dacLogEntry = {
        _id: columns[0],
        nodeId: req.nodeId,
        cardId: columns[1],
        scannedAt: new Date(columns[2]),
        sentAt: new Date(req.time),
        receivedAt: receivedAt
      };

      if (dacLogEntry._id.length === 32
        && dacLogEntry.cardId.length
        && !isNaN(dacLogEntry.scannedAt.getTime()))
      {
        dacLogEntries.push(dacLogEntry);
      }
    });

    this.collection.insertMany(dacLogEntries, {ordered: false}, done);
  };

  mongoose.model('DacLogEntry', dacLogEntrySchema);
};
