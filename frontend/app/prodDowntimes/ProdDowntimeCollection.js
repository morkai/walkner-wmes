// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../user',
  '../data/prodLog',
  '../core/Collection',
  '../data/orgUnits',
  '../orgUnits/util/limitOrgUnits',
  './ProdDowntime'
], function(
  _,
  time,
  user,
  prodLog,
  Collection,
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

      return this.matchStatus(data)
        && this.matchAor(data)
        && this.matchReason(data)
        && this.matchOrgUnit(data)
        && this.matchProdShift(data)
        && this.matchProdShiftOrder(data);
    },

    matchStatus: function(data)
    {
      var statusTerm = _.find(this.rqlQuery.selector.args, function(term)
      {
        return (term.name === 'eq' || term.name === 'in') && term.args[0] === 'status';
      });

      if (statusTerm)
      {
        if (statusTerm.name === 'eq')
        {
          return data.status === statusTerm.args[1];
        }

        return statusTerm.args[1].indexOf(data.status) !== -1;
      }

      return true;
    },

    matchAor: function(data)
    {
      var aorTerm = _.find(this.rqlQuery.selector.args, function(term)
      {
        return term.args[0] === 'aor' && VALID_TERM_NAMES[term.name];
      });

      if (!aorTerm)
      {
        return true;
      }

      if (aorTerm.name === 'eq')
      {
        return data.aor === aorTerm.args[1];
      }

      if (aorTerm.name === 'ne')
      {
        return data.aor !== aorTerm.args[1];
      }

      if (aorTerm.name === 'in')
      {
        return aorTerm.args[1].indexOf(data.aor) !== -1;
      }

      if (aorTerm.name === 'nin')
      {
        return aorTerm.args[1].indexOf(data.aor) === -1;
      }

      return true;
    },

    matchReason: function(data)
    {
      var reasonTerm = _.find(this.rqlQuery.selector.args, function(term)
      {
        return term.args[0] === 'reason' && VALID_TERM_NAMES[term.name];
      });

      if (!reasonTerm)
      {
        return true;
      }

      if (reasonTerm.name === 'eq')
      {
        return data.reason === reasonTerm.args[1];
      }

      if (reasonTerm.name === 'ne')
      {
        return data.reason !== reasonTerm.args[1];
      }

      if (reasonTerm.name === 'in')
      {
        return reasonTerm.args[1].indexOf(data.reason) !== -1;
      }

      if (reasonTerm.name === 'nin')
      {
        return reasonTerm.args[1].indexOf(data.reason) === -1;
      }

      return true;
    },

    /**
     * @param {Object} data
     * @returns {boolean}
     */
    matchOrgUnit: function(data) // eslint-disable-line no-unused-vars
    {
      var orgUnitTerm = _.find(this.rqlQuery.selector.args, function(term)
      {
        return orgUnits.TYPES[term.args[0]] && VALID_TERM_NAMES[term.name];
      });

      if (!orgUnitTerm)
      {
        return true;
      }

      var orgUnitType = orgUnitTerm.args[0];
      var requiredId = orgUnitTerm.args[1];
      var actualId = data[orgUnitType];

      if (orgUnitTerm.name === 'eq')
      {
        return actualId === requiredId;
      }

      if (orgUnitTerm.name === 'ne')
      {
        return actualId !== requiredId;
      }

      if (orgUnitTerm.name === 'in')
      {
        return requiredId.indexOf(actualId) !== -1;
      }

      if (orgUnitTerm.name === 'nin')
      {
        return requiredId.indexOf(actualId) === -1;
      }

      return true;
    },

    matchProdShift: function(data)
    {
      var term = _.find(this.rqlQuery.selector.args, function(term)
      {
        return term.name === 'eq' && term.args[0] === 'prodShift';
      });

      return !term || data.prodShift === term.args[1];
    },

    matchProdShiftOrder: function(data)
    {
      var term = _.find(this.rqlQuery.selector.args, function(term)
      {
        return term.name === 'eq' && term.args[0] === 'prodShiftOrder';
      });

      return !term || data.prodShiftOrder === term.args[1];
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
