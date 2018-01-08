// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/ListPage',
  'i18n!app/nls/paintShopPaints'
], function(
  ListPage
) {
  'use strict';

  return ListPage.extend({

    baseBreadcrumb: true,

    columns: [
      {id: '_id', className: 'is-min'},
      {id: 'shelf', className: 'is-min'},
      {id: 'bin', className: 'is-min'},
      'name'
    ]

  });
});
