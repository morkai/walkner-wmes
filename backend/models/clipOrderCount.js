'use strict';

module.exports = function setupClipOrderCountModel(app, mongoose)
{
  var clipOrderCountSchema = mongoose.Schema({
    date: {
      type: Date,
      required: true
    },
    tzOffsetMs: {
      type: Number,
      required: true
    },
    mrp: {
      type: 'String',
      ref: 'MrpController',
      required: true
    },
    all: {
      type: Number,
      required: true,
      min: 0
    },
    cnf: {
      type: Number,
      required: true,
      min: 0
    },
    dlv: {
      type: Number,
      required: true,
      min: 0
    }
  }, {
    id: false
  });

  clipOrderCountSchema.index({date: 1, mrp: 1}, {unique: true});

  mongoose.model('ClipOrderCount', clipOrderCountSchema);
};
