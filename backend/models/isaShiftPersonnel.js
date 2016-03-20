// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupIsaShiftPersonnelModel(app, mongoose)
{
  var userSchema = mongoose.Schema({
    id: String,
    label: String
  }, {
    _id: false
  });

  var isaShiftPersonnelSchema = mongoose.Schema({
    _id: Date,
    users: [userSchema],
    updatedAt: Date
  }, {
    id: false,
    minimize: false
  });

  isaShiftPersonnelSchema.statics.TOPIC_PREFIX = 'isaShiftPersonnel';

  isaShiftPersonnelSchema.pre('save', function(next)
  {
    this.updatedAt = new Date();

    next();
  });

  mongoose.model('IsaShiftPersonnel', isaShiftPersonnelSchema);
};
