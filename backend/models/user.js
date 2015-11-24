// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupUserModel(app, mongoose)
{
  var userMobileSchema = mongoose.Schema({
    fromTime: {
      type: String,
      required: true,
      pattern: /^[0-9]{2}:[0-9]{2}$/
    },
    toTime: {
      type: String,
      required: true,
      pattern: /^[0-9]{2}:[0-9]{2}$/
    },
    number: {
      type: String,
      required: true
    }
  }, {
    _id: false
  });

  var userSchema = mongoose.Schema({
    login: {
      type: String,
      trim: true,
      required: true
    },
    password: {
      type: String,
      trim: true,
      required: true
    },
    email: String,
    prodFunction: {
      type: String,
      ref: 'ProdFunction',
      default: null
    },
    privileges: [String],
    aors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Aor'
    }],
    company: {
      type: String,
      ref: 'Company'
    },
    orgUnitType: {
      type: String,
      enum: ['division', 'subdivision', 'unspecified'],
      default: 'unspecified'
    },
    orgUnitId: {
      type: String,
      default: null
    },
    personellId: String,
    card: String,
    firstName: String,
    lastName: String,
    registerDate: String,
    active: Boolean,
    kdPosition: String,
    kdDivision: String,
    kdId: {
      type: Number,
      default: -1
    },
    vendor: {
      type: String,
      ref: 'Vendor',
      default: null
    },
    gender: {
      type: String,
      enum: ['female', 'male'],
      default: 'male'
    },
    mobile: [userMobileSchema]
  }, {
    id: false,
    toJSON: {
      transform: function(alarm, ret)
      {
        delete ret.password;

        return ret;
      }
    }
  });

  userSchema.index({kdId: 1});
  userSchema.index({login: 1});
  userSchema.index({personellId: 1});
  userSchema.index({lastName: 1});
  userSchema.index({prodFunction: 1});
  userSchema.index({privileges: 1});

  userSchema.statics.TOPIC_PREFIX = 'users';

  userSchema.statics.customizeLeanObject = function(leanModel)
  {
    delete leanModel.password;

    return leanModel;
  };

  mongoose.model('User', userSchema);
};
