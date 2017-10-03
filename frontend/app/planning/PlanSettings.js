// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Model',
  '../core/Collection'
], function(
  _,
  time,
  Model,
  Collection
) {
  'use strict';

  var PlanLineSettings = Model.extend({

  });

  var PlanLineSettingsCollection = Collection.extend({

    model: PlanLineSettings

  });

  var PlanMrpSettings = Model.extend({

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

      return attrs;
    },

    toJSON: function()
    {
      return _.assign({
        lines: this.lines.toJSON(),
        mrps: this.mrps.toJSON()
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

    isEditable: function()
    {
      return time.getMoment(this.id).hours(6).diff(Date.now()) > 300000;
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
