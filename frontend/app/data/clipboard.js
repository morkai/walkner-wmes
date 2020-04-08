// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery'
], function(
  _,
  $
) {
  'use strict';

  var callback = null;

  $(document).on('copy', function(e)
  {
    if (callback === null)
    {
      return;
    }

    e.preventDefault();

    callback(e.originalEvent.clipboardData);
    callback = null;
  });

  return {

    copy: function(setData)
    {
      callback = setData;

      document.execCommand('copy');
    },

    showTooltip: function(view, el, x, y, options)
    {
      var $el = view.$(el);
      var id = $el.data('bs.tooltip.id');

      if (!x && !y)
      {
        var box = el.getBoundingClientRect();

        x = box.left;
        y = box.top + box.height;
      }

      if (id)
      {
        clearTimeout(view.timers[id]);

        var tooltip = $el.data('bs.tooltip');

        if (tooltip)
        {
          tooltip.$tip.removeClass('fade');
          $el.tooltip('destroy').removeData('bs.tooltip.id');
        }
      }

      id = _.uniqueId('tooltip');

      $el.tooltip(_.assign({
        container: view.el,
        trigger: 'manual',
        placement: 'bottom'
      }, options));

      $el.tooltip('show').data('bs.tooltip').tip().addClass('result success').css({
        left: x + 'px',
        top: y + 'px'
      });

      $el.data('bs.tooltip.id', id);

      view.timers[id] = setTimeout(function() { $el.tooltip('destroy').removeData('bs.tooltip.id'); }, 1337);
    }

  };
});
