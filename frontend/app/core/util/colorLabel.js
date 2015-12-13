// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([

], function(

) {
  'use strict';

  var contrastMap = {};

  function requiresContrast(color)
  {
    var r = 0;
    var g = 0;
    var b = 0;
    var matches = color.match(/^#([a-fA-F0-9]{3,6})$/);

    if (matches)
    {
      var hex = matches[1];

      if (hex.length === 3)
      {
        r = hex.substr(0, 1);
        g = hex.substr(1, 1);
        b = hex.substr(2, 1);
        r += r;
        g += g;
        b += b;
      }
      else
      {
        r = hex.substr(0, 2);
        g = hex.substr(2, 2);
        b = hex.substr(4, 2);
      }

      r = parseInt(r, 16);
      g = parseInt(g, 16);
      b = parseInt(b, 16);
    }
    else
    {
      matches = color.match(/([0-9]+).*?([0-9]+).*?([0-9]+)/);

      if (matches)
      {
        r = parseInt(matches[1], 10);
        g = parseInt(matches[2], 10);
        b = parseInt(matches[3], 10);
      }
    }

    return (1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255) < 0.3;
  }

  return function(options)
  {
    if (typeof options === 'string')
    {
      options = {color: options};
    }

    var className = ['label', 'color'];

    if (options.className)
    {
      className = className.concat(options.className);
    }

    var title = options.title || '';
    var color = options.color;
    var label = options.label || color;
    var contrast = contrastMap[color];

    if (contrast === undefined)
    {
      contrast = contrastMap[color] = requiresContrast(color);
    }

    if (contrast)
    {
      className.push('is-contrast');
    }

    return '<span class="' + className.join(' ') + '" title="' + title + '" style="background: ' + color + '">'
      + label
      + '</span>';
  };
});
