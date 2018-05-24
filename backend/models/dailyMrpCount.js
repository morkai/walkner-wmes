// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const moment = require('moment');

module.exports = function setupDailyMrpCountModel(app, mongoose)
{
  const dailyMrpCountSchema = new mongoose.Schema({
    _id: Date,
    count: {}
  }, {
    id: false,
    retainKeyOrder: true,
    minimize: false
  });

  dailyMrpCountSchema.statics.recount = function(date, done)
  {
    const DailyMrpCount = mongoose.model('DailyMrpCount');
    const PlanSettings = mongoose.model('PlanSettings');
    const ProdShift = mongoose.model('ProdShift');
    const orgUnitsModule = app.orgUnits;

    step(
      function()
      {
        DailyMrpCount
          .findById(date)
          .exec(this.parallel());

        if (orgUnitsModule)
        {
          PlanSettings
            .findById(date, {'lines._id': 1, 'lines.mrpPriority': 1})
            .lean()
            .exec(this.parallel());
        }
      },
      function(err, dailyMrpCount, planSettings)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!dailyMrpCount)
        {
          dailyMrpCount = new DailyMrpCount({_id: date});
        }

        const count = dailyMrpCount.count = {
          all: {},
          division: {},
          subdivision: {},
          mrpController: {},
          prodFlow: {},
          workCenter: {},
          prodLine: {}
        };

        if (planSettings)
        {
          planSettings.lines.forEach(planLineSettings =>
          {
            const orgUnits = orgUnitsModule.getAllForProdLine(planLineSettings._id);

            planLineSettings.mrpPriority.forEach(mrp =>
            {
              count.all[mrp] = 1;

              add(count, 'division', orgUnits, mrp);
              add(count, 'subdivision', orgUnits, mrp);
              add(count, 'mrpController', orgUnits, mrp);
              add(count, 'prodFlow', orgUnits, mrp);
              add(count, 'workCenter', orgUnits, mrp);
              add(count, 'prodLine', orgUnits, mrp);
            });
          });
        }

        this.dailyMrpCount = dailyMrpCount;

        setImmediate(this.next());
      },
      function()
      {
        const m = moment(moment.utc(date).format('YYYY-MM-DD'), 'YYYY-MM-DD').hours(6);
        const conditions = {
          date: {
            $gte: m.toDate(),
            $lt: m.add(1, 'day').toDate()
          }
        };
        const fields = {
          _id: 0,
          division: 1,
          subdivision: 1,
          prodFlow: 1,
          workCenter: 1,
          prodLine: 1,
          orderMrp: 1
        };

        ProdShift
          .find(conditions, fields)
          .lean()
          .exec(this.next());
      },
      function(err, prodShifts)
      {
        if (err)
        {
          return this.skip(err);
        }

        const {count} = this.dailyMrpCount;

        prodShifts.forEach(prodShift =>
        {
          if (!Array.isArray(prodShift.orderMrp))
          {
            return;
          }

          prodShift.orderMrp.forEach(mrp =>
          {
            count.all[mrp] = 1;

            add(count, 'division', prodShift, mrp);
            add(count, 'subdivision', prodShift, mrp);
            add(count, 'mrpController', prodShift, mrp);
            add(count, 'prodFlow', prodShift, mrp);
            add(count, 'workCenter', prodShift, mrp);
            add(count, 'prodLine', prodShift, mrp);
          });
        });
      },
      function()
      {
        const {count} = this.dailyMrpCount;

        Object.keys(count).forEach(orgUnitType =>
        {
          if (orgUnitType === 'all')
          {
            count.all = Object.keys(count.all);
          }
          else if (orgUnitType === 'mrpController')
          {
            Object.keys(count.mrpController).forEach(mrp =>
            {
              Object.keys(count.mrpController[mrp]).forEach(orgUnitType =>
              {
                count.mrpController[mrp][orgUnitType] = Object.keys(count.mrpController[mrp][orgUnitType]);
              });
            });
          }
          else
          {
            Object.keys(count[orgUnitType]).forEach(orgUnitId =>
            {
              count[orgUnitType][orgUnitId] = Object.keys(count[orgUnitType][orgUnitId]);
            });
          }
        });

        setImmediate(this.next());
      },
      function()
      {
        this.dailyMrpCount.markModified('count');
        this.dailyMrpCount.save(this.next());
      },
      function(err)
      {
        if (err)
        {
          done(err);
        }
        else
        {
          done(null, this.dailyMrpCount);
        }
      }
    );

    function add(count, orgUnitType, orgUnits, mrp)
    {
      if (orgUnitType === 'mrpController')
      {
        if (!count.mrpController[mrp])
        {
          count.mrpController[mrp] = {
            division: {},
            subdivision: {},
            prodFlow: {},
            workCenter: {},
            prodLine: {}
          };
        }

        count.mrpController[mrp].division[orgUnits.division] = 1;
        count.mrpController[mrp].subdivision[orgUnits.subdivision] = 1;
        count.mrpController[mrp].prodFlow[orgUnits.prodFlow] = 1;
        count.mrpController[mrp].workCenter[orgUnits.workCenter] = 1;
        count.mrpController[mrp].prodLine[orgUnits.prodLine] = 1;
      }
      else
      {
        const orgUnitId = orgUnits[orgUnitType];

        if (!count[orgUnitType][orgUnitId])
        {
          count[orgUnitType][orgUnitId] = {};
        }

        count[orgUnitType][orgUnitId][mrp] = 1;
      }
    }
  };

  mongoose.model('DailyMrpCount', dailyMrpCountSchema);
};
