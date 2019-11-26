// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/views/DetailsView',
  '../dictionaries',
  'app/kaizenOrders/templates/details'
], function(
  _,
  $,
  DetailsView,
  kaizenDictionaries,
  template
) {
  'use strict';

  var PANEL_COLUMN_SIZES = {
    '100': [12, 0, 0],
    '010': [0, 12, 0],
    '001': [0, 0, 12],
    '110': [6, 6, 0],
    '011': [0, 8, 4],
    '101': [6, 0, 6],
    '111': [4, 4, 4]
  };

  return DetailsView.extend({

    template: template,

    currentTab: null,

    events: _.assign({
      'click a[data-toggle="tab"]': function(e)
      {
        this.currentTab = e.currentTarget.dataset.tab;
      }
    }, DetailsView.prototype.events),

    serialize: function()
    {
      var types = this.model.get('types');
      var showNearMissPanel = _.contains(types, 'nearMiss');
      var showSuggestionPanel = _.contains(types, 'suggestion');
      var showKaizenPanel = _.contains(types, 'kaizen');
      var columnSizes = PANEL_COLUMN_SIZES[
        (showNearMissPanel ? '1' : '0')
        + (showSuggestionPanel ? '1' : '0')
        + (showKaizenPanel ? '1' : '0')
      ];

      return _.assign(DetailsView.prototype.serialize.call(this), {
        relatedSuggestion: this.model.supportsRelatedSuggestion(),
        multi: !!window.KAIZEN_MULTI || this.model.isMulti(),
        showNearMissPanel: showNearMissPanel,
        showSuggestionPanel: showSuggestionPanel,
        showKaizenPanel: showKaizenPanel,
        nearMissColumnSize: columnSizes[0],
        suggestionColumnSize: columnSizes[1],
        kaizenColumnSize: columnSizes[2]
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
        },
        template: function()
        {
          return $($.fn.popover.Constructor.DEFAULTS.template).addClass('kaizenOrders-details-popover');
        }
      });

      this.$('a[data-tab="' + (this.currentTab || this.options.initialTab) + '"]').click();
    }

  });
});
