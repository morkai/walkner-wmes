// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/viewport',
  'app/core/views/ListView',
  'app/data/prodLines',
  'app/data/clipboard',
  'app/orgUnits/util/renderOrgUnitPath'
], function(
  _,
  user,
  viewport,
  ListView,
  prodLines,
  clipboard,
  renderOrgUnitPath
) {
  'use strict';

  return ListView.extend({

    className: '',

    remoteTopics: {
      'production.synced.**': 'refreshCollection',
      'production.edited.**': function()
      {
        this.refreshCollection();
      }
    },

    events: _.assign({

      'click td[data-id="creator"]': function(e)
      {
        var view = this;
        var logEntry = view.collection.get(view.$(e.target).closest('.list-item')[0].dataset.id);
        var creator = logEntry.get('creator');

        if (!creator || !creator.ip)
        {
          return;
        }

        clipboard.copy(function(clipboardData)
        {
          clipboardData.setData('text/plain', creator.ip);

          clipboard.showTooltip(view, e.currentTarget, e.pageX, e.pageY, {
            title: view.t('ipCopied', {ip: creator.ip})
          });
        });
      }

    }, ListView.prototype.events),

    columns: function()
    {
      return [
        {id: 'prodLine', className: 'is-min'},
        {
          id: 'station',
          className: 'is-min is-number',
          label: this.t('list:station'),
          thAttrs: {title: this.t('PROPERTY:station')}
        },
        {id: 'type', className: 'is-min'},
        'data',
        {id: 'prodShift', className: 'is-min'},
        {id: 'prodShiftOrder', className: 'is-min'},
        {id: 'createdAt', className: 'is-min'},
        {id: 'creator', className: 'is-min'},
        {id: 'instanceId', className: 'is-min'}
      ];
    },

    serializeActions: function()
    {
      return null;
    },

    afterRender: function()
    {
      var view = this;

      ListView.prototype.afterRender.apply(view, arguments);

      view.$('.list-item > td[data-id="prodLine"]')
        .popover({
          container: this.el,
          trigger: 'hover',
          placement: 'auto right',
          html: true,
          content: function()
          {
            var path = renderOrgUnitPath(prodLines.get(view.$(this).text().trim()), false, false);

            return path ? path.split(' \\ ').join('<br>\\ ') : '?';
          }
        });
    },

    refreshCollection: function(message)
    {
      if (!message || this.collection.matches(message))
      {
        return ListView.prototype.refreshCollection.apply(this, arguments);
      }
    }

  });
});
