// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'form2js',
  'app/core/View',
  'app/core/util/buttonGroup',
  'app/reports/templates/7/customTimes'
], function(
  js2form,
  form2js,
  View,
  buttonGroup,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': function()
      {
        this.trigger('submit', form2js(this.el));

        return false;
      },
      'click #-reset': function()
      {
        this.trigger('reset');

        return false;
      }
    },

    afterRender: function()
    {
      js2form(this.el, this.model.getCustomTimes());

      buttonGroup.toggle(this.$id('clipInterval'));
      buttonGroup.toggle(this.$id('dtcInterval'));
    }

  });
});
