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
        const data = message.model;
        const mechOrder = this.collection.get(data._id);

        if (mechOrder && data.mrp !== mechOrder.get('mrp'))
        {
          mechOrder.set('mrp', data.mrp);

          this.$(`.list-item[data-id="${mechOrder.id}"] > td[data-id="mrp"]`).html(
            this.prepareMrpCell(data.mrp)
          );
        }
      }
    },

    events: Object.assign({

      'click .mechOrders-editMrp': 'showMrpEditor'

    }, ListView.prototype.events),

    columns: [
      {id: '_id', className: 'is-min', tdClassName: 'text-fixed'},
      {id: 'name', className: 'is-min'},
      {id: 'mrp', className: 'is-min'},
      {id: 'materialNorm', className: 'is-min', tdClassName: 'is-number'},
      '-'
    ],

    serializeActions: function()
    {
      return row =>
      {
        return [ListView.actions.viewDetails(this.collection.get(row._id))];
      };
    },

    serializeRows: function()
    {
      const canManage = user.isAllowedTo('ORDERS:MANAGE');

      return this.collection.map(mechOrder =>
      {
        var row = mechOrder.serialize();

        if (canManage)
        {
          row.mrp = this.prepareMrpCell(row.mrp);
        }

        return row;
      });
    },

    prepareMrpCell: function(mrp)
    {
      let html = '';

      if (mrp)
      {
        html += '<span>' + mrp + '</span>';
      }

      html += ' <button class="btn btn-link mechOrders-editMrp">'
        + this.t(`list:mrp:${mrp ? 'edit' : 'set'}`)
        + '</button>';

      return html;
    },

    showMrpEditor: function(e)
    {
      const $td = this.$(e.target).closest('td');
      const mechOrder = this.collection.get($td.parent().attr('data-id'));
      const $input = $('<input type="text" autocomplete="off">');

      $td.empty().append($input);

      $input.select2({
        allowClear: true,
        placeholder: this.t('list:mrp:placeholder'),
        data: mrpControllers.map(mrpController =>
        {
          return {
            id: mrpController.id,
            text: mrpController.getLabel()
          };
        })
      });

      $input.on('change', e =>
      {
        const newMrp = e.val.length ? e.val : null;

        if (newMrp === mechOrder.get('mrp'))
        {
          return $td.html(this.prepareMrpCell(newMrp));
        }

        $td.html(`<i class="fa fa-spinner fa-spin"></i><span>${newMrp}</span>`);

        this.updateMrp(mechOrder, newMrp, $td);

        $td.parent().next('tr').find('.mechOrders-editMrp').focus();
      });

      $input.select2('open');
    },

    updateMrp: function(mechOrder, newMrp, $td)
    {
      const oldMrp = mechOrder.get('mrp');
      const startTime = Date.now();
      const req = this.promised(mechOrder.save('mrp', newMrp, {patch: true}));

      req.then(() =>
      {
        this.delay(500, startTime, () => $td.html(this.prepareMrpCell(newMrp)));
      });

      req.fail(() =>
      {
        mechOrder.set('mrp', oldMrp);

        $td.html(this.prepareMrpCell(oldMrp));

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: this.t('list:mrp:failure', {
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
