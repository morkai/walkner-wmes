// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/core/views/DetailsView',
  'app/kaizenOrders/dictionaries',
  'app/suggestions/templates/details'
], function(
  _,
  DetailsView,
  kaizenDictionaries,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    currentTab: null,

    events: _.extend({
      'click a[data-toggle="tab"]': function(e)
      {
        this.currentTab = e.currentTarget.dataset.tab;
      }
    }, DetailsView.prototype.events),

    serialize: function()
    {
      var showKaizenPanel = status !== 'new' && status !== 'cancelled';

      return _.extend(DetailsView.prototype.serialize.call(this), {
        showKaizenPanel: showKaizenPanel,
        suggestionColumnSize: showKaizenPanel ? 6 : 12,
        kaizenColumnSize: showKaizenPanel ? 6 : 0
      });
    },

    afterRender: function()
    {
      DetailsView.prototype.afterRender.call(this);

      var view = this;

      this.$('.prop[data-dictionary]').each(function()
      {
        var descriptionHolder = kaizenDictionaries[this.dataset.dictionary].get(view.model.get(this.dataset.property));

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
        }
      });

      this.$('a[data-tab="' + (this.currentTab || this.options.initialTab) + '"]').click();
    }

  });
});
