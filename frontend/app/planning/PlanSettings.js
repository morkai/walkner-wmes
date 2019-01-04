// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Model',
  '../core/Collection',
  './Plan',
  './settings'
], function(
  _,
  time,
  Model,
  Collection,
  Plan,
  globalSettings
) {
  'use strict';

  var PlanLineSettings = Model.extend({

    defaults: function()
    {
      return {
        mrpPriority: [],
        activeFrom: '',
        activeTo: ''
      };
    }

  });

  var PlanLineSettingsCollection = Collection.extend({

    model: PlanLineSettings

  });

  var PlanMrpSettings = Model.extend({

    defaults: function()
    {
      return {
        extraOrderSeconds: 0,
        extraShiftSeconds: [0, 0, 0],
        bigOrderQuantity: 0,
        splitOrderQuantity: 0,
        maxSplitLineCount: 0,
        hardOrderManHours: 0,
        hardComponents: [],
        lines: []
      };
    },

    initialize: function()
    {
      this.lines = new PlanMrpLineSettingsCollection(null, {paginate: false});

      if (this.attributes.lines)
      {
        this.lines.reset(this.attributes.lines);

        delete this.attributes.lines;
      }
    },

    toJSON: function()
    {
      return _.assign({lines: this.lines.toJSON()}, this.attributes);
    }

  });

  var PlanMrpSettingsCollection = Collection.extend({

    model: PlanMrpSettings

  });

  var PlanMrpLineSettings = Model.extend({

    defaults: function()
    {
      return {
        workerCount: [0, 0, 0],
        orderPriority: ['small', 'easy', 'hard']
      };
    }

  });

  var PlanMrpLineSettingsCollection = Collection.extend({

    model: PlanMrpLineSettings

  });

  return Model.extend({

    urlRoot: '/planning/settings',

    clientUrlRoot: '#planning/settings',

    topicPrefix: 'planning.settings',

    privilegePrefix: 'PLANNING',

    nlsDomain: 'planning',

    initialize: function()
    {
      this.lines = new PlanLineSettingsCollection(null, {paginate: false});

      this.mrps = new PlanMrpSettingsCollection(null, {paginate: false});

      this.global = globalSettings.acquire();

      if (this.attributes.lines)
      {
        this.lines.reset(this.attributes.lines);

        delete this.attributes.lines;
      }

      if (this.attributes.mrps)
      {
        this.mrps.reset(this.attributes.mrps);

        delete this.attributes.mrps;
      }

      if (this.attributes.global)
      {
        this.global.reset(this.global.parse(this.attributes));

        delete this.attributes.global;
      }
    },

    parse: function(res)
    {
      var attrs = _.omit(res, ['lines', 'mrps']);

      if (res._id)
      {
        attrs._id = time.utc.format(res._id, 'YYYY-MM-DD');
      }

      if (res.lines)
      {
        if (this.lines)
        {
          this.lines.reset(res.lines);
        }
        else
        {
          attrs.lines = res.lines;
        }
      }

      if (res.mrps)
      {
        if (this.mrps)
        {
          this.mrps.reset(res.mrps);
        }
        else
        {
          attrs.mrps = res.mrps;
        }
      }

      if (res.global)
      {
        if (this.global)
        {
          this.global.reset(this.global.parse(res));
        }
        else
        {
          attrs.global = res.global;
        }
      }

      return attrs;
    },

    toJSON: function()
    {
      return _.assign({
        lines: this.lines.toJSON(),
        mrps: this.mrps.toJSON(),
        global: this.global.toJSON()
      }, this.attributes);
    },

    getLabel: function()
    {
      return time.utc.format(this.id, 'LL');
    },

    getDefinedMrpIds: function()
    {
      return this.mrps.map(function(mrpSettings) { return mrpSettings.id; }).sort(function(a, b)
      {
        return a.localeCompare(b, undefined, {numeric: true});
      });
    },

    getSchedulingRate: function(mrpId)
    {
      return this.attributes.schedulingRate[mrpId] || this.attributes.schedulingRate.ANY || 1;
    },

    isEditable: function()
    {
      return time.getMoment(this.id).hours(6).diff(Date.now()) > 300000;
    },

    applyChanges: function(changes)
    {
      Plan.applySettingsChanges(this, changes);
    },

    hasAllRequiredStatuses: function(statuses)
    {
      var requiredStatuses = this.get('requiredStatuses');

      return _.intersection(requiredStatuses, statuses).length === requiredStatuses.length;
    },

    hasAnyIgnoredStatus: function(statuses)
    {
      return _.intersection(this.get('ignoredStatuses'), statuses).length > 0;
    }

  }, {

    fromDate: function(date)
    {
      var current = time.utc.getMoment().startOf('day');

      if (/^-?[0-9]+d$/.test(date))
      {
        date = current.add(+date.replace('d', ''), 'days').format('YYYY-MM-DD');
      }

      return new this({_id: date});
    }

  });
});
