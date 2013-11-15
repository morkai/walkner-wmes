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
    aor: String,
    company: String,
    division: String,
    personellId: String,
    card: String,
    firstName: String,
    lastName: String,
    registerDate: String,
    sapPosition: String,
    active: Boolean
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
