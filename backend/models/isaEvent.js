// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupIsaEventModel(app, mongoose)
{
  var orgUnitSchema = mongoose.Schema({
    type: String,
    id: String
  }, {
    _id: false
  });

  var isaEventSchema = mongoose.Schema({
    requestId: {
      type: String,
      default: null
    },
    orgUnits: [orgUnitSchema],
    type: {
      type: String,
      required: true
    },
    time: {
      type: Date,
      required: true
    },
    user: {
      type: {},
      required: true
    },
    data: {}
  }, {
    id: false,
    minimize: false,
    versionKey: false
  });

  isaEventSchema.statics.TOPIC_PREFIX = 'isaEvents';
  isaEventSchema.statics.BROWSE_LIMIT = 100;

  isaEventSchema.index({time: -1});
  isaEventSchema.index({orgUnits: 1, time: -1});

  isaEventSchema.post('save', function(doc)
  {
    app.broker.publish('isaEvents.saved', doc.toJSON());
  });

  mongoose.model('IsaEvent', isaEventSchema);
};
