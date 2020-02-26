// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../user',
  '../data/prodLog',
  '../core/Collection',
  '../core/util/matchesEquals',
  '../data/orgUnits',
  '../orgUnits/util/limitOrgUnits',
  './ProdDowntime'
], function(
  _,
  time,
  user,
  prodLog,
  Collection,
  matchesEquals,
  orgUnits,
  limitOrgUnits,
  ProdDowntime
) {
  'use strict';

  var VALID_TERM_NAMES = {
    eq: true,
    ne: true,
    in: true,
    nin: true
  };

  return Collection.extend({

    model: ProdDowntime,

    rqlQuery: function(rql)
    {
      var selector = [
        {
          name: 'in',
          args: ['status', ['undecided', 'rejected']]
        },
        {
          name: 'ge',
          args: ['startedAt', time.getMoment().subtract(2, 'weeks').startOf('day').hours(6).valueOf()]
        }
      ];

      if (!user.isAllowedTo('PROD_DOWNTIMES:ALL'))
      {
        limitOrgUnits(selector, {divisionType: 'prod'});
      }

      var userAors = user.data.aors;

      if (Array.isArray(userAors))
      {
        if (userAors.length === 1)
        {
          selector.push({name: 'eq', args: ['aor', userAors[0]]});
        }
        else if (userAors.length > 1)
        {
          selector.push({name: 'in', args: ['aor', userAors]});
        }
      }

      return rql.Query.fromObject({
        fields: {
          rid: 1,
          aor: 1,
          reason: 1,
          mrpControllers: 1,
          prodFlow: 1,
          prodLine: 1,
          status: 1,
          startedAt: 1,
          finishedAt: 1,
          date: 1,
          shift: 1,
          pressWorksheet: 1,
          changesCount: 1,
          orderData: 1
        },
        sort: {
          startedAt: -1
        },
        limit: -1337,
        selector: {
          name: 'and',
          args: selector
        }
      });
    },

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
      var shiftDate = prodShift.get('date');
      var startedAt = downtimeInfo.startedAt || time.getMoment().toDate();

      if (startedAt < shiftDate)
      {
        startedAt = new Date(shiftDate.getTime());
      }

      var prodDowntime = new ProdDowntime({
        division: prodShift.get('division'),
        subdivision: prodShift.get('subdivision'),
        subdivisionType: prodShift.prodShiftOrder.get('subdivisionType'),
        mrpControllers: prodShift.get('mrpControllers'),
        prodFlow: prodShift.get('prodFlow'),
        workCenter: prodShift.get('workCenter'),
        prodLine: prodShift.prodLine.id,
        prodShift: prodShift.id,
        prodShiftOrder: prodShift.prodShiftOrder.id || null,
        date: shiftDate,
        shift: prodShift.get('shift'),
        aor: downtimeInfo.aor,
        reason: downtimeInfo.reason,
        reasonComment: downtimeInfo.reasonComment,
        status: ProdDowntime.STATUS.UNDECIDED,
        startedAt: startedAt,
        creator: user.getInfo(),
        master: prodShift.get('master'),
        leader: prodShift.get('leader'),
        operator: prodShift.get('operator'),
        operators: prodShift.get('operators'),
        mechOrder: prodShift.prodShiftOrder.get('mechOrder'),
        orderId: prodShift.prodShiftOrder.get('orderId'),
        operationNo: prodShift.prodShiftOrder.get('operationNo'),
        auto: downtimeInfo.auto || null
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

      return prodDowntime;
    },

    hasOrMatches: function(data)
    {
      if (data._id)
      {
        var prodDowntime = this.get(data._id);

        if (prodDowntime)
        {
          return true;
        }
      }

      return matchesEquals(this.rqlQuery, 'status', data.status)
        && this.matchProp('aor', data)
        && this.matchProp('reason', data)
        && this.matchProp(orgUnits.TYPES, data)
        && matchesEquals(this.rqlQuery, 'prodShift', data.prodShift)
        && matchesEquals(this.rqlQuery, 'prodShiftOrder', data.prodShiftOrder)
        && matchesEquals(this.rqlQuery, 'orderId', data.orderId);
    },

    matchProp: function(props, data)
    {
      if (typeof props === 'string')
      {
        var k = props;
        props = {};
        props[k] = true;
      }

      var term = _.find(this.rqlQuery.selector.args, function(term)
      {
        return VALID_TERM_NAMES[term.name] && props[term.args[0]];
      });

      if (!term)
      {
        return true;
      }

      var prop = term.args[0];
      var required = term.args[1];
      var actual = data[prop];

      if (term.name === 'eq')
      {
        return actual === required;
      }

      if (term.name === 'ne')
      {
        return actual !== required;
      }

      if (term.name === 'in')
      {
        return required.indexOf(actual) !== -1;
      }

      if (term.name === 'nin')
      {
        return required.indexOf(actual) === -1;
      }

      return true;
    },

    refresh: function(newDowntimes)
    {
      var oldDowntimes = this.toJSON();

      newDowntimes = newDowntimes.map(function(d) { return ProdDowntime.parse(d); });

      var newLatestStartedAt = newDowntimes.length ? newDowntimes[0].startedAt : Number.MAX_VALUE;

      for (var i = oldDowntimes.length - 1; i >= 0; --i)
      {
        var oldDowntime = oldDowntimes[i];

        if (oldDowntime.startedAt > newLatestStartedAt)
        {
          newDowntimes.unshift(oldDowntime);
        }
      }

      while (newDowntimes.length > 8)
      {
        newDowntimes.pop();
      }

      this.reset(newDowntimes);
    }

  });
});
