/**
 * Select2 English translation.
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

  var lang = {
    formatNoMatches: function()
    {
      return 'No matches found.';
    },
    formatInputTooShort: function(input, min)
    {
      var n = min - input.length;

      return 'Please enter ' + n + ' more character' + (n === 1 ? '' : 's');
    },
    formatInputTooLong: function(input, max)
    {
      var n = input.length - max;

      return 'Please delete ' + n + ' character' + (n === 1 ? '' : 's');
    },
    formatSelectionTooBig: function(limit)
    {
      return 'You can only select ' + limit + ' item' + (limit === 1 ? '' : 's');
    },
    formatLoadMore: function()
    {
      return 'Loading more results...';
    },
    formatSearching: function ()
    {
      return 'Searching...';
    }
  };
  
  $.extend($.fn.select2.defaults, lang);

  return lang;
}));
