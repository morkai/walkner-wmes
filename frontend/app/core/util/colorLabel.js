// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  var contrastMap = {};

  function requiresContrast(color)
  {
    if (contrastMap[color] !== undefined)
    {
      return contrastMap[color];
    }

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

    contrastMap[color] = (1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255) < 0.3;

    return contrastMap[color];
  }

  function colorLabel(options)
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
    var color = options.color.toUpperCase();
    var label = options.label || color;

    if (requiresContrast(color))
    {
      className.push('is-contrast');
    }

    return '<span class="' + className.join(' ') + '" title="' + title + '" style="background: ' + color + '">'
      + label
      + '</span>';
  }

  colorLabel.requiresContrast = requiresContrast;

  return colorLabel;
});
