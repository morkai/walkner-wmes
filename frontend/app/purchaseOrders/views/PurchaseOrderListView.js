// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/user',
  'app/core/views/ListView'
], function(
  t,
  user,
  ListView
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'purchaseOrders.synced': 'refreshCollection'
    },

    serializeColumns: function()
    {
      var columns = ['_id', 'pGr', 'plant', 'minScheduleDate'].map(function(property)
      {
        return {id: property, label: t('purchaseOrders', 'PROPERTY:' + property)};
      });

      columns[3].noData = '-';

      if (!user.data.vendor)
      {
        columns.unshift({id: 'vendorText', label: t('purchaseOrders', 'PROPERTY:vendor')});
      }

      return columns;
    },

    serializeActions: function()
    {
      return function()
      {
        return [];
      };
    },

    serializeRows: function()
    {
      return this.collection.invoke('serialize');
    }

  });
});
