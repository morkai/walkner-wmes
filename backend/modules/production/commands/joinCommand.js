// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function joinCommand(app, productionModule, socket, req, reply)
{
  if (!_.isObject(req))
  {
    return;
  }

  var prodLineState = productionModule.getProdLineState(req.prodLineId);

  if (!prodLineState)
  {
    return productionModule.warn("Client [%s] tried to join unknown prod line: %s", socket.id, req.prodLineId);
  }

  prodLineState.onClientJoin(socket, req);

  if (!_.isFunction(reply))
  {
    return;
  }

  var isaModule = app[productionModule.config.isaId];
  var mongoose = app[productionModule.config.mongooseId];
  var Order = mongoose.model('Order');
  var ProdDowntime = mongoose.model('ProdDowntime');
  var Setting = mongoose.model('Setting');
  var dictionaries = {};

  step(
    function fetchDictionariesStep()
    {
      _.forEach(req.dictionaries, (clientUpdatedAt, moduleName) =>
      {
        if (!app.options.dictionaryModules[moduleName])
        {
          return;
        }

        var dictionary = app[moduleName];

        if (!dictionary)
        {
          return;
        }

        var serverUpdatedAt = dictionary.updatedAt;

        if (serverUpdatedAt !== -1 && serverUpdatedAt <= clientUpdatedAt)
        {
          return;
        }

        setTimeout(
          function(done)
          {
            dictionaries[moduleName] = dictionary.models
              .filter(m => !m.deactivatedAt)
              .sort((a, b) => a._id.toString().localeCompare(b._id.toString()));

            done();
          },
          Math.round(Math.random() * 20) + 1,
          this.group()
        );
      });
    },
    function fetchDataStep()
    {
      Order.findOne({_id: req.orderNo}, {qtyDone: 1}).lean().exec(this.parallel());
      productionModule.getProdData('shift', req.prodShiftId, this.parallel());
      ProdDowntime.find({prodShift: req.prodShiftId}).limit(8).sort({startedAt: -1}).lean().exec(this.parallel());
      Setting.find({_id: /^production/}).lean().exec(this.parallel());
      isaModule.getLineActiveRequests(req.prodLineId, this.parallel());
    },
    function replyStep(err, order, prodShift, prodDowntimes, settings, isaRequests)
    {
      reply({
        totalQuantityDone: order && order.qtyDone ? order.qtyDone : {total: 0, byLine: {}},
        plannedQuantities: !prodShift ? undefined : prodShift.quantitiesDone.map(d => d.planned),
        actualQuantities: !prodShift ? undefined : prodShift.quantitiesDone.map(d => d.actual),
        prodDowntimes: prodDowntimes || undefined,
        settings: settings || undefined,
        isaRequests: isaRequests || undefined,
        dictionaries: dictionaries
      });
    }
  );
};
