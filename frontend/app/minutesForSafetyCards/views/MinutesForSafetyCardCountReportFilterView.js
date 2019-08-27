// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  'app/minutesForSafetyCards/templates/countReportFilter'
], function(
  js2form,
  time,
  View,
  buttonGroup,
  idAndLabel,
  dateTimeRange,
  setUpUserSelect2,
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

      this.$id('sections').select2({
        width: '350px',
        allowClear: true,
        multiple: true,
        data: kaizenDictionaries.sections.map(idAndLabel)
      });

      setUpUserSelect2(this.$id('user'), {
        width: '300px',
        view: this
      });
    },

    serializeFormData: function()
    {
      var model = this.model;
      var from = +model.get('from');
      var to = +model.get('to');
      var owner = model.get('owner');
      var confirmer = model.get('confirmer');

      return {
        interval: model.get('interval'),
        'from-date': from ? time.format(from, 'YYYY-MM-DD') : '',
        'to-date': to ? time.format(to, 'YYYY-MM-DD') : '',
        sections: model.get('sections').join(','),
        user: owner || confirmer,
        userType: confirmer ? 'confirmer' : 'owner'
      };
    },

    changeFilter: function()
    {
      var range = dateTimeRange.serialize(this);
      var userType = this.$('input[name="userType"]:checked').val();
      var user = this.$id('user').val();
      var query = {
        from: range.from ? range.from.valueOf() : 0,
        to: range.to ? range.to.valueOf() : 0,
        interval: buttonGroup.getValue(this.$id('interval')),
        sections: this.$id('sections').val(),
        owner: '',
        confirmer: ''
      };

      if (user)
      {
        query[userType] = user;
      }

      query.sections = query.sections === '' ? [] : query.sections.split(',');

      this.model.set(query);
      this.model.trigger('filtered');
    }

  });
});
