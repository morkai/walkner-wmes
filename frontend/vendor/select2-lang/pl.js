/**
 * Select2 Polish translation.
 * 
 * Author: Jan Kondratowicz <jan@kondratowicz.pl>
 * Author: Łukasz Walukiewicz <lukasz@walukiewicz.eu>
 */
(function (factory)
{
  'use strict';

  if (typeof define === 'function' && define.amd)
  {
    return define(['jquery', 'select2'], factory);
  }
  else
  {
    factory(window.jQuery);
  }
}(function ($)
{
  'use strict';

  function suffix(n, s)
  {
    if (n === 1)
    {
      return '';
    }

    return (n % 100 > 1 && n % 100 < 5) || (n % 100 > 20 && n % 10 > 1 && n % 10 < 5) ? s : 'ów';
  }

  var lang = {
    formatNoMatches: function()
    {
      return 'Brak wyników.';
    },
    formatInputTooShort: function(input, min)
    {
      var n = min - input.length;

      return 'Wpisz jeszcze ' + n + ' znak' + suffix(n, 'i') + '.';
    },
    formatInputTooLong: function(input, max)
    {
      var n = input.length - max;

      return 'Wpisana fraza jest za długa o ' + n + ' znak' + suffix(n, 'i') + '.';
    },
    formatSelectionTooBig: function(limit)
    {
      return 'Możesz zaznaczyć najwyżej ' + limit + ' element' + suffix(limit, 'y') + '.';
    },
    formatLoadMore: function()
    {
      return 'Ładowanie kolejnych wyników...';
    },
    formatSearching: function()
    {
      return 'Szukanie...';
    }
  };

  $.extend($.fn.select2.defaults, lang);

  return lang;
}));
