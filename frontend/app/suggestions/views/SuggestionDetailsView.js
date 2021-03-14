// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  'app/kaizenOrders/dictionaries',
  'app/suggestions/templates/details'
], function(
  DetailsView,
  kaizenDictionaries,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

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
      var view = this;

      DetailsView.prototype.afterRender.call(view);

      view.$('.prop[data-dictionary]').each(function()
      {
        var descriptionHolder = kaizenDictionaries[this.dataset.dictionary].get(
          view.model.get(this.dataset.property)
        );

        if (!descriptionHolder)
        {
          return;
        }

        var description = descriptionHolder.get('description');

        if (!description)
        {
          return;
        }

        this.classList.toggle('has-description', true);
        this.dataset.description = description;
      });

      view.$el.popover({
        container: this.el,
        selector: '.has-description',
        className: 'suggestions-details-popover',
        trigger: 'hover',
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
        content: function()
        {
          return this.dataset.description;
        }
      });
    }

  });
});
