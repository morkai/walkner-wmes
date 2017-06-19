// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupPingModel(app, mongoose)
{
  var pingSchema = mongoose.Schema({
    _id: String,
    host: String,
    time: Date,
    user: String,
    headers: {},
    url: String
  }, {
    id: false
  });

  pingSchema.statics.TOPIC_PREFIX = 'pings';

  mongoose.model('Ping', pingSchema);
};
