// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/core/View',
  'app/reports/templates/report9Table'
], function(
  _,
  t,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'mouseenter tbody > tr': function(e)
      {
        var trEl = e.currentTarget;
        var index = +trEl.dataset.index;

        if (index === this.highlightedIndex)
        {
          return;
        }

        this.$('.is-highlighted').removeClass('is-highlighted');
        this.$('tr[data-index="' + index + '"]').addClass('is-highlighted');

        this.highlightedIndex = index;
      },
      'mouseleave tbody > tr': function()
      {
        this.$('.is-highlighted').removeClass('is-highlighted');

        this.highlightedIndex = -1;
      }

    },

    initialize: function()
    {
      this.highlightedIndex = -1;

      this.listenTo(this.model, 'change', this.render);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix
      };
    },

    afterRender: function()
    {

    }

  });
});
