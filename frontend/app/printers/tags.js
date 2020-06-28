// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n'
], function(
  t
) {
  'use strict';

  var list = [
    'generic/text',
    'orders',
    'qi',
    'planning',
    'paintShop',
    'hourlyPlans',
    'fte/production',
    'fte/warehouse',
    'fte/other',
    'kanban/kk',
    'kanban/empty',
    'kanban/full',
    'kanban/wh',
    'kanban/desc',
    'wh/cart/fmx',
    'wh/cart/kitter',
    'wh/cart/packer',
    'wh/psPicklist',
    'hidLamps',
    'componentLabels'
  ];

  return {
    toList: function()
    {
      return [].concat(list);
    },
    toSelect2: function()
    {
      return list.map(function(tag)
      {
        return {
          id: tag,
          text: t('printers', 'tags:' + tag)
        };
      });
    },
    toString: function(tags)
    {
      return (tags || []).map(function(tag) { return t('printers', 'tags:' + tag); }).join('; ');
    }
  };
});
