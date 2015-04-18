// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'js2form',
  'app/time',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/data/views/OrgUnitDropdownsView',
  'app/core/Model',
  'app/core/views/FilterView',
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
  filterTemplate
) {
  'use strict';

  var ORG_UNIT = OrgUnitDropdownsView.ORG_UNIT;

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      division: '',
      subdivision: '',
      from: '',
      to: '',
      shift: 0
    },

    termToForm: {
      'division': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];

        if (!(propertyName === 'division' ? divisions : subdivisions).get(formData[propertyName]))
        {
          formData[propertyName] = '';
        }
      },
      'date': function(propertyName, term, formData)
      {
        formData[term.name === 'ge' ? 'from' : 'to'] = time.format(term.args[1], 'YYYY-MM-DD');
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
      var fromMoment = time.getMoment(this.$id('from').val(), 'YYYY-MM-DD');
      var toMoment = time.getMoment(this.$id('to').val(), 'YYYY-MM-DD');
      var shiftNo = parseInt(this.$('input[name=shift]:checked').val(), 10);

      if (!_.isEmpty(subdivision))
      {
        selector.push({name: 'eq', args: ['subdivision', subdivision]});
      }
      else if (!_.isEmpty(division))
      {
        selector.push({name: 'eq', args: ['division', division]});
      }

      if (fromMoment.isValid())
      {
        selector.push({name: 'ge', args: ['date', fromMoment.hours(6).valueOf()]});
      }

      if (toMoment.isValid())
      {
        toMoment.hours(6);

        if (toMoment.valueOf() === fromMoment.valueOf())
        {
          this.$id('to').val(toMoment.add(1, 'days').format('YYYY-MM-DD'));
        }

        selector.push({name: 'lt', args: ['date', toMoment.valueOf()]});
      }

      if (shiftNo !== 0)
      {
        selector.push({name: 'eq', args: ['shift', shiftNo]});
      }
    },

    getShiftNoFromMoment: function(moment)
    {
      var hours = moment.hours();

      if (hours === 6)
      {
        return 1;
      }

      if (hours === 14)
      {
        return 2;
      }

      if (hours === 22)
      {
        return 3;
      }

      return 0;
    },

    setHoursByShiftNo: function(moment, shiftNo)
    {
      if (shiftNo === 1)
      {
        moment.hours(6);
      }
      else if (shiftNo === 2)
      {
        moment.hours(14);
      }
      else if (shiftNo === 3)
      {
        moment.hours(22);
      }
      else
      {
        moment.hours(0);
      }
    }

  });
});
