// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/views/DetailsView',
  'app/wmes-osh-employments/templates/details',
  'jquery.stickytableheaders'
], function(
  _,
  $,
  DetailsView,
  template
) {
  'use strict';

  return DetailsView.extend({

    template,

    initialize: function()
    {
      DetailsView.prototype.initialize.apply(this, arguments);

      this.setUpStickyTable();
    },

    afterRender: function()
    {
      DetailsView.prototype.afterRender.apply(this, arguments);

      this.$el.popover({
        selector: '.js-observers',
        container: document.body,
        trigger: 'hover',
        html: true,
        hasContent: function()
        {
          return this.value > 0;
        },
        content: function()
        {
          return '<ol style="font-size: 12px; list-style-position: inside; padding-left: 0">'
            + JSON.parse(this.previousElementSibling.value).map(u => `<li>${_.escape(u.label)}`).join('')
            + '</ol>';
        }
      });
    },

    setUpStickyTable: function()
    {
      this.on('afterRender', () =>
      {
        this.$('.table').stickyTableHeaders({
          fixedOffset: $('.navbar-fixed-top'),
          scrollableAreaX: this.$el
        });
      });

      this.on('beforeRender remove', () =>
      {
        this.$('.table').stickyTableHeaders('destroy');
      });
    }

  });
});
