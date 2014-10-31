// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

  prodShiftSchema.pre('save', function(next)
  {
    this.wasNew = this.isNew;
    this.modified = this.modifiedPaths();

    next();
  });

  prodShiftSchema.post('save', function(doc)
  {
    if (app.production.recreating)
    {
      return;
    }

    if (this.wasNew)
    {
      app.broker.publish('prodShifts.created.' + doc.prodLine, doc.toJSON());
    }
    else
    {
      var changes = {_id: doc._id};

      if (!Array.isArray(this.modified))
      {
        return;
      }

      this.modified.forEach(function(modifiedPath)
      {
        changes[modifiedPath] = doc.get(modifiedPath);
      });
      this.modified = null;

      app.broker.publish('prodShifts.updated.' + doc._id, changes);
    }
  });

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
            prodShifts.length + " prod shifts (" + date + ") were found for "
              + prodLineIds.length + " prod lines: " + prodLineIds.join(', ')
          ));
        }

        var cachedProdShifts = [];

        app.production.swapToCachedProdData(prodShifts, cachedProdShifts);

        var prodLineCount = prodLineIds.length;
        var dividedQuantities = prodLineIds.map(function() { return [0, 0, 0, 0, 0, 0, 0, 0]; });

        plannedQuantities.forEach(function(plannedQuantity, hour)
        {
          var quantityForProdLine = Math.floor(plannedQuantity / prodLineCount);

          dividedQuantities.forEach(function(quantitiesForProdLine)
          {
            quantitiesForProdLine[hour] = quantityForProdLine;
          });

          for (var i = 0, l = plannedQuantity % prodLineCount; i < l; ++i)
          {
            dividedQuantities[hour % 2 ? (prodLineCount - 1 - i) : i][hour] += 1;
          }
        });

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

  prodShiftSchema.methods.isEditable = function()
  {
    return this.hasEnded();
  };

  mongoose.model('ProdShift', prodShiftSchema);
};
