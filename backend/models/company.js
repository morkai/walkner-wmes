// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupCompanyModel(app, mongoose)
{
  var companySchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    name: {
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
