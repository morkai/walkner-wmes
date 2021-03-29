// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/prodSerialNumbers/ProdSerialNumberCollection',
  '../snManager',
  './SnListView',
  'app/production/templates/snChecker'
], function(
  $,
  t,
  viewport,
  View,
  ProdSerialNumberCollection,
  snManager,
  SnListView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'production-modal production-snChecker-modal',

    localTopics: {
      'production.taktTime.snScanned': function(scanInfo)
      {
        this.$id('orderNo').val(scanInfo.orderNo || '');
        this.$id('serialNo').val(scanInfo.serialNo || '');
        this.$id('submit').click();
      }
    },

    events: {
      'click #-list': function()
      {
        viewport.closeDialog();

        var snListView = new SnListView({
          collection: new ProdSerialNumberCollection(null, {
            rqlQuery: 'sort(-scannedAt)&limit(15)&prodLine=string:' + (this.model.get('prodLine') || '')
          })
        });

        viewport.showDialog(snListView, t('production', 'taktTime:list:title'));
      },
      'submit': function()
      {
        var $message = this.$id('message')
          .removeClass('message-info message-error message-success')
          .addClass('message-warning')
          .html(t('production', 'taktTime:check:checking'));

        var orderNo = parseInt(this.$id('orderNo').val(), 10);
        var serialNo = parseInt(this.$id('serialNo').val(), 10);
        var itemNo = serialNo.toString();

        while (itemNo.length < 4)
        {
          itemNo = '0' + itemNo;
        }

        var sn1 = 'PL04.' + orderNo + '.' + itemNo;
        var sn2 = orderNo + itemNo;

        while (sn2.length < 17)
        {
          sn2 = '0' + sn2;
        }

        sn2 = 'P' + sn2;

        if (snManager.contains(sn1) || snManager.contains(sn2))
        {
          $message
            .removeClass('message-warning')
            .addClass('message-info')
            .html(t('production', 'taktTime:check:local'));

          return false;
        }

        var req = this.ajax({
          url: '/prodSerialNumbers?orderNo=' + orderNo + '&serialNo=' + serialNo + '&limit(1)'
        });
        var prodLine = this.model.get('prodLine') || null;

        req.fail(function()
        {
          $message
            .removeClass('message-warning')
            .addClass('message-danger')
            .html(t('production', 'taktTime:check:error'));
        });

        req.done(function(res)
        {
          $message.removeClass('message-warning');

          var sn = (res.collection || [])[0];

          if (sn)
          {
            $message
              .addClass('message-info')
              .html(t('production', 'taktTime:check:' + (sn.prodLine === prodLine ? 'local' : 'remote'), {
                prodLine: sn.prodLine
              }));
          }
          else
          {
            $message
              .addClass('message-success')
              .html(t('production', 'taktTime:check:notFound'));
          }
        });

        return false;
      }
    },

    getTemplateData: function()
    {
      return {
        orderNo: this.model.prodShiftOrder.get('orderId') || ''
      };
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);

      this.$id('orderNo').focus();
    },

    closeDialog: function() {}

  });
});
