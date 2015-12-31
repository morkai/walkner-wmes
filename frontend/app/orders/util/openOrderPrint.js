// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  return function openOrderPrint(e, el)
  {
    if (e && (e.ctrlKey || e.button === 1))
    {
      return true;
    }

    var url = el.tagName === 'FORM' ? el.getAttribute('action') : el.getAttribute('href');
    var windowName = 'WMES_ORDER_PRINTING';
    var screen = window.screen;
    var width = screen.availWidth * 0.7;
    var height = screen.availHeight * 0.8;
    var left = Math.floor((screen.availWidth - width) / 2);
    var top = Math.floor((screen.availHeight - height) / 2);
    var windowFeatures = 'resizable,scrollbars,location=no'
      + ',top=' + top
      + ',left=' + left
      + ',width=' + Math.floor(width)
      + ',height=' + Math.floor(height);

    return !window.open(url, windowName, windowFeatures);
  };
});
