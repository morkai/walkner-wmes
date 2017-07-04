// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  './OrgUnitPickerDialogView',
  'app/orgUnits/templates/pickerButton',
  'i18n!app/nls/orgUnits'
], function(
  _,
  $,
  t,
  viewport,
  View,
  idAndLabel,
  orgUnits,
  OrgUnitPickerDialogView,
  template
) {
  'use strict';

  var ORG_UNIT_TYPES = {
    division: 'division',
    subdivision: 'subdivision',
    mrpControllers: 'mrpControllers',
    prodFlow: 'prodFlow',
    workCenter: 'workCenter',
    prodLine: 'prodLine'
  };

  return View.extend({

    template: template,

    events: {

      'click #-showDialog': function()
      {
        var dialogView = new OrgUnitPickerDialogView({
          model: {
            orgUnitTypes: this.options.orgUnitTypes,
            orgUnitType: this.model.type,
            orgUnitIds: _.pluck(this.model.units, 'id')
          }
        });

        this.listenTo(dialogView, 'picked', function(type, ids)
        {
          viewport.closeDialog();

          if (ids.length === 0)
          {
            this.model.type = null;
            this.model.units = [];
          }
          else
          {
            this.model.type = type;
            this.model.units = ids.map(function(id) { return orgUnits.getByTypeAndId(type, id); });
          }

          this.render();
        });

        viewport.showDialog(dialogView, t('orgUnits', 'picker:dialog:title'));
      },

      'click #-clear': function()
      {
        this.model = {
          type: null,
          units: [],
          labels: []
        };

        this.render();
      }

    },

    initialize: function()
    {
      this.model = this.getOrgUnitsFromRql();

      this.listenTo(this.filterView, 'filtering', this.onFiltering);
      this.listenTo(this.filterView, 'filterChanged', this.onFilterChanged);
    },

    serialize: function()
    {
      var model = this.model;

      return {
        idPrefix: this.idPrefix,
        active: !!model.type,
        label: model.type ? t('core', 'ORG_UNIT:' + model.type) : t('orgUnits', 'picker:label'),
        button: !model.type
          ? t('orgUnits', 'picker:any')
          : model.units.map(function(unit)
          {
            var label = unit.getLabel();

            if (model.type === 'subdivision')
            {
              label = unit.get('division') + ' > ' + label;
            }

            return label;
          }).join('; ')
      };
    },

    getOrgUnitsFromRql: function()
    {
      var array = this.options.mode === 'array';
      var type = null;
      var units = [];

      this.filterView.model.rqlQuery.selector.args.forEach(function(term)
      {
        if (type)
        {
          return;
        }

        if (!array && (term.name === 'eq' || term.name === 'in'))
        {
          type = ORG_UNIT_TYPES[term.args[0]];
          units = Array.isArray(term.args[1]) ? term.args[1] : [term.args[1]];
        }
        else if (array && term.name === 'orgUnit')
        {
          units = [].concat(term.args);
          type = ORG_UNIT_TYPES[units.shift()];
        }
      });

      return {
        type: units.length ? type : null,
        units: units
          .map(function(id) { return orgUnits.getByTypeAndId(type, id); })
          .filter(function(unit) { return !!unit; })
      };
    },

    onFiltering: function(selector)
    {
      if (!this.model.type || !this.model.units.length)
      {
        return;
      }

      var ids = _.pluck(this.model.units, 'id');

      if (this.options.mode === 'array')
      {
        selector.push({
          name: 'orgUnit',
          args: [this.model.type].concat(ids)
        });
      }
      else
      {
        selector.push({
          name: ids.length === 1 ? 'eq' : 'in',
          args: [
            this.model.type,
            ids.length === 1 ? ids[0] : ids
          ]
        });
      }
    }

  });
});
