// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../user',
  '../core/Model',
  '../core/Collection',
  './Plan',
  './settings'
], function(
  _,
  time,
  user,
  Model,
  Collection,
  Plan,
  globalSettings
) {
  'use strict';

  var VERSION_2_DATE = window.ENV === 'production'
    ? time.utc.getMoment('2030-01-01').valueOf()
    : time.utc.getMoment('2021-01-17').valueOf(); // time.getMoment().utc(true).valueOf();

  var PlanLineSettings = Model.extend({

    defaults: function()
    {
      return {
        mrpPriority: [],
        orderPriority: [],
        orderGroupPriority: [],
        activeTime: [],
        workerCount: [0, 0, 0]
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
        locked: false,
        limitSmallOrders: false,
        extraOrderSeconds: 0,
        extraShiftSeconds: [0, 0, 0],
        smallOrderQuantity: 0,
        bigOrderQuantity: 0,
        splitOrderQuantity: 0,
        maxSplitLineCount: 0,
        hardOrderManHours: 0,
        hardBigComponents: [],
        hardComponents: [],
        lines: [],
        groups: [],
        linePriority: []
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
        orderPriority: []
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

    defaults: function()
    {
      return {
        useRemainingQuantity: true,
        ignoreCompleted: true,
        requiredStatuses: [],
        ignoredStatuses: [],
        ignoredWorkCenters: [],
        completedStatuses: [],
        schedulingRate: '',
        freezeHour: 17,
        lateHour: 6,
        etoPilotHour: 6
      };
    },

    initialize: function()
    {
      this.lockedMrps = null;
      this.lockedLines = null;

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

      this.on('sync', function()
      {
        this.lockedMrps = null;
        this.lockedLines = null;
      });
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

    getVersion: function()
    {
      return time.utc.getMoment(this.id, 'YYYY-MM-DD').isSameOrAfter(VERSION_2_DATE) ? 2 : 1;
    },

    getAvailableOrderPriorities: function()
    {
      var orderPriorities = ['small'];

      if (this.getVersion() === 1)
      {
        orderPriorities.push('easy', 'hard');
      }
      else
      {
        orderPriorities.push('medium', 'big');
      }

      return orderPriorities;
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
      return (time.getMoment(this.id).hours(6).diff(Date.now()) > 300000)
        || (window.ENV !== 'production' && user.isAllowedTo('SUPER'));
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
    },

    isLineLocked: function(lineId)
    {
      this.cacheLocked();

      return !!this.lockedLines[lineId];
    },

    isMrpLocked: function(mrpId)
    {
      this.cacheLocked();

      return !!this.lockedMrps[mrpId];
    },

    isMrpLockedDirectly: function(mrpId)
    {
      var mrp = this.mrps.get(mrpId);

      return !!mrp && mrp.get('locked');
    },

    getMrpLockReason: function(mrpId)
    {
      var settings = this;

      if (!settings.isMrpLocked(mrpId))
      {
        return null;
      }

      var mrp = settings.isMrpLockedDirectly(mrpId);
      var lines = [];

      settings.mrps.get(mrpId).lines.forEach(function(mrpLine)
      {
        var line = settings.lines.get(mrpLine.id);
        var lockedMrps = line.get('mrpPriority').filter(function(lockedMrpId)
        {
          return lockedMrpId !== mrpId && settings.isMrpLockedDirectly(lockedMrpId);
        });

        if (lockedMrps.length)
        {
          lines.push({
            line: line.id,
            mrps: lockedMrps
          });
        }
      });

      return {
        mrp: mrp,
        lines: lines
      };
    },

    cacheLocked: function()
    {
      var settings = this;

      if (settings.lockedMrps)
      {
        return;
      }

      settings.lockedMrps = {};
      settings.lockedLines = {};

      var mrpsToLines = {};
      var linesToMrps = {};

      settings.mrps.forEach(function(mrpSettings)
      {
        if (mrpSettings.get('locked'))
        {
          settings.lockedMrps[mrpSettings.id] = true;
        }

        mrpsToLines[mrpSettings.id] = [];
      });

      settings.lines.forEach(function(lineSettings)
      {
        var lineId = lineSettings.id;

        linesToMrps[lineId] = [];

        lineSettings.get('mrpPriority').forEach(function(mrpId)
        {
          mrpsToLines[mrpId].push(lineId);
          linesToMrps[lineId].push(mrpId);
        });
      });

      _.forEach(linesToMrps, function(mrps)
      {
        var anyLocked = _.some(mrps, function(mrpId) { return !!settings.lockedMrps[mrpId]; });

        if (anyLocked)
        {
          mrps.forEach(function(mrpId) { settings.lockedMrps[mrpId] = true; });
        }
      });

      _.forEach(mrpsToLines, function(lines, mrpId)
      {
        if (settings.lockedMrps[mrpId])
        {
          lines.forEach(function(lineId) { settings.lockedLines[lineId] = true; });
        }
      });
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
