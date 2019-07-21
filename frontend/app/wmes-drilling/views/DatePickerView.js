// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/core/util/getShiftStartInfo',
  'app/wmes-drilling/templates/datePicker'
], function(
  t,
  time,
  View,
  getShiftStartInfo,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    nlsDomain: 'wmes-drilling',

    dialogClassName: 'drilling-datePicker-dialog',

    events: {
      'focus [data-vkb]': function(e)
      {
        if (this.options.vkb)
        {
          this.options.vkb.show(e.target, this.onVkbValueChange);
        }
      },
      'click .btn[data-days]': function(e)
      {
        var moment = getShiftStartInfo(Date.now()).moment.add(+e.currentTarget.dataset.days, 'days');

        this.$id('day').val(moment.format('DD'));
        this.$id('month').val(moment.format('MM'));
        this.$id('year').val(moment.format('YYYY'));

        if (this.options.vkb)
        {
          this.options.vkb.hide();
        }
      },
      'submit': function()
      {
        var moment = this.getMoment();

        this.trigger('picked', moment.isValid() ? moment.format('YYYY-MM-DD') : this.model.date);

        return false;
      }
    },

    initialize: function()
    {
      this.onVkbValueChange = this.onVkbValueChange.bind(this);
    },

    destroy: function()
    {
      if (this.options.vkb)
      {
        this.options.vkb.hide();
      }
    },

    getTemplateData: function()
    {
      var moment = time.getMoment(this.model.date, 'YYYY-MM-DD');

      return {
        day: moment.format('DD'),
        month: moment.format('MM'),
        year: moment.format('YYYY')
      };
    },

    getMoment: function()
    {
      var day = this.$id('day').val();
      var month = this.$id('month').val();
      var year = this.$id('year').val();
      var date = year + '-' + month + '-' + day;

      return time.getMoment(date, 'YYYY-MM-DD');
    },

    onVkbValueChange: function()
    {
      var moment = this.getMoment();

      this.$id('day')[0].setCustomValidity(
        moment.isValid() ? '' : this.t('datePicker:invalid')
      );
    }

  });
});
