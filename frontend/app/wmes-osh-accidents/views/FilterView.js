// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/core/util/forms/dropdownRadio',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/views/OrgUnitPickerFilterView',
  'app/wmes-osh-accidents/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  $,
  currentUser,
  FilterView,
  dateTimeRange,
  dropdownRadio,
  idAndLabel,
  setUpUserSelect2,
  dictionaries,
  OrgUnitPickerFilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    filterList: [],
    filterMap: {},

    template,

    events: Object.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {

      };
    },

    termToForm: {
      'eventDate': dateTimeRange.rqlToForm,
      'workplace': (propertyName, term, formData) =>
      {
        formData[propertyName] = term.name === 'in' ? term.args[1].join(',') : term.args[1];
      },
      'department': 'workplace',
      'building': 'workplace',
      'location': 'workplace',
      'station': 'station'
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.setView('#-locationPath', new OrgUnitPickerFilterView({
        filterView: this,
        emptyLabel: this.t('PROPERTY:locationPath')
      }));
    },

    getTemplateData: function()
    {
      return {

      };
    },

    serializeFormToQuery: function(selector)
    {
      dateTimeRange.formToRql(this, selector);
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);
    },

    destroy: function()
    {
      FilterView.prototype.destroy.call(this);
    },

    filterHasValue: function(filter)
    {
      if (filter === 'date')
      {
        const $from = this.$id('from-date');
        const $to = this.$id('to-date');

        return $from.val().length > 0 || $to.val().length > 0;
      }

      return FilterView.prototype.filterHasValue.apply(this, arguments);
    },

    showFilter: function(filter)
    {
      FilterView.prototype.showFilter.apply(this, arguments);
    }

  });
});
