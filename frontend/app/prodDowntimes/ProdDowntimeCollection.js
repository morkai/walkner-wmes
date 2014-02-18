define([
  'underscore',
  '../time',
  '../user',
  '../data/prodLog',
  '../core/Collection',
  './ProdDowntime'
], function(
  _,
  time,
  user,
  prodLog,
  Collection,
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
      var selector = [{name: 'eq', args: ['status', 'undecided']}];

      if (!user.isAllowedTo('PROD_DOWNTIMES:ALL'))
      {
        var userSubdivision = user.getSubdivision();

        if (userSubdivision)
        {
          selector.push({name: 'eq', args: ['subdivision', userSubdivision.id]});
        }
        else
        {
          var userDivision = user.getDivision();

          if (userDivision)
          {
            selector.push({name: 'eq', args: ['division', userDivision.id]});
          }
        }
      }

      return rql.Query.fromObject({
        fields: {
          aor: 1,
          reason: 1,
          reasonComment: 1,
          mrpControllers: 1,
          prodFlow: 1,
          prodLine: 1,
          status: 1,
          startedAt: 1,
          finishedAt: 1,
          date: 1,
          shift: 1
        },
        sort: {
          startedAt: -1
        },
        limit: 15,
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
      var prodDowntime = new ProdDowntime({
        division: prodShift.get('division'),
        subdivision: prodShift.get('subdivision'),
        mrpControllers: prodShift.get('mrpControllers'),
        prodFlow: prodShift.get('prodFlow'),
        workCenter: prodShift.get('workCenter'),
        prodLine: prodShift.prodLine.id,
        prodShift: prodShift.id,
        prodShiftOrder: prodShift.prodShiftOrder.id || null,
        date: prodShift.get('date'),
        shift: prodShift.get('shift'),
        aor: downtimeInfo.aor,
        reason: downtimeInfo.reason,
        reasonComment: downtimeInfo.reasonComment,
        status: ProdDowntime.STATUS.UNDECIDED,
        startedAt: time.getMoment().toDate(),
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
        && this.matchOrgUnit(data);
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

    matchOrgUnit: function(data)
    {
      // TODO
      return true;
    }

  });
});
