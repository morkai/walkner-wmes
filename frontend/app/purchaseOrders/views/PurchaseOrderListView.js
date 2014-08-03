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

    className: 'pos-list',

    remoteTopics: {
      'purchaseOrders.synced': function(message)
      {
        if (message.created || message.updated || message.closed)
        {
          this.refreshCollection();
        }
      }
    },

    events: {
      'mouseup .list-item': function(e)
      {
        if (e.altKey || e.which === 3)
        {
          return;
        }

        var model = this.collection.get(e.currentTarget.dataset.id);
        var url = model.genClientUrl();

        if (e.ctrlKey || e.which === 2)
        {
          window.open(url);
        }
        else
        {
          this.broker.publish('router.navigate', {
            url: url,
            replace: false,
            trigger: true
          });
        }
      }
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
      return null;
    },

    serializeRows: function()
    {
      return this.collection.invoke('serialize');
    }

  });
});
