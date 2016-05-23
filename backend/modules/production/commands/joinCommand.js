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
  var ProdDowntime = mongoose.model('ProdDowntime');
  var Setting = mongoose.model('Setting');

  step(
    function fetchDataStep()
    {
      productionModule.getProdData('shift', req.prodShiftId, this.parallel());
      ProdDowntime.find({prodShift: req.prodShiftId}).limit(8).sort({startedAt: -1}).lean().exec(this.parallel());
      Setting.find({_id: /^production/}).lean().exec(this.parallel());
      isaModule.getLineState(req.prodLineId, this.parallel());
    },
    function replyStep(err, prodShift, prodDowntimes, settings, isaLineState)
    {
      reply({
        plannedQuantities: !prodShift ? undefined : prodShift.quantitiesDone.map(d => d.planned),
        prodDowntimes: prodDowntimes || undefined,
        settings: settings || undefined,
        isaLineState: isaLineState || undefined
      });
    }
  );
};
