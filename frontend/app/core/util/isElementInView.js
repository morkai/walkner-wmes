// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery'
], function(
  $
) {
  'use strict';

  var $window = $(window);

  return function(element, options)
  {
    var pageTop = $window.scrollTop();
    var pageBottom = pageTop + $window.height();
    var $element = $(element);
    var elementTop = $element.offset().top;
    var height = options && options.height || $element.height();
    var elementBottom = options.bottom || (elementTop + height);

    if (options && options.fullyInView === true)
    {
      return (pageTop < elementTop) && (pageBottom > elementBottom);
    }

    return (elementTop <= pageBottom) && (elementBottom >= pageTop);
  };
});
