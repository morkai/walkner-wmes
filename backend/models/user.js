// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
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
    mrps: [String],
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
    cardUid: String,
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
    minimize: false,
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
  userSchema.index({card: 1});
  userSchema.index({cardUid: 1});
  userSchema.index({lastName: 1});
  userSchema.index({searchName: 1});
  userSchema.index({prodFunction: 1});
  userSchema.index({privileges: 1});
  userSchema.index({aors: 1});

  userSchema.statics.TOPIC_PREFIX = 'users';

  userSchema.pre('save', function(next)
  {
    this.searchName = userSchema.statics.transliterateName(this.lastName + this.firstName);

    next();
  });

  userSchema.statics.customizeLeanObject = function(leanModel)
  {
    delete leanModel.password;

    return leanModel;
  };

  userSchema.statics.transliterateName = function(name)
  {
    return transliteration
      .transliterate(name, {unknown: '?'})
      .replace(/[^a-zA-Z]+/g, '')
      .toUpperCase();
  };

  userSchema.statics.anonymize = function(userId, done)
  {
    const User = this;

    step(
      function()
      {
        User.findById(userId, this.next());
      },
      function(err, user)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!user)
        {
          return this.skip(app.createError('NOT_FOUND', 400));
        }

        user.set(User.anonymizeData(userId));
        user.save(this.next());
      },
      done
    );
  };

  userSchema.statics.anonymizeData = function(userId)
  {
    return {
      login: `?${userId}?`,
      password: ']:->',
      active: false,
      firstName: '?',
      lastName: '?',
      email: '',
      prodFunction: null,
      privileges: [],
      aors: [],
      mrps: [],
      company: null,
      orgUnitType: 'unspecified',
      orgUnitId: null,
      personellId: '',
      card: '',
      cardUid: '',
      searchName: ']:->',
      kdPosition: '',
      kdDivision: '',
      kdId: -1,
      vendor: null,
      mobile: [],
      presence: false,
      gender: 'female'
    };
  };

  mongoose.model('User', userSchema);
};
