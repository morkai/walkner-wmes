'use strict';

var step = require('h5.step');

module.exports = function setupProdShiftModel(app, mongoose)
{
  var quantitySchema = mongoose.Schema({
    planned: {
      type: Number,
      default: 0,
      min: 0
    },
    actual: {
      type: Number,
      default: 0,
      min: 0
    }
  }, {
    _id: false
  });

  var prodShiftSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    division: {
      type: String,
      ref: 'Division',
      default: null
    },
    subdivision: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subdivision',
      default: null
    },
    mrpControllers: [{
      type: 'String',
      ref: 'MrpController'
    }],
    prodFlow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProdFlow',
      default: null
    },
    workCenter: {
      type: String,
      ref: 'WorkCenter',
      default: null
    },
    prodLine: {
      type: String,
      ref: 'ProdLine',
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
    quantitiesDone: [quantitySchema],
    creator: {},
    createdAt: {
      type: Date,
      required: true
    },
    master: {},
    leader: {},
    operator: {},
    operators: [{}]
  }, {
    id: false
  });

  prodShiftSchema.statics.TOPIC_PREFIX = 'prodShifts';

  prodShiftSchema.index({division: 1, date: -1});
  prodShiftSchema.index({subdivision: 1, date: -1});
  prodShiftSchema.index({mrpController: 1, date: -1});
  prodShiftSchema.index({prodFlow: 1, date: -1});
  prodShiftSchema.index({workCenter: 1, date: -1});
  prodShiftSchema.index({date: -1, prodLine: 1});

  prodShiftSchema.statics.setPlannedQuantities = function(
    prodLineIds, date, plannedQuantities, done)
  {
    var ProdShift = this;

    ProdShift
      .find({date: date, prodLine: {$in: prodLineIds}})
      .sort({createdAt: 1})
      .exec(function(err, prodShifts)
      {
        if (err)
        {
          return done(err);
        }

        if (prodLineIds.length !== prodShifts.length)
        {
          return done(new Error(
            prodShifts.length + " prod shifts were found for "
              + prodLineIds.length + " prod lines: " + prodLineIds.join(', ')
          ));
        }

        var cachedProdShifts = [];

        app.production.swapToCachedProdData(prodShifts, cachedProdShifts);

        var prodLineCount = prodLineIds.length;
        var dividedQuantities = prodLineIds.map(function() { return []; });

        for (var h = 0; h < 8; ++h)
        {
          var plannedQuantity = plannedQuantities[h];
          var perProdLine = Math.ceil(plannedQuantity / prodLineCount);

          for (var p = 0; p < prodLineCount; ++p)
          {
            dividedQuantities[p].push(Math.max(Math.min(perProdLine, plannedQuantity), 0));

            plannedQuantity -= perProdLine;
          }
        }

        step(
          function()
          {
            for (var i = 0, l = cachedProdShifts.length; i < l; ++i)
            {
              var prodShift = cachedProdShifts[i];
              var quantitiesDone = prodShift.quantitiesDone;

              for (var h = 0; h < 8; ++h)
              {
                quantitiesDone[h].planned = dividedQuantities[i][h];
              }

              prodShift.markModified('quantitiesDone');
              prodShift.save(this.parallel());
            }
          },
          function(err)
          {
            if (err)
            {
              return done(err);
            }

            return done(null, cachedProdShifts);
          }
        );
      });
  };

  prodShiftSchema.methods.hasEnded = function()
  {
    var prodShiftTime = this.date.getTime();
    var currentShiftTime = app.fte.getCurrentShift().date.getTime();

    return prodShiftTime < currentShiftTime;
  };

  mongoose.model('ProdShift', prodShiftSchema);
};
