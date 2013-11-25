'use strict';

var lodash = require('lodash');

module.exports = function setupFteLeaderEntryModel(app, mongoose)
{
  var fteLeaderTaskCompanySchema = mongoose.Schema({
    company: {
      type: String,
      ref: 'Company'
    },
    count: {
      type: Number,
      min: 0,
      max: 9999
    }
  }, {
    _id: false
  });

  var fteLeaderTaskSchema = mongoose.Schema({
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProdTask'
    },
    companies: [fteLeaderTaskCompanySchema]
  }, {
    _id: false
  });

  var fteLeaderEntrySchema = mongoose.Schema({
    aor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Aor'
    },
    date: Date,
    shift: {
      type: Number,
      min: 1,
      max: 3
    },
    tasks: [fteLeaderTaskSchema]
  }, {
    id: false
  });

  fteLeaderEntrySchema.statics.TOPIC_PREFIX = 'fte.leader';

  fteLeaderEntrySchema.statics.createForShift = function(shiftId, done)
  {
    mongoose.model('ProdTask')
      .find({aors: shiftId.aor}, {name: 1})
      .sort({name: 1})
      .lean()
      .exec(function(err, prodTasks)
      {
        if (err)
        {
          return done(err);
        }

        if (prodTasks.length === 0)
        {
          return done(lodash.extend(new Error('NO_TASKS'), {status: 400}));
        }

        mongoose.model('Company')
          .find({}, {name: 1})
          .sort({name: 1})
          .lean()
          .exec(function(err, companies)
          {
            if (err)
            {
              return done(err);
            }

            if (companies.length === 0)
            {
              return done(lodash.extend(new Error('NO_COMPANIES'), {status: 400}));
            }

            var fteLeaderEntryData = {
              aor: shiftId.aor,
              date: shiftId.date,
              shift: shiftId.shift,
              tasks: prodTasks.map(function(prodTask)
              {
                return {
                  task: prodTask._id,
                  companies: companies.map(function(company)
                  {
                    return {
                      company: company._id,
                      count: 0
                    };
                  })
                };
              })
            };

            mongoose.model('FteLeaderEntry').create(fteLeaderEntryData, done);
          });
      });
  };

  fteLeaderEntrySchema.methods.isLocked = function()
  {
    return Date.now() > this.date.getTime() + 6 * 3600 * 1000 + (this.shift * 8 * 3600 * 1000) - 1;
  };

  mongoose.model('FteLeaderEntry', fteLeaderEntrySchema);
};
