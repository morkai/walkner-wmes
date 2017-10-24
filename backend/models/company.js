// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupCompanyModel(app, mongoose)
{
  const companySchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    shortName: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      default: '#000000'
    }
  }, {
    id: false
  });

  companySchema.statics.TOPIC_PREFIX = 'companies';
  companySchema.statics.BROWSE_LIMIT = 1000;

  mongoose.model('Company', companySchema);
};
