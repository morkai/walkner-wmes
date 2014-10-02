// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/core/views/DetailsView',
  'app/pressWorksheets/templates/details',
  'app/pressWorksheets/templates/ordersList'
], function(
  _,
  DetailsView,
  detailsTemplate,
  renderOrdersList
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    events: {
      'mouseover tbody > tr': function(e)
      {
        this.toggleHovered(e.currentTarget, true);
      },
      'mouseout tbody > tr': function(e)
      {
        this.toggleHovered(e.currentTarget, false);
      }
    },

    serialize: function()
    {
      return _.extend(DetailsView.prototype.serialize.call(this), {
        renderOrdersList: renderOrdersList,
        extended: false
      });
    },

    toggleHovered: function(rowEl, hovered)
    {
      var $row = this.$(rowEl);
      var $relatedRow = $row.hasClass('pressWorksheets-orders-notes')
        ? $row.prev()
        : $row.next('.pressWorksheets-orders-notes');

      $row.toggleClass('is-hovered', hovered);
      $relatedRow.toggleClass('is-hovered', hovered);
    }

  });
});
