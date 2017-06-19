// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const transliteration = require('transliteration');

module.exports = function setupUserModel(app, mongoose)
{
  const userMobileSchema = new mongoose.Schema({
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

  const userSchema = new mongoose.Schema({
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
    searchName: String,
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
    mobile: [userMobileSchema],
    presence: {
      type: Boolean,
      default: false
    },
    presenceAt: Date
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
  userSchema.index({searchName: 1});
  userSchema.index({prodFunction: 1});
  userSchema.index({privileges: 1});
  userSchema.index({aors: 1});

  userSchema.statics.TOPIC_PREFIX = 'users';

  userSchema.pre('save', function(next)
  {
    this.searchName = transliteration
      .transliterate(this.lastName + this.firstName, {unknown: '?'})
      .replace(/[^a-zA-Z]+/g, '')
      .toUpperCase();

    next();
  });

  userSchema.statics.customizeLeanObject = function(leanModel)
  {
    delete leanModel.password;

    return leanModel;
  };

  mongoose.model('User', userSchema);
};
