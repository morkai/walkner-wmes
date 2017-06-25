// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/orgUnits/views/OrgUnitPickerView',
  'app/prodChangeRequests/templates/filter'
], function(
  _,
  time,
  FilterView,
  idAndLabel,
  OrgUnitPickerView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: function()
    {
      return {
        status: 'new'
      };
    },

    termToForm: {
      'status': function(propertyName, term, formData)
      {
        formData.status = term.name === 'eq' ? 'new' : 'old';
      }
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.setView('#' + this.idPrefix + '-orgUnit', new OrgUnitPickerView({
        orgUnitTypes: ['division', 'prodLine'],
        filterView: this
      }));
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('status');
    },

    serializeFormToQuery: function(selector, rqlQuery)
    {
      var status = this.getButtonGroupValue('status');

      if (status === 'old')
      {
        selector.push({name: 'in', args: ['status', ['accepted', 'rejected']]});

        rqlQuery.sort = {_id: -1};
      }
      else
      {
        selector.push({name: 'eq', args: ['status', 'new']});

        rqlQuery.sort = {prodLine: 1, _id: 1};
      }
    }

  });
});
