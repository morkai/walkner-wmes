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
      var $btn = view.$(el).tooltip(_.assign({
        container: view.el,
        trigger: 'manual',
        placement: 'bottom'
      }, options));

      $btn.tooltip('show').data('bs.tooltip').tip().addClass('result success').css({
        left: x + 'px',
        top: y + 'px'
      });

      view.timers[_.uniqueId('hideTooltip')] = setTimeout(function() { $btn.tooltip('destroy'); }, 1337);
    }

  };
});
