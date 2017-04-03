// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupXiconfClientSettingsModel(app, mongoose)
{
  const xiconfClientSettingsSchema = new mongoose.Schema({
    _id: String,
    updatedAt: Date,
    settings: {}
  }, {
    id: false
  });

  mongoose.model('XiconfClientSettings', xiconfClientSettingsSchema);
};
