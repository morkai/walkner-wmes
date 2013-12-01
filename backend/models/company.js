'use strict';

module.exports = function setupCompanyModel(app, mongoose)
{
  var companySchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    fteMaster: {
      type: Boolean,
      default: true
    },
    fteMasterMaster: {
      type: Boolean,
      default: true
    },
    fteLeader: {
      type: Boolean,
      default: true
    }
  }, {
    id: false
  });

  companySchema.statics.TOPIC_PREFIX = 'companies';
  companySchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('Company', companySchema);
};
