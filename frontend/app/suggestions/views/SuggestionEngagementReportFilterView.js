// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/kaizenOrders/dictionaries',
  'app/suggestions/templates/engagementReportFilter',
  'app/core/util/ExpandableSelect'
], function(
  js2form,
  time,
  View,
  buttonGroup,
  idAndLabel,
  dateTimeRange,
  kaizenDictionaries,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,
      'submit': function()
      {
        this.changeFilter();

        return false;
      }
    },

    destroy: function()
    {
      this.$('.is-expandable').expandableSelect('destroy');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        statuses: kaizenDictionaries.statuses
      };
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeFormData());

      buttonGroup.toggle(this.$id('interval'));

      this.$id('sections').select2({
        width: '350px',
        allowClear: true,
        multiple: true,
        data: kaizenDictionaries.sections.map(idAndLabel)
      });

      this.$('.is-expandable').expandableSelect();
    },

    serializeFormData: function()
    {
      var model = this.model;
      var from = +model.get('from');
      var to = +model.get('to');

      return {
        interval: model.get('interval'),
        'from-date': from ? time.format(from, 'YYYY-MM-DD') : '',
        'to-date': to ? time.format(to, 'YYYY-MM-DD') : '',
        status: model.get('status').join(','),
        sections: model.get('sections').join(',')
      };
    },

    changeFilter: function()
    {
      var range = dateTimeRange.serialize(this);
      var query = {
        from: range.from ? range.from.valueOf() : 0,
        to: range.to ? range.to.valueOf() : 0,
        interval: buttonGroup.getValue(this.$id('interval')),
        status: this.$id('status').val() || [],
        sections: this.$id('sections').val()
      };

      query.sections = query.sections === '' ? [] : query.sections.split(',');

      this.model.set(query);
      this.model.trigger('filtered');
    }

  });
});
