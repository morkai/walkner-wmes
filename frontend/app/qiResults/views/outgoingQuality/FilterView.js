// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/core/View',
  'app/qiResults/QiOutgoingQualityReport',
  'app/qiResults/templates/outgoingQuality/filter'
], function(
  js2form,
  View,
  QiOutgoingQualityReport,
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
      }
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeFormData());
    },

    serializeFormData: function()
    {
      return {
        week: this.model.get('week')
      };
    },

    changeFilter: function()
    {
      var query = {
        week: QiOutgoingQualityReport.parseWeek(this.$id('week').val())
      };

      this.$id('week').val(query.week);

      this.model.set(query);
      this.model.trigger('filtered');
    }

  });
});
