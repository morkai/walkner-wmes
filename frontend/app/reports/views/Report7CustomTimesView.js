// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'js2form',
  'form2js',
  'app/core/View',
  'app/core/util/buttonGroup',
  'app/reports/templates/report7CustomTimes'
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
