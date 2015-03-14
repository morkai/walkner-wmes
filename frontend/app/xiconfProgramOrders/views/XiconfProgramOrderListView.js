// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/views/ListView'
], function(
  _,
  t,
  time,
  user,
  ListView
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'xiconf.orders.**': 'refreshCollection'
    },

    events: {
      'click tr[data-id]': function(e)
      {
        if (window.getSelection().toString() !== '' || e.target.tagName === 'A')
        {
          return;
        }

        var url = this.collection.get(e.currentTarget.dataset.id).genClientUrl();

        if (e.ctrlKey)
        {
          window.open(url);
        }
        else if (!e.altKey)
        {
          this.broker.publish('router.navigate', {
            url: url,
            trigger: true,
            replace: false
          });
        }
      }
    },

    columns: [
      {id: 'orderNo', label: t('xiconf', 'PROPERTY:no')},
      {id: 'nc12', label: t('xiconf', 'PROPERTY:nc12')},
      {id: 'name', label: t('xiconf', 'PROPERTY:programName')},
      {id: 'quantity', label: t('xiconf', 'PROPERTY:quantity')},
      'reqDate',
      'createdAt',
      'duration'
    ],

    serializeActions: function()
    {
      return null;
    },

    serializeRows: function()
    {
      var canViewOrders = user.isAllowedTo('ORDERS:VIEW');

      function linkToOrder(model)
      {
        if (!canViewOrders || !model.get('quantityParent'))
        {
          return model.id;
        }

        return '<a href="#orders/' + model.id + '">' + model.id + '</a>';
      }

      return this.collection.map(function(model)
      {
        var nc12s = [];
        var names = [];

        _.forEach(model.get('nc12'), function(nc12)
        {
          nc12s.push(nc12._id);
          names.push(nc12.name);
        });

        var createdAt = Date.parse(model.get('createdAt')) || 0;
        var finishedAt = Date.parse(model.get('finishedAt')) || Date.now();
        var duration = createdAt ? (finishedAt - createdAt) / 1000 : 0;

        return {
          _id: model.id,
          className: 'xiconfProgramOrders-list-item ' + model.getStatusClassName(),
          orderNo: linkToOrder(model),
          nc12: nc12s.length ? nc12s.join('; ') : null,
          name: names.length ? names.join('; ') : null,
          quantity: model.get('quantityDone').toLocaleString() + '/' + model.get('quantityTodo').toLocaleString(),
          reqDate: time.format(model.get('reqDate'), 'YYYY-MM-DD'),
          createdAt: createdAt ? time.format(createdAt, 'YYYY-MM-DD') : null,
          duration: duration ? time.toString(duration) : null
        };
      });
    }

  });
});
