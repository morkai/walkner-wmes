// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/util/resultTips'
], function(
  $,
  resultTips
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

    showTooltip: function(options)
    {
      resultTips.showCopied(options);
    }

  };
});
