// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Model'
], function(
  _,
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
      return this.pick(['quantityTodo', 'quantityDone', 'statuses']);
    },

    getCommentWithIcon: function()
    {
      return formatCommentWithIcon(_.last(this.get('comments')));
    }

  }, {

    formatCommentWithIcon: formatCommentWithIcon

  });
});
