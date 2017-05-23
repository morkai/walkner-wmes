// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const autoIncrement = require('mongoose-auto-increment');

module.exports = function setupMinutesForSafetyCardModel(app, mongoose)
{
  const observationSchema = new mongoose.Schema({
    what: String,
    why: String
  }, {
    _id: false,
    minimize: false
  });

  const propositionSchema = new mongoose.Schema({
    what: String,
    who: {},
    when: Date
  }, {
    _id: false,
    minimize: false
  });

  const minutesForSafetyCardSchema = new mongoose.Schema({
    creator: {},
    createdAt: Date,
    updater: {},
    updatedAt: Date,
    owner: {},
    section: String,
    date: Date,
    subject: String,
    observations: [observationSchema],
    safeBehavior: String,
    orgPropositions: [propositionSchema],
    techPropositions: [propositionSchema],
    behaviorRules: String,
    participants: {},
    users: [String]
  }, {
    id: false,
    minimize: false
  });

  minutesForSafetyCardSchema.plugin(autoIncrement.plugin, {
    model: 'MinutesForSafetyCard',
    field: 'rid',
    startAt: 1,
    incrementBy: 1
  });

  minutesForSafetyCardSchema.index({date: -1});
  minutesForSafetyCardSchema.index({section: 1});
  minutesForSafetyCardSchema.index({'participants.id': 1});
  minutesForSafetyCardSchema.index({'owner.id': 1});

  minutesForSafetyCardSchema.statics.TOPIC_PREFIX = 'minutesForSafetyCards';

  minutesForSafetyCardSchema.pre('save', function(next)
  {
    if (this.isNew)
    {
      this.createdAt = new Date();
      this.updatedAt = this.createdAt;
    }
    else
    {
      this.updatedAt = new Date();
    }

    var users = {};

    [this.creator, this.updater, this.owner].concat(this.participants).forEach(function(user)
    {
      if (user)
      {
        users[user.id] = 1;
      }
    });

    this.orgPropositions.concat(this.techPropositions).forEach(function(proposition)
    {
      (proposition.who || []).forEach(function(user)
      {
        if (user)
        {
          users[user.id] = 1;
        }
      });
    });

    this.users = Object.keys(users);

    next();
  });

  mongoose.model('MinutesForSafetyCard', minutesForSafetyCardSchema);
};
