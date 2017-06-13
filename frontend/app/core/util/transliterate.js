// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([], function()
{
  'use strict';

  var TRANSLITERATION_MAP = {
    'Ę': 'E', 'ę': 'e',
    'Ó': 'O', 'ó': 'o',
    'Ą': 'A', 'ą': 'a',
    'Ś': 'S', 'ś': 's',
    'Ł': 'L', 'ł': 'l',
    'Ż': 'Z', 'ż': 'z',
    'Ź': 'Z', 'ź': 'z',
    'Ć': 'C', 'ć': 'c',
    'Ń': 'N', 'ń': 'n'
  };
  var TRANSLITERATION_RE = new RegExp(Object.keys(TRANSLITERATION_MAP).join('|'), 'g');

  return function transliterate(value)
  {
    return String(value).replace(TRANSLITERATION_RE, function(m) { return TRANSLITERATION_MAP[m]; });
  };
});
