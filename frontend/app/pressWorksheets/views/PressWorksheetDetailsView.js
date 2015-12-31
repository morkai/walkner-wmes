// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
