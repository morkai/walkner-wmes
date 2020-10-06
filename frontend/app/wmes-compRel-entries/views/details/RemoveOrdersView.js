// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/wmes-compRel-entries/templates/details/removeOrders'
], function(
  time,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'change #-orders': function(e)
      {
        e.target.value = e.target.value.split(/[^0-9]+/).filter(function(v) { return v.length === 9; }).join(' ');
      },

      'submit': function()
      {
        this.submit();

        return false;
      }

    },

    afterRender: function()
    {
      var releasedAt = {};
      var releasedBy = {};

      this.model.get('orders').forEach(function(order)
      {
        var releasedAtTime = Date.parse(order.releasedAt);

        if (!releasedAt[releasedAtTime])
        {
          releasedAt[releasedAtTime] = {
            id: releasedAtTime,
            text: time.format(releasedAtTime, 'L LT')
          };
        }

        if (!releasedBy[order.releasedBy.id])
        {
          releasedBy[order.releasedBy.id] = {
            id: order.releasedBy.id,
            text: order.releasedBy.label
          };
        }
      });

      this.$id('releasedBy').select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data: Object.values(releasedBy)
      });

      this.$id('releasedAt').select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data: Object.values(releasedAt)
      });
    },

    onDialogShown: function()
    {
      this.$id('orders').focus();
    },

    submit: function()
    {
      var view = this;

      viewport.msg.saving();

      view.$id('submit').prop('disabled', true);

      var data = {
        remove: {
          orders: view.$id('orders').val().split(/[^0-9]+/).filter(function(v) { return v.length === 9; }),
          releasedBy: view.$id('releasedBy').val() || null,
          releasedAt: view.$id('releasedAt').val() || null
        },
        comment: view.$id('comment').val().trim()
      };

      var req = view.ajax({
        method: 'POST',
        url: '/compRel/entries/' + view.model.id + ';release-order',
        data: JSON.stringify(data)
      });

      req.fail(function()
      {
        viewport.msg.savingFailed();

        view.$id('submit').prop('disabled', false);
      });

      req.done(function()
      {
        viewport.msg.saved();
        viewport.closeDialog();
      });
    }

  });
});
