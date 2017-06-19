// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const autoIncrement = require('mongoose-auto-increment');

module.exports = function setupBehaviorObsCardModel(app, mongoose)
{
  const observationSchema = new mongoose.Schema({
    id: String,
    behavior: String,
    observation: String,
    cause: String,
    safe: Boolean,
    easy: Boolean
  }, {
    _id: false,
    minimize: false
  });

  const riskSchema = new mongoose.Schema({
    risk: String,
    cause: String,
    easy: Boolean
  }, {
    _id: false,
    minimize: false
  });

  const difficultySchema = new mongoose.Schema({
    problem: String,
    solution: String,
    behavior: Boolean
  }, {
    _id: false,
    minimize: false
  });

  const behaviorObsCardSchema = new mongoose.Schema({
    creator: {},
    createdAt: Date,
    updater: {},
    updatedAt: Date,
    observer: {},
    position: String,
    section: String,
    line: String,
    date: Date,
    observations: [observationSchema],
    risks: [riskSchema],
    easyDiscussed: Boolean,
    difficulties: [difficultySchema],
    users: [String],
    anyHardObservations: Boolean,
    anyHardRisks: Boolean
  }, {
    id: false,
    minimize: false
  });

  behaviorObsCardSchema.plugin(autoIncrement.plugin, {
    model: 'BehaviourObsCard',
    field: 'rid',
    startAt: 1,
    incrementBy: 1
  });

  behaviorObsCardSchema.index({date: -1});
  behaviorObsCardSchema.index({section: 1});
  behaviorObsCardSchema.index({'observer.id': 1});
  behaviorObsCardSchema.index({users: 1});
  behaviorObsCardSchema.index({anyHardObservations: 1});
  behaviorObsCardSchema.index({anyHardRisks: 1});

  behaviorObsCardSchema.statics.TOPIC_PREFIX = 'behaviorObsCards';

  behaviorObsCardSchema.pre('save', function(next)
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

    const users = {};

    [this.creator, this.updater, this.observer].forEach(user =>
    {
      if (user)
      {
        users[user.id] = 1;
      }
    });

    this.users = Object.keys(users);
    this.anyHardObservations = _.some(this.difficulties, d => d.behavior);
    this.anyHardRisks = _.some(this.difficulties, d => !d.behavior);

    next();
  });

  mongoose.model('BehaviorObsCard', behaviorObsCardSchema);
};
