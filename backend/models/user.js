'use strict';

module.exports = function setupUserModel(app, mongoose)
{
  var userSchema = mongoose.Schema({
    login: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    password: {
      type: String,
      trim: true,
      required: true
    },
    email: String,
    prodFunction: {
      type: String,
      enum: ['master', 'leader', 'mizusumashi', 'adjuster', 'operator', 'unspecified'],
      default: 'unspecified'
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
    }
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

  userSchema.statics.TOPIC_PREFIX = 'users';

  userSchema.statics.customizeLeanObject = function(leanModel)
  {
    delete leanModel.password;

    return leanModel;
  };

  mongoose.model('User', userSchema);
};
