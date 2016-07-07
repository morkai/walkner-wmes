// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupXiconfHidLampModel(app, mongoose)
{
  var xiconfHidLamp = mongoose.Schema({
    _id: String,
    nc12: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    voltage: {
      type: String,
      default: '',
      trim: true
    },
    family: {
      type: [String]
    }
  }, {
    id: false,
    minimize: false
  });

  xiconfHidLamp.statics.TOPIC_PREFIX = 'xiconfHidLamps';

  mongoose.model('XiconfHidLamp', xiconfHidLamp);
};
