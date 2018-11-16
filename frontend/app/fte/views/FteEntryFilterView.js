// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'js2form',
  'app/time',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/orgUnits/views/OrgUnitDropdownsView',
  'app/core/Model',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/fte/templates/filter'
], function(
  _,
  js2form,
  time,
  divisions,
  subdivisions,
  OrgUnitDropdownsView,
  Model,
  FilterView,
  dateTimeRange,
  template
) {
  'use strict';

  var ORG_UNIT = OrgUnitDropdownsView.ORG_UNIT;

  return FilterView.extend({

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent

    }, FilterView.prototype.events),

    defaultFormData: {
      division: '',
      subdivision: '',
      shift: 0
    },

    termToForm: {
      'date': dateTimeRange.rqlToForm,
      'division': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];

        if (!(propertyName === 'division' ? divisions : subdivisions).get(formData[propertyName]))
        {
          formData[propertyName] = '';
        }
      },
      'shift': function(propertyName, term, formData)
      {
        formData.shift = term.args[1];
      },
      'subdivision': 'division'
    },

    initialize: function()
    {
      this.orgUnitDropdownsView = new OrgUnitDropdownsView({
        orgUnit: this.options.divisionOnly ? ORG_UNIT.DIVISION : ORG_UNIT.SUBDIVISION,
        divisionFilter: this.options.divisionFilter || null,
        allowClear: true,
        noGrid: true
      });

      this.setView('.orgUnitDropdowns-container', this.orgUnitDropdownsView);
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('shift');

      this.listenToOnce(this.orgUnitDropdownsView, 'afterRender', function()
      {
        var model = null;
        var orgUnit = null;
        var formData = this.formData;

        if (formData.subdivision !== '')
        {
          orgUnit = ORG_UNIT.SUBDIVISION;
          model = new Model({subdivision: formData.subdivision});
        }
        else if (formData.division !== '')
        {
          orgUnit = ORG_UNIT.DIVISION;
          model = new Model({division: formData.division});
        }

        this.orgUnitDropdownsView.selectValue(model, orgUnit);
      });
    },

    serializeFormToQuery: function(selector)
    {
      var division = this.orgUnitDropdownsView.$id('division').val();
      var subdivision = this.orgUnitDropdownsView.$id('subdivision').val();
      var shiftNo = parseInt(this.$('input[name=shift]:checked').val(), 10);

      dateTimeRange.formToRql(this, selector);

      if (!_.isEmpty(subdivision))
      {
        selector.push({name: 'eq', args: ['subdivision', subdivision]});
      }
      else if (!_.isEmpty(division))
      {
        selector.push({name: 'eq', args: ['division', division]});
      }

      if (shiftNo !== 0)
      {
        selector.push({name: 'eq', args: ['shift', shiftNo]});
      }
    }

  });
});
