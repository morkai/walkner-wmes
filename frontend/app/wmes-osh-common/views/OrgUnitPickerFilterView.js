// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/viewport',
  'app/core/View',
  '../dictionaries',
  './OrgUnitPickerDialogView',
  'app/wmes-osh-common/templates/orgUnits/pickerFilter'
], function(
  _,
  viewport,
  View,
  dictionaries,
  OrgUnitPickerDialogView,
  template
) {
  'use strict';

  return View.extend({

    template,

    nlsDomain: 'wmes-osh-common',

    events: {

      'click #-showDialog': function()
      {
        const dialogView = new OrgUnitPickerDialogView({
          model: {
            multiple: this.options.multiple !== false,
            resolveLabel: this.resolveLabel.bind(this),
            orgUnitTypes: this.options.orgUnitTypes,
            orgUnitType: this.model.type,
            orgUnitIds: _.pluck(this.model.units, 'id')
          }
        });

        this.listenTo(dialogView, 'picked', (type, ids) =>
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
            this.model.units = ids.map(id => dictionaries.forProperty(type).get(id));
          }

          this.render();
          this.$id('showDialog').focus();
        });
        viewport.showDialog(dialogView, this.t('orgUnitPicker:dialog:title'));
      },

      'click #-clear': function()
      {
        this.model = {
          type: null,
          units: []
        };

        this.render();
      }

    },

    initialize: function()
    {
      this.termToType = {};
      this.typeToTerm = {};

      _.forEach(this.options.orgUnitTerms || dictionaries.ORG_UNITS, (type, term) =>
      {
        if (typeof term !== 'string')
        {
          term = type;
        }

        this.termToType[term] = type;
        this.typeToTerm[type] = term;
      });

      this.model = null;

      this.listenTo(this.filterView, 'filtering', this.onFiltering);
      this.listenTo(this.filterView, 'filterChanged', this.onFilterChanged);

      this.filterView.filterHasValue = this.filterHasValue.bind(this, this.filterView, this.filterView.filterHasValue);
      this.filterView.showFilter = this.showFilter.bind(this, this.filterView, this.filterView.showFilter);
    },

    getTemplateData: function()
    {
      if (!this.model)
      {
        this.model = this.getOrgUnitsFromModel();
      }

      return {
        active: !!this.model.type,
        label: this.resolveLabel(this.model.type),
        button: !this.model.type
          ? this.t('orgUnitPicker:filter:any')
          : this.model.units.map(unit => unit.getLabel({long: false})).join('; ')
      };
    },

    resolveLabel: function(type)
    {
      if (!type)
      {
        return this.options.emptyLabel || this.t('orgUnitPicker:filter:label');
      }

      var labels = this.options.orgUnitLabels;

      if (labels && labels[type])
      {
        return String(labels[type]);
      }

      return this.t(`orgUnit:${type}`);
    },

    getOrgUnitsFromModel: function()
    {
      let type = null;
      let units = [];

      if (this.filterView.model.rqlQuery)
      {
        const array = this.options.mode === 'array';

        this.filterView.model.rqlQuery.selector.args.forEach(term =>
        {
          if (type)
          {
            return;
          }

          if (!array && this.termToType[term.args[0]] && (term.name === 'eq' || term.name === 'in'))
          {
            type = this.termToType[term.args[0]];
            units = Array.isArray(term.args[1]) ? term.args[1] : [term.args[1]];
          }
          else if (array && term.name === 'orgUnit')
          {
            units = [].concat(term.args);
            type = this.termToType[units.shift()];
          }
        });
      }
      else
      {
        Object.keys(this.termToType).forEach(term =>
        {
          const modelUnits = this.filterView.model.get(term);

          if (Array.isArray(modelUnits) && modelUnits.length)
          {
            type = this.termToType[term];
            units = modelUnits;
          }
        });
      }

      if (units.length)
      {
        const collection = dictionaries.forProperty(type);

        units = units.map(id => collection.get(id)).filter(unit => !!unit);
      }

      return {
        type,
        units
      };
    },

    onFiltering: function(selector)
    {
      if (!this.model.type || !this.model.units.length)
      {
        return;
      }

      const ids = _.pluck(this.model.units, 'id');

      if (this.options.mode === 'array')
      {
        selector.push({
          name: 'orgUnit',
          args: [this.typeToTerm[this.model.type]].concat(ids)
        });
      }
      else
      {
        selector.push({
          name: ids.length === 1 ? 'eq' : 'in',
          args: [
            this.typeToTerm[this.model.type],
            ids.length === 1 ? ids[0] : ids
          ]
        });
      }
    },

    filterHasValue: function(filterView, filterHasValue, filter)
    {
      if (filter === this.el.parentElement.dataset.filter)
      {
        return this.model.units.length > 0;
      }

      return filterHasValue.call(filterView, filter);
    },

    showFilter: function(filterView, showFilter, filter)
    {
      if (filter === this.el.parentElement.dataset.filter)
      {
        this.$id('showDialog').click();
      }

      return showFilter.call(filterView, filter);
    }

  });
});
