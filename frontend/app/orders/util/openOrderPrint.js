// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
