// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../core/Model'
], function(
  _,
  t,
  time,
  Model
) {
  'use strict';

  var SOURCE_TO_ICON = {
    ps: 'fa-paint-brush',
    wh: 'fa-truck'
  };

  function formatCommentWithIcon(comment)
  {
    if (!comment)
    {
      return '';
    }

    if (!comment.text.replace(/[^A-Za-z0-9]+/g, '').length)
    {
      return '';
    }

    var result = _.escape(comment.text.trim());
    var icon = SOURCE_TO_ICON[comment.source];

    if (icon)
    {
      result = '<i class="fa ' + icon + '"></i> ' + result;
    }

    return result;
  }

  return Model.extend({

    getActualOrderData: function()
    {
      var orderData = this.pick(['quantityTodo', 'statuses', 'priority']);

      orderData.quantityDone = this.getQuantityDone();

      return orderData;
    },

    getCommentWithIcon: function()
    {
      return formatCommentWithIcon(_.last(this.get('comments')));
    },

    getDropZone: function()
    {
      var whDropZone = this.get('whDropZone');
      var whTime = this.get('whTime');

      if (_.isEmpty(whDropZone))
      {
        return '';
      }

      return t('planning', 'orders:dropZone', {
        group: _.escape(whDropZone),
        time: time.utc.format(whTime, 'HH:mm')
      });
    },

    getQuantityDone: function()
    {
      var quantityDone = this.get('quantityDone');
      var operation = this.collection && this.collection.plan
        ? this.collection.plan.orders.get(this.id).get('operation')
        : null;

      if (operation)
      {
        return quantityDone.byOperation[operation.no] || 0;
      }

      return quantityDone.total;
    }

  }, {

    formatCommentWithIcon: formatCommentWithIcon

  });
});
