'use strict';

module.exports = function setupDiagLogEntryModel(app, mongoose)
{
  var diagLogEntry = mongoose.Schema({
    type: {
      type: 'String',
      required: true
    },
    data: {},
    prodLine: {
      type: String,
      ref: 'ProdLine',
      default: null
    },
    creator: {},
    createdAt: {
      type: Date,
      default: null
    },
    savedAt: {
      type: Date,
      required: true
    }
  }, {
    id: false,
    versionKey: false
  });

  diagLogEntry.index({savedAt: -1});
  diagLogEntry.index({type: 1, savedAt: -1});
  diagLogEntry.index({prodLine: 1, savedAt: -1});

  mongoose.model('DiagLogEntry', diagLogEntry);
};
