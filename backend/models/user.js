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
      required: true,
      unique: true
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    mobile: {
      type: String,
      trim: true
    },
    privileges: {
      type: [String]
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
