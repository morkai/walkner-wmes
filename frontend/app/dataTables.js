// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'datatables.net'
], function(
  $
) {
  'use strict';

  var collator = new Intl.Collator(['pl'], {
    usage: 'sort',
    sensitivity: 'base',
    ignorePunctuation: true,
    numeric: true
  });

  $.fn.dataTable.ext.type.order['locale-asc'] = function(a, b)
  {
    return collator.compare(a, b);
  };

  $.fn.dataTable.ext.type.order['locale-desc'] = function(a, b)
  {
    return collator.compare(b, a);
  };

  return $;
});
