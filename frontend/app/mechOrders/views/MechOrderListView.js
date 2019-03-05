// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/data/mrpControllers',
  'app/core/views/ListView'
], function(
  _,
  $,
  t,
  user,
  viewport,
  mrpControllers,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    localTopics: {
      'mrpControllers.synced': 'render'
    },

    remoteTopics: {
      'mechOrders.synced': 'refreshCollection',
      'mechOrders.edited': function(message)
      {
        var data = message.model;
        var mechOrder = this.collection.get(data._id);

        if (mechOrder && data.mrp !== mechOrder.get('mrp'))
        {
          mechOrder.set('mrp', data.mrp);

          this.$('.list-item[data-id=' + mechOrder.id + '] > td[data-id=mrp]').html(
            this.prepareMrpCell(data.mrp)
          );
        }
      }
    },

    events: _.assign(ListView.prototype.events, {
      'click .mechOrders-editMrp': 'showMrpEditor'
    }),

    columns: [
      {id: '_id', className: 'is-min'},
      'name',
      'mrp',
      {id: 'materialNorm', className: 'is-min'}
    ],

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        return [ListView.actions.viewDetails(collection.get(row._id))];
      };
    },

    serializeRows: function()
    {
      var view = this;
      var canManage = user.isAllowedTo('ORDERS:MANAGE');

      return this.collection.map(function(mechOrder)
      {
        var row = mechOrder.toJSON();

        if (canManage)
        {
          row.mrp = view.prepareMrpCell(row.mrp);
        }

        return row;
      });
    },

    prepareMrpCell: function(mrp)
    {
      var html = '';

      if (mrp)
      {
        html += '<span>' + mrp + '</span>';
      }

      html += ' <button class="btn btn-link mechOrders-editMrp">'
        + t('mechOrders', 'list:mrp:' + (mrp ? 'edit' : 'set'))
        + '</button>';

      return html;
    },

    showMrpEditor: function(e)
    {
      var $td = this.$(e.target).closest('td');
      var mechOrder = this.collection.get($td.parent().attr('data-id'));
      var view = this;

      var $input = $('<input type="text" autocomplete="new-password">');

      $td.empty().append($input);

      $input.select2({
        allowClear: true,
        placeholder: t('mechOrders', 'list:mrp:placeholder'),
        data: mrpControllers.map(function(mrpController)
        {
          return {
            id: mrpController.id,
            text: mrpController.getLabel()
          };
        })
      });

      $input.on('change', function(e)
      {
        var newMrp = e.val.length ? e.val : null;

        if (newMrp === mechOrder.get('mrp'))
        {
          return $td.html(view.prepareMrpCell(newMrp));
        }

        $td.html('<i class="fa fa-spinner fa-spin"></i><span>' + newMrp + '</span>');

        view.updateMrp(mechOrder, newMrp, $td);

        $td.parent().next('tr').find('.mechOrders-editMrp').focus();
      });

      $input.select2('open');
    },

    updateMrp: function(mechOrder, newMrp, $td)
    {
      var oldMrp = mechOrder.get('mrp');
      var startTime = Date.now();
      var req = this.promised(mechOrder.save('mrp', newMrp, {patch: true}));
      var view = this;

      req.then(function()
      {
        view.delay(500, startTime, function() { $td.html(view.prepareMrpCell(newMrp)); });
      });

      req.fail(function()
      {
        mechOrder.set('mrp', oldMrp);

        $td.html(view.prepareMrpCell(oldMrp));

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: t('mechOrders', 'list:mrp:failure', {
            nc12: mechOrder.id
          })
        });
      });
    },

    delay: function(maxDelay, startTime, cb)
    {
      var elapsedTime = Date.now() - startTime;

      if (elapsedTime > maxDelay)
      {
        cb();
      }
      else
      {
        this.timers[Math.random()] = setTimeout(cb, maxDelay - elapsedTime);
      }
    }

  });
});
