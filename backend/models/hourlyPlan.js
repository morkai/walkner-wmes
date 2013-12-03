'use strict';

var step = require('h5.step');

module.exports = function setupHourlyPlanModel(app, mongoose)
{
  var hourlyPlanFlowSchema = mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    noPlan: {
      type: Boolean,
      default: false
    },
    level: {
      type: Number,
      min: 0,
      default: 0
    },
    hours: [Number]
  }, {
    _id: false
  });

  var hourlyPlanSchema = mongoose.Schema({
    division: {
      type: String,
      ref: 'Division',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    shift: {
      type: Number,
      min: 1,
      max: 3,
      required: true
    },
    locked: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      required: true
    },
    updatedAt: {
      type: Date,
      default: null
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    creatorLabel: {
      type: String,
      required: true
    },
    updater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    updaterLabel: {
      type: String,
      default: null
    },
    flows: [hourlyPlanFlowSchema]
  }, {
    id: false
  });

  hourlyPlanSchema.statics.TOPIC_PREFIX = 'hourlyPlans';

  hourlyPlanSchema.statics.createForShift = function(shiftId, user, done)
  {
    step(
      function queryProdFlowsStep()
      {
        mongoose.model('ProdFlow').getAllByDivisionId(shiftId.division, this.next());
      },
      function handleProdFlowsQueryResultStep(err, prodFlows)
      {
        if (err)
        {
          return this.done(done, err);
        }

        this.flows = prodFlows.map(function(prodFlow)
        {
          return {
            id: prodFlow.get('_id'),
            name: prodFlow.name,
            hours: [
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0
            ]
          };
        });
      },
      function createHourlyPlanStep()
      {
        var hourlyPlanData = {
          division: shiftId.division,
          date: shiftId.date,
          shift: shiftId.no,
          flows: this.flows,
          createdAt: new Date(),
          creator: user._id,
          creatorLabel: user.login
        };

        mongoose.model('HourlyPlan').create(hourlyPlanData, done);
      }
    );
  };

  hourlyPlanSchema.statics.lock = function(_id, user, done)
  {
    this.findOne({_id: _id}, {tasks: 0}, function(err, hourlyPlan)
    {
      if (err)
      {
        return done(err);
      }

      if (!hourlyPlan)
      {
        return done(new Error('UNKNOWN'));
      }

      hourlyPlan.lock(user, done);
    });
  };

  hourlyPlanSchema.methods.lock = function(user, done)
  {
    if (this.get('locked'))
    {
      return done(new Error('LOCKED'));
    }

    this.set({
      updatedAt: new Date(),
      locked: true
    });

    if (user)
    {
      this.set({
        updater: user._id,
        updaterLabel: user.login
      });
    }

    this.save(function(err, hourlyPlan)
    {
      if (err)
      {
        return done(err);
      }

      app.broker.publish('hourlyPlans.locked', {
        user: user,
        model: {
          _id: hourlyPlan.get('_id'),
          division: hourlyPlan.get('division'),
          date: hourlyPlan.get('date'),
          shift: hourlyPlan.get('shift')
        }
      });

      done(null, hourlyPlan);
    });
  };

  mongoose.model('HourlyPlan', hourlyPlanSchema);
};
