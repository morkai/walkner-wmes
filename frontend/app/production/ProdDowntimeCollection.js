define([
  '../time',
  '../user',
  '../data/prodLog',
  '../core/Collection',
  './ProdDowntime'
], function(
  time,
  user,
  prodLog,
  Collection,
  ProdDowntime
) {
  'use strict';

  return Collection.extend({

    model: ProdDowntime,

    rqlQuery: 'sort(-startedAt)&limit(15)',

    findFirstUnfinished: function()
    {
      return this.find(function(prodDowntime)
      {
        return prodDowntime.get('finishedAt') == null;
      });
    },

    finish: function()
    {
      var prodDowntime = this.findFirstUnfinished();

      return prodDowntime ? prodDowntime.finish() : null;
    },

    addFromInfo: function(prodShift, downtimeInfo)
    {
      var prodDowntime = new ProdDowntime({
        prodLine: prodShift.prodLine.id,
        prodShift: prodShift.id,
        prodShiftOrder: prodShift.prodShiftOrder.id || null,
        date: prodShift.get('date'),
        shift: prodShift.get('shift'),
        aor: downtimeInfo.aor,
        reason: downtimeInfo.reason,
        reasonComment: downtimeInfo.reasonComment,
        status: ProdDowntime.STATUS.UNDECIDED,
        startedAt: time.getServerMoment().toDate(),
        creator: user.getInfo(),
        master: prodShift.get('master'),
        leader: prodShift.get('leader'),
        operator: prodShift.get('operator'),
        mechOrder: prodShift.prodShiftOrder.get('mechOrder'),
        orderId: prodShift.prodShiftOrder.get('orderId'),
        operationNo: prodShift.prodShiftOrder.get('operationNo')
      });

      prodDowntime.set(
        '_id',
        prodLog.generateId(prodDowntime.get('startedAt'), prodShift.id + downtimeInfo.aor)
      );

      var limit = this.rqlQuery.limit < 1 ? Infinity : this.rqlQuery.limit;

      while (this.length >= limit)
      {
        this.pop({silent: true});
      }

      this.unshift(prodDowntime);
    }

  });
});
