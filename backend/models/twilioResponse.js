// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupTwilioResponseModel(app, mongoose)
{
  const twilioResponseSchema = new mongoose.Schema({
    request: String,
    createdAt: Date,
    payload: {}
  }, {
    id: false
  });

  mongoose.model('TwilioResponse', twilioResponseSchema);
};
