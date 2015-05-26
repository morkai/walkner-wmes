// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/core/views/DetailsView',
  '../dictionaries',
  'app/kaizenOrders/templates/details'
], function(
  _,
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

      return _.extend(DetailsView.prototype.serialize.call(this), {
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

      var model = this.model;

      this.$('.prop[data-dictionary]').each(function()
      {
        var descriptionHolder = kaizenDictionaries[this.dataset.dictionary].get(model.get(this.dataset.property));

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
        placement: function()
        {
          return window.innerWidth <= 992 ? 'top' : 'right';
        },
        trigger: 'hover',
        content: function()
        {
          return this.dataset.description;
        }
      });
    }

  });
});
