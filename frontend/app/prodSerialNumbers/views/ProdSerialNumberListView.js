// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/views/ListView'
], function(
  user,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-colored',

    remoteTopics: {
      'prodSerialNumbers.created.**': 'refreshCollection'
    },

    serializeColumns: function()
    {
      var columns = [
        {id: '_id', className: 'is-min'},
        {id: 'orderNo', className: 'is-min'},
        {id: 'serialNo', className: 'is-min'},
        {id: 'prodLine', className: 'is-min'}
      ];

      if (user.isAllowedTo('PROD_DATA:VIEW'))
      {
        columns.push({id: 'sapTaktTime', className: 'is-min'});
      }

      columns.push(
        {id: 'taktTime', className: 'is-min'},
        {id: 'iptTaktTime', className: 'is-min'},
        {id: 'scannedAt', className: 'is-min'},
        {id: 'iptAt', className: 'is-min'},
        {id: 'bom'}
      );

      return columns;
    },

    serializeActions: function()
    {
      return null;
    },

    afterRender: function()
    {
      ListView.prototype.afterRender.call(this);

      var view = this;

      this.$('.list-item > td[data-id="bom"]')
        .popover({
          container: view.el,
          trigger: 'hover',
          placement: 'auto left',
          html: true,
          content: function()
          {
            var psn = view.collection.get(this.parentNode.dataset.id);

            if (!psn)
            {
              return '';
            }

            var bom = psn.get('bom');

            if (!bom || !bom.length)
            {
              return '';
            }

            var html = '<dl>';

            bom.forEach(function(c)
            {
              var parts = c.split(':');

              html += '<dt>' + parts.shift();
              html += '<dd>' + (parts.join(':') || '-');
            });

            return html + '</dl>';
          }
        });
    },

    refreshCollection: function(message)
    {
      if (!message || this.collection.matches(message))
      {
        ListView.prototype.refreshCollection.apply(this, arguments);
      }
    }

  });
});
