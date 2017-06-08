// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/core/views/ListView',
  'app/core/views/ActionFormView'
], function(
  _,
  t,
  user,
  ListView,
  ActionFormView
) {
  'use strict';

  return ListView.extend({

    className: 'is-colored',

    remoteTopics: {
      'orders.invalid.synced': 'refreshCollection',
      'orders.invalid.ignored': function(message)
      {
        this.collection.toggleSelection(message.model._id, false);

        this.refreshCollectionNow();
      }
    },

    events: _.assign({

      'click .action-select': function(e)
      {
        this.collection.toggleSelection(this.$(e.target).closest('tr').attr('data-id'));

        return false;
      },

      'click .action-ignore': function(e)
      {
        ActionFormView.showDialog({
          model: this.collection.get(this.$(e.target).closest('tr').attr('data-id')),
          actionKey: 'ignore',
          formMethod: 'DELETE',
          formActionSeverity: 'warning'
        });

        return false;
      }

    }, ListView.prototype.events),

    initialize: function()
    {
      ListView.prototype.initialize.apply(this, arguments);

      this.listenTo(this.collection, 'selected', this.onSelected);
    },

    columns: [
      {id: 'orderNo', className: 'is-min'},
      {id: 'nc12', className: 'is-min'},
      {id: 'productName', className: 'is-min'},
      {id: 'mrp', className: 'is-min'},
      {id: 'qty', className: 'is-min is-number'},
      {id: 'startDate', className: 'is-min'},
      {id: 'problem'},
      {id: 'solution'},
      {id: 'iptStatus'},
      {id: 'iptComment'}
    ],

    serializeActions: function()
    {
      var page = this;

      return function(row)
      {
        var model = page.collection.get(row._id);

        if (model.get('status') !== 'invalid')
        {
          return [];
        }

        var actions = [{
          id: 'select',
          icon: 'check-square-o',
          label: t('invalidOrders', 'LIST:ACTION:select'),
          className: page.collection.selected[model.id] ? 'active' : ''
        }];

        if (user.isAllowedTo('ORDERS:MANAGE'))
        {
          actions.push({
            id: 'ignore',
            icon: 'ban',
            label: t('invalidOrders', 'LIST:ACTION:ignore')
          });
        }

        return actions;
      };
    },

    onSelected: function(id, state)
    {
      (id ? this.$row(id) : this.$el).find('.action-select').toggleClass('active', state);
    }

  });
});
