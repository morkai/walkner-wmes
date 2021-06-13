// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'underscore',
  'js2form',
  'select2',
  'app/i18n',
  'app/data/orgUnits',
  'app/data/localStorage',
  'app/core/View',
  'app/orgUnits/templates/pickerDialog'
], function(
  $,
  _,
  js2form,
  select2,
  t,
  orgUnits,
  localStorage,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': function(e)
      {
        e.preventDefault();

        var type = this.$('input[name="orgUnitType"]:checked').val();
        var ids = this.$id(type).select2('val');

        this.trigger('picked', type, ids);
      },
      'change input[type="radio"]': function(e)
      {
        this.$id(e.currentTarget.value).select2('focus');
      },
      'click #-deactivated': function()
      {
        var oldState = localStorage.getItem('WMES:OrgUnitPicker:deactivated') || '0';
        var newState = oldState === '1' ? '0' : '1';

        localStorage.setItem('WMES:OrgUnitPicker:deactivated', newState);

        this.$id('deactivated').toggleClass('active', newState === '1');

        this.setUpOrgUnitsSelect2();
      },
      'change .orgUnits-picker-orgUnits': function(e)
      {
        this.$(e.target).closest('.form-group').find('input[type="radio"]').click();
      }
    },

    initialize: function()
    {
      if (!this.model.orgUnitTypes)
      {
        this.model.orgUnitTypes = [
          'division',
          'subdivision',
          'mrpControllers',
          'prodFlow',
          'workCenter',
          'prodLine'
        ];
      }
    },

    getTemplateData: function()
    {
      var view = this;

      return {
        orgUnits: view.model.orgUnitTypes.map(function(type)
        {
          return {
            type: type,
            label: view.model.resolveLabel(type)
          };
        }),
        deactivated: localStorage.getItem('WMES:OrgUnitPicker:deactivated') === '1'
      };
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeFormData());

      this.setUpOrgUnitsSelect2();
    },

    onDialogShown: function()
    {
      var orgUnitType = this.$('input[name="orgUnitType"]:checked').val();

      if (!orgUnitType)
      {
        this.$('input[name="orgUnitType"]').last().click();
      }
      else
      {
        this.$id(orgUnitType).select2('focus');
      }
    },

    serializeFormData: function()
    {
      var formData = {
        orgUnitType: this.model.orgUnitType
      };

      formData[formData.orgUnitType] = this.model.orgUnitIds.join(',');

      return formData;
    },

    setUpOrgUnitsSelect2: function()
    {
      this.model.orgUnitTypes.forEach(this.setUpOrgUnitSelect2, this);
    },

    setUpOrgUnitSelect2: function(type)
    {
      var deactivated = localStorage.getItem('WMES:OrgUnitPicker:deactivated') === '1';
      var filterDivision = this.createDivisionFilter();
      var filterSubdivision = this.createSubdivisionFilter();
      var data = orgUnits
        .getAllByType(type)
        .filter(function(orgUnit)
        {
          return deactivated || !orgUnit.get('deactivatedAt');
        })
        .map(function(orgUnit)
        {
          if (!filterDivision(orgUnit) || !filterSubdivision(orgUnit))
          {
            return null;
          }

          var text;
          var selection;

          if (type === 'subdivision')
          {
            text = orgUnit.get('division') + ' > ' + orgUnit.getLabel();
          }
          else if (type === 'mrpControllers')
          {
            text = orgUnit.id + ': ' + orgUnit.get('description');
            selection = orgUnit.id;
          }
          else
          {
            text = orgUnit.getLabel();
          }

          return {
            id: orgUnit.id,
            selection: selection,
            text: text,
            deactivated: !!orgUnit.get('deactivatedAt')
          };
        })
        .filter(function(item) { return item !== null; })
        .sort(function(a, b) { return a.text.localeCompare(b.text); });

      return this.$id(type).select2({
        multiple: true,
        data: data,
        formatSelection: function(item)
        {
          var text = _.escape(item.selection || item.text);

          if (item.deactivated)
          {
            return '<span style="text-decoration: line-through">' + text + '</span>';
          }

          return text;
        },
        formatResult: function(item, $container, query, e)
        {
          var html = [];

          html.push('<span style="text-decoration: ' + (item.deactivated ? 'line-through' : 'initial') + '">');
          select2.util.markMatch(item.selection || item.text, query.term, html, e);
          html.push('</span>');

          return html.join('');
        }
      });
    },

    createSubdivisionFilter: function()
    {
      var subdivisionFilter = this.model.subdivisionFilter;

      if (Array.isArray(subdivisionFilter) && subdivisionFilter.length)
      {
        return function(orgUnit)
        {
          if (!orgUnit.getSubdivision)
          {
            return true;
          }

          var subdivision = orgUnit.getSubdivision();
          var subdivisionType = subdivision && subdivision.get('type');

          return subdivisionFilter.indexOf(subdivisionType) !== -1;
        };
      }

      if (typeof subdivisionFilter === 'function')
      {
        return subdivisionFilter;
      }

      return function() { return true; };
    },

    createDivisionFilter: function()
    {
      var divisionFilter = this.model.divisionFilter;

      if (Array.isArray(divisionFilter) && divisionFilter.length)
      {
        return function(orgUnit)
        {
          var division = orgUnits.getDivisionFor(orgUnit);
          var divisionType = division && division.get('type');

          return divisionFilter.indexOf(divisionType) !== -1;
        };
      }

      if (typeof divisionFilter === 'function')
      {
        return divisionFilter;
      }

      return function(orgUnit)
      {
        var division = orgUnits.getDivisionFor(orgUnit);

        return !!division && division.get('type') === 'prod';
      };
    }

  });
});
