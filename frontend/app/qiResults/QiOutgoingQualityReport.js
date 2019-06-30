// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../user',
  '../core/Model',
  '../core/Collection'
], function(
  _,
  t,
  time,
  user,
  Model,
  Collection
) {
  'use strict';

  var ResultCollection = Collection.extend({
    url: '/qi/reports/outgoingQuality/results',
    rqlQuery: 'rid=in=()',
    model: Model.extend({
      nlsDomain: 'qiResults',
      clientUrlRoot: '#qi/results'
    })
  });

  return Model.extend({

    urlRoot: '/qi/reports/outgoingQuality',

    nlsDomain: 'qiResults',

    defaults: function()
    {
      return {
        interval: 'week',
        week: '',
        options: {},
        totals: {},
        top: {},
        groups: {}
      };
    },

    initialize: function()
    {
      this.results = _.assign(new ResultCollection(null, {paginate: false}), {report: this});

      this.on('change:results', function()
      {
        var rids = (this.get('results') || []).map(function(r)
        {
          return r.rid;
        });

        this.results.rqlQuery.selector.args[0].args[1] = rids;

        if (rids.length)
        {
          this.results.fetch({reset: true});
        }
        else
        {
          this.results.reset([]);
        }
      });
    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      options.data = _.assign(
        options.data || {},
        _.pick(this.attributes, ['week'])
      );

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return this.urlRoot
        + '?week=' + encodeURIComponent(this.get('week'));
    },

    canManage: function()
    {
      return user.isAllowedTo('QI:RESULTS:MANAGE', 'FN:quality_engineer');
    },

    getTopCount: function()
    {
      return this.attributes.options.topCount || 4;
    },

    getCurrentWeek: function()
    {
      return _.last(this.attributes.options.oqlWeeks) || null;
    },

    getSpecifiedResults: function()
    {
      var oqlWeek = this.getCurrentWeek();

      return oqlWeek ? oqlWeek.results : [];
    },

    updateOqlWeek: function(newOqlWeek)
    {
      var options = this.attributes.options;
      var oqlWeeks = options.oqlWeeks;

      if (!options.oqlWeeks)
      {
        return;
      }

      if (newOqlWeek._id < options.fromTime || newOqlWeek._id >= options.toTime)
      {
        return;
      }

      var oqlWeek = _.find(oqlWeeks, function(w) { return w._id === newOqlWeek._id; });

      if (oqlWeek)
      {
        newOqlWeek = _.assign(oqlWeek, newOqlWeek);
      }
      else
      {
        oqlWeeks.push(newOqlWeek);
        oqlWeeks.sort(function(a, b) { return a._id - b._id; });
      }

      this.updateGroupTargets(newOqlWeek);

      this.trigger('change:oqlWeek', this, newOqlWeek);
      this.trigger('change', this);
    },

    updateGroupTargets: function()
    {
      var groups = this.get('groups');
      var oqlWeeks = [].concat(this.get('options').oqlWeeks);
      var oqlTarget = oqlWeeks[0].target;
      var changed = true;

      groups.forEach(function(group)
      {
        while (oqlWeeks.length && oqlWeeks[0]._id <= group.key)
        {
          oqlTarget = oqlWeeks.shift().target || oqlTarget;
        }

        if (group.oqlTarget !== oqlTarget)
        {
          group.oqlTarget = oqlTarget;
          changed = true;
        }
      });

      if (changed)
      {
        this.trigger('change:groups', this, groups);
      }
    }

  }, {

    fromQuery: function(query)
    {
      return new this({week: this.parseWeek(query.week)});
    },

    parseWeek: function(input)
    {
      input = (input || '').trim();

      var moment = time.getMoment();
      var match = input.match(/([0-9]{2,4})?.*?W([0-9]{1,2})/);
      var year = 0;
      var week = 0;

      if (match)
      {
        year = +match[1];
        week = +match[2];
      }
      else if (/[0-9]{1,2}/.test(input))
      {
        week = +input.match(/([0-9]{1,2})/)[1];
      }

      if (!year && !week)
      {
        moment.subtract(1, 'weeks');
      }

      if (!year)
      {
        year = moment.isoWeekYear();
      }
      else if (year < 100)
      {
        year += 2000;
      }

      if (!week || week < 1 || week > 53)
      {
        week = moment.isoWeek();
      }

      if (week < 10)
      {
        week = '0' + week;
      }

      return year + '-W' + week;
    }

  });
});
