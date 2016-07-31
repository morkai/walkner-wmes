// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const autoIncrement = require('mongoose-auto-increment');

module.exports = function setupPscsResultModel(app, mongoose)
{
  const pscsResultSchema = mongoose.Schema({
    startedAt: {
      type: Date,
      required: true
    },
    finishedAt: Date,
    duration: {
      type: Number,
      default: 0
    },
    creator: {},
    status: {
      type: String,
      enum: ['incomplete', 'failed', 'passed'],
      default: 'incomplete'
    },
    personnelId: {
      type: String,
      required: true
    },
    user: {},
    answers: [Number],
    validity: [Boolean]
  }, {
    id: false
  });

  pscsResultSchema.plugin(autoIncrement.plugin, {
    model: 'PscsResult',
    field: 'rid',
    startAt: 1,
    incrementBy: 1
  });

  pscsResultSchema.statics.TOPIC_PREFIX = 'pscs.results';
  pscsResultSchema.statics.BROWSE_LIMIT = 100;

  pscsResultSchema.pre('save', function(next)
  {
    let incomplete = 0;
    let valid = 0;
    let invalid = 0;

    for (let i = 0; i < this.answers.length; ++i)
    {
      if (this.answers[i] === -1)
      {
        ++incomplete;
      }
      else if (this.validity[i])
      {
        ++valid;
      }
      else
      {
        ++invalid;
      }
    }

    this.status = incomplete ? 'incomplete' : invalid ? 'failed' : 'passed';

    if (this.status !== 'incomplete')
    {
      this.finishedAt = new Date();
    }

    this.duration = this.finishedAt ? (this.finishedAt.getTime() - this.startedAt.getTime()) : 0;

    next();
  });

  mongoose.model('PscsResult', pscsResultSchema);
};
