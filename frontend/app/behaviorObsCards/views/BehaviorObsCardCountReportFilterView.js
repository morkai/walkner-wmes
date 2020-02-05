// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/users/util/setUpUserSelect2',
  'app/data/companies',
  'app/kaizenOrders/dictionaries',
  'app/behaviorObsCards/templates/countReportFilter'
], function(
  _,
  js2form,
  time,
  View,
  buttonGroup,
  idAndLabel,
  dateTimeRange,
  setUpUserSelect2,
  companies,
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

    afterRender: function()
    {
      js2form(this.el, this.serializeFormData());

      buttonGroup.toggle(this.$id('interval'));
      buttonGroup.toggle(this.$id('shift'));
      buttonGroup.toggle(this.$id('anyHard'));

      this.$id('sections').select2({
        width: '306px',
        allowClear: true,
        multiple: true,
        data: kaizenDictionaries.sections.map(idAndLabel)
      });

      this.$id('observerSections').select2({
        width: '434px',
        allowClear: true,
        multiple: true,
        data: kaizenDictionaries.sections.map(idAndLabel)
      });

      this.$id('company').select2({
        width: '350px',
        allowClear: true,
        multiple: true,
        data: companies.map(idAndLabel)
      });

      setUpUserSelect2(this.$id('superior'), {
        width: '300px',
        view: this
      });
    },

    serializeFormData: function()
    {
      var model = this.model;
      var from = +model.get('from');
      var to = +model.get('to');
      var anyHard = [];

      if (model.get('anyHardObservations'))
      {
        anyHard.push('observations');
      }

      if (model.get('anyHardRisks'))
      {
        anyHard.push('risks');
      }

      return {
        interval: model.get('interval'),
        'from-date': from ? time.format(from, 'YYYY-MM-DD') : '',
        'to-date': to ? time.format(to, 'YYYY-MM-DD') : '',
        sections: model.get('sections').join(','),
        observerSections: model.get('observerSections').join(','),
        superior: model.get('superior'),
        company: model.get('company').join(','),
        shift: model.get('shift'),
        anyHard: anyHard
      };
    },

    changeFilter: function()
    {
      var range = dateTimeRange.serialize(this);
      var anyHard = buttonGroup.getValue(this.$id('anyHard'));
      var query = {
        from: range.from ? range.from.valueOf() : 0,
        to: range.to ? range.to.valueOf() : 0,
        interval: buttonGroup.getValue(this.$id('interval')),
        sections: this.$id('sections').val(),
        observerSections: this.$id('observerSections').val(),
        superior: this.$id('superior').val(),
        company: this.$id('company').val(),
        shift: +buttonGroup.getValue(this.$id('shift')),
        anyHardObservations: _.includes(anyHard, 'observations') ? 1 : 0,
        anyHardRisks: _.includes(anyHard, 'risks') ? 1 : 0
      };

      query.sections = query.sections === '' ? [] : query.sections.split(',');
      query.observerSections = query.observerSections === '' ? [] : query.observerSections.split(',');
      query.company = query.company === '' ? [] : query.company.split(',');

      this.model.set(query);
      this.model.trigger('filtered');
    }

  });
});
