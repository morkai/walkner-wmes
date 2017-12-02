// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/util/html2pdf'
], function(
  $,
  html2pdf
) {
  'use strict';

  return function openOrderPrint(orders)
  {
    $.ajax({url: '/orders/' + orders.join('+') + '.html', dataType: 'html'}).done(function(html)
    {
      html2pdf(html);
    });
  };
});
