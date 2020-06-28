// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/views/DetailsView',
  'app/kaizenOrders/dictionaries',
  'app/suggestions/templates/details'
], function(
  _,
  $,
  DetailsView,
  kaizenDictionaries,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    currentTab: null,

    events: _.assign({
      'click a[data-toggle="tab"]': function(e)
      {
        this.currentTab = e.currentTarget.dataset.tab;
      }
    }, DetailsView.prototype.events),

    getTemplateData: function()
    {
      var status = this.model.get('status');
      var showKaizenPanel = status !== 'new' && status !== 'accepted';

      return {
        showKaizenPanel: showKaizenPanel,
        suggestionColumnSize: showKaizenPanel ? 6 : 12,
        kaizenColumnSize: showKaizenPanel ? 6 : 0
      };
    },

    afterRender: function()
    {
      DetailsView.prototype.afterRender.call(this);

      var view = this;

      this.$('.prop[data-dictionary]').each(function()
      {
        var descriptionHolder = kaizenDictionaries[this.dataset.dictionary].get(
          view.model.get(this.dataset.property)
        );

        if (!descriptionHolder)
        {
          return;
        }

        var description = descriptionHolder.get('description');

        if (_.isEmpty(description))
        {
          return;
        }

        this.classList.toggle('has-description', true);
        this.dataset.description = description;
      });

      this.$el.popover({
        container: this.el,
        selector: '.has-description',
        placement: function(popoverEl, propEl)
        {
          if (window.innerWidth <= 992)
          {
            return 'top';
          }

          var $column = view.$(propEl).closest('.panel').parent();

          if ($column[0] === $column.parent().children().last()[0])
          {
            return 'top';
          }

          return 'right';
        },
        trigger: 'hover',
        content: function()
        {
          return this.dataset.description;
        },
        template: function()
        {
          return $($.fn.popover.Constructor.DEFAULTS.template).addClass('suggestions-details-popover');
        }
      });

      this.$('a[data-tab="' + (this.currentTab || this.options.initialTab) + '"]').click();
    }

  });
});
