// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/reports/util/prepareDateRange',
  'app/data/companies',
  'app/kaizenOrders/dictionaries',
  'app/behaviorObsCards/templates/countReportFilter'
], function(
  js2form,
  time,
  View,
  fixTimeRange,
  buttonGroup,
  idAndLabel,
  setUpUserSelect2,
  prepareDateRange,
  companies,
  kaizenDictionaries,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': function()
      {
        this.changeFilter();

        return false;
      },
      'click a[data-range]': function(e)
      {
        var dateRange = prepareDateRange(e.target);

        this.$id('from').val(dateRange.fromMoment.format('YYYY-MM-DD'));
        this.$id('to').val(dateRange.toMoment.format('YYYY-MM-DD'));
        this.$('.btn[data-interval="' + dateRange.interval + '"]').click();
        this.$el.submit();
      }
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeFormData());

      buttonGroup.toggle(this.$id('interval'));
      buttonGroup.toggle(this.$id('shift'));

      this.$id('sections').select2({
        width: '323px',
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
        width: '459px',
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

      return {
        interval: model.get('interval'),
        from: from ? time.format(from, 'YYYY-MM-DD') : '',
        to: to ? time.format(to, 'YYYY-MM-DD') : '',
        sections: model.get('sections').join(','),
        observerSections: model.get('observerSections').join(','),
        superior: model.get('superior'),
        company: model.get('company').join(','),
        shift: model.get('shift')
      };
    },

    changeFilter: function()
    {
      var query = {
        from: time.getMoment(this.$id('from').val(), 'YYYY-MM-DD').valueOf(),
        to: time.getMoment(this.$id('to').val(), 'YYYY-MM-DD').valueOf(),
        interval: buttonGroup.getValue(this.$id('interval')),
        sections: this.$id('sections').val(),
        observerSections: this.$id('observerSections').val(),
        superior: this.$id('superior').val(),
        company: this.$id('company').val(),
        shift: +buttonGroup.getValue(this.$id('shift'))
      };

      if (!query.from || query.from < 0)
      {
        query.from = 0;
      }

      if (!query.to || query.to < 0)
      {
        query.to = 0;
      }

      if (query.from && query.from === query.to)
      {
        var to = time.getMoment(query.to).add(1, 'days');

        this.$id('to').val(to.format('YYYY-MM-DD'));

        query.to = to.valueOf();
      }

      query.sections = query.sections === '' ? [] : query.sections.split(',');
      query.observerSections = query.observerSections === '' ? [] : query.observerSections.split(',');
      query.company = query.company === '' ? [] : query.company.split(',');

      this.model.set(query);
      this.model.trigger('filtered');
    }

  });
});
