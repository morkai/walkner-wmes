// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/core/views/DetailsView',
  'app/kaizenOrders/dictionaries',
  './CoordinateView',
  'app/suggestions/templates/details'
], function(
  _,
  $,
  viewport,
  DetailsView,
  kaizenDictionaries,
  CoordinateView,
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
      },
      'click .suggestions-details-coordSection-coordinate': function(e)
      {
        var $coordSection = this.$(e.target).closest('.suggestions-details-coordSection');

        var dialogView = new CoordinateView({
          model: this.model,
          coordSection: this.model.getCoordSection($coordSection[0].dataset.section)
        });

        viewport.showDialog(dialogView, this.t('coordinate:title', {rid: this.model.get('rid')}));
      }
    }, DetailsView.prototype.events),

    initialize: function()
    {
      DetailsView.prototype.initialize.call(this);

      $(window).on('resize.' + this.idPrefix, this.onWindowResize.bind(this));
    },

    destroy: function()
    {
      DetailsView.prototype.destroy.call(this);

      $(window).off('.' + this.idPrefix);
    },

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

      this.toggleOverflowX();

      this.$('a[data-tab="' + (this.currentTab || this.options.initialTab) + '"]').click();
    },

    toggleOverflowX: function()
    {
      this.$('.suggestions-details-coordSections').css(
        'overflow-x',
        (this.$el.outerWidth() + 50) < window.innerWidth ? 'visible' : ''
      );
    },

    onWindowResize: function()
    {
      this.toggleOverflowX();
    }

  });
});
