'use strict';

module.exports = function setupPressWorksheetModel(app, mongoose)
{
  var pressWorksheetOrderSchema = mongoose.Schema({
    nc12: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    operationNo: {
      type: String,
      required: true
    },
    operationName: {
      type: String,
      required: true
    },
    orderData: {},
    prodLine: {
      type: String,
      ref: 'ProdLine',
      required: true
    },
    quantityDone: {
      type: Number,
      min: 0,
      default: 0
    },
    startedAt: {
      type: String,
      required: true
    },
    finishedAt: {
      type: String,
      required: true
    },
    losses: [{}],
    downtimes: [{}]
  }, {
    _id: false
  });

  var pressWorksheetSchema = mongoose.Schema({
    date: {
      type: Date,
      required: true
    },
    shift: {
      type: Number,
      required: true,
      min: 1,
      max: 3
    },
    master: {},
    operator: {},
    operators: [{}],
    orders: [pressWorksheetOrderSchema],
    createdAt: {
      type: Date,
      required: true
    },
    creator: {}
  }, {
    id: false
  });

  pressWorksheetSchema.statics.TOPIC_PREFIX = 'pressWorksheets';

  pressWorksheetSchema.methods.createOrdersAndDowntimes = function(done)
  {
    var date = this.get('date');
    var shift = this.get('shift');
    var operators = this.get('operators');
    var workerCount = Array.isArray(operators) ? operators.length : 0;
    var creator = this.get('creator');
    var master = this.get('master');
    var operator = this.get('operator');
    var prodShiftOrders = [];
    var prodDowntimes = [];

    if (!operator && workerCount)
    {
      operator = operators[0];
    }

    this.get('orders').forEach(function(order)
    {
      var startTime = typeof order.startedAt === 'string' ? order.startedAt.split(':') : [];
      var finishTime = typeof order.finishedAt === 'string' ? order.finishedAt.split(':') : [];

      var startedAt = new Date(date);
      startedAt.setHours(startTime[0]);
      startedAt.setMinutes(startTime[1]);

      var finishedAt = new Date(date);
      finishedAt.setHours(finishTime[0]);
      finishedAt.setMinutes(finishTime[1]);

      if (isNaN(startedAt.getTime()) || isNaN(startedAt.getTime()))
      {
        return;
      }

      var orderData = order.orderData;
      var operations = {};

      if (Array.isArray(orderData.operations))
      {
        orderData.operations.forEach(function(operation)
        {
          operations[operation.no] = operation;
        });
      }
      else if (orderData.operations)
      {
        operations = orderData.operations;
      }

      orderData.operations = operations;

      var prodShiftOrder = {
        _id: generateId(startedAt, order.prodLine + order.nc12),
        prodShift: null,
        date: date,
        shift: shift,
        mechOrder: true,
        orderId: order.nc12,
        operationNo: order.operationNo,
        orderData: orderData,
        workerCount: workerCount,
        quantityDone: order.quantityDone,
        losses: Array.isArray(order.losses) && order.losses.length ? order.losses : null,
        creator: creator,
        startedAt: startedAt,
        finishedAt: finishedAt
      };

      applyProdLineOrgUnits(prodShiftOrder, order.prodLine);

      var downtimeStartTime = startedAt.getTime();

      (order.downtimes || []).forEach(function(downtime)
      {
        var startedAt = new Date(downtimeStartTime);

        downtimeStartTime = downtimeStartTime + downtime.count * 60 * 1000;

        var finishedAt = new Date(downtimeStartTime);

        prodDowntimes.push({
          _id: generateId(startedAt, prodShiftOrder._id),
          division: prodShiftOrder.division,
          subdivision: prodShiftOrder.subdivision,
          mrpControllers: prodShiftOrder.mrpControllers,
          prodFlow: prodShiftOrder.prodFlow,
          workCenter: prodShiftOrder.workCenter,
          prodLine: prodShiftOrder.prodLine,
          prodShift: null,
          prodShiftOrder: prodShiftOrder._id,
          date: prodShiftOrder.date,
          shift: prodShiftOrder.shift,
          aor: null,
          reason: downtime._id,
          reasonComment: '',
          decisionComment: '',
          status: 'confirmed',
          startedAt: startedAt,
          finishedAt: finishedAt,
          corroborator: master,
          corroboratedAt: startedAt,
          creator: null,
          master: master,
          leader: null,
          operator: operator,
          mechOrder: true,
          orderId: prodShiftOrder.orderId,
          operationNo: prodShiftOrder.operationNo
        });
      });

      prodShiftOrders.push(prodShiftOrder);
    });

    if (!prodShiftOrders.length)
    {
      return done();
    }

    mongoose.model('ProdShiftOrder').create(prodShiftOrders, function(err)
    {
      if (err)
      {
        return done(err);
      }

      if (!prodShiftOrders.length)
      {
        return done();
      }

      mongoose.model('ProdDowntime').create(prodDowntimes, done);
    });
  };

  // http://stackoverflow.com/a/7616484
  function hashCode(str)
  {
    var hash = 0;

    for (var i = 0, l = str.length; i < l; ++i)
    {
      hash = (((hash << 5) - hash) + str.charCodeAt(i)) | 0;
    }

    return hash;
  }

  function generateId(date, str)
  {
    return date.getTime().toString(36)
      + hashCode(str).toString(36)
      + Math.round(Math.random() * 10000000000000000).toString(36);
  }

  function applyProdLineOrgUnits(orgUnits, prodLineId)
  {
    var prodLine = app.prodLines.modelsById[prodLineId];

    orgUnits.division = null;
    orgUnits.subdivision = null;
    orgUnits.mrpControllers = null;
    orgUnits.prodFlow = null;
    orgUnits.workCenter = null;
    orgUnits.prodLine = null;

    if (!prodLine)
    {
      return;
    }

    orgUnits.prodLine = prodLine.get('_id');

    var workCenter = app.workCenters.modelsById[prodLine.get('workCenter')];

    if (!workCenter)
    {
      return;
    }

    orgUnits.workCenter = workCenter.get('_id');

    var prodFlow = app.prodFlows.modelsById[workCenter.get('prodFlow')];

    if (!prodFlow)
    {
      return;
    }

    orgUnits.prodFlow = prodFlow.get('_id');

    var mrpController = prodFlow.get('mrpController');

    if (!Array.isArray(mrpController) || !mrpController.length)
    {
      return;
    }

    orgUnits.mrpControllers = mrpController;

    mrpController = app.mrpControllers.modelsById[mrpController[0]];

    if (!mrpController)
    {
      return;
    }

    var subdivision = app.subdivisions.modelsById[mrpController.get('subdivision')];

    if (!subdivision)
    {
      return;
    }

    orgUnits.subdivision = subdivision.get('_id');

    var division = app.divisions.modelsById[subdivision.get('division')];

    if (!division)
    {
      return;
    }

    orgUnits.division = division.get('_id');
  }

  mongoose.model('PressWorksheet', pressWorksheetSchema);
};
