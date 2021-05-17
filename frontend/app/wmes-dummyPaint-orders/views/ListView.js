// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/viewport',
  'app/core/views/ListView',
  'app/core/util/resultTips',
  'app/wmes-dummyPaint-paints/DpPaint',
  'app/wmes-dummyPaint-paints/views/FormView',
  'i18n!app/nls/wmes-dummyPaint-paints'
], function(
  $,
  viewport,
  ListView,
  resultTips,
  DpPaint,
  DpPaintFormView
) {
  'use strict';

  return ListView.extend({

    className: 'is-colored',

    remoteTopics: {
      'dummyPaint.orders.updated': 'refreshCollection'
    },

    events: Object.assign({

      'click a[data-action="addPaint"]': function(e)
      {
        const $a = this.$(e.currentTarget);

        if ($a.hasClass('disabled'))
        {
          return;
        }

        viewport.msg.loading();

        $a.addClass('disabled');

        const dpOrder = this.collection.get($a.closest('tr')[0].dataset.id);
        const family = dpOrder.get('paintFamily');
        const code = dpOrder.get('paintCode');

        const req1 = this.ajax({
          url: `/dummyPaint/paints?family=${family}&code=${code}`
        });
        const req2 = this.ajax({
          url: `/dummyPaint/paints?code=${code}&limit(1)`
        });
        const req = $.when(req1, req2);

        req.fail(() =>
        {
          viewport.msg.loadingFailed();
        });

        req.done((res1, res2) =>
        {
          viewport.msg.loaded();

          if (res1[0].totalCount === 1)
          {
            resultTips.show({
              e,
              type: 'info',
              time: 1337,
              text: this.t('addPaint:exists')
            });

            this.removeAddPaintActions(family, code);

            return;
          }

          this.showAddPaintDialog(dpOrder, res2[0].totalCount ? res2[0].collection[0] : null);
        });

        req.always(() => $a.removeClass('disabled'));
      }

    }, ListView.prototype.events),

    serializeColumns: function()
    {
      return [
        {id: 'dummyFamily', className: 'is-min'},
        {id: '_id', className: 'is-min'},
        {id: 'nc12', className: 'is-min'},
        {id: 'name', className: 'is-min'},
        {id: 'leadingNo', className: 'is-min'},
        {id: 'leadingNc12', className: 'is-min'},
        {id: 'leadingName', className: 'is-min'},
        {id: 'salesNo', className: 'is-min'},
        {id: 'paintSource', className: 'is-min'},
        {id: 'productFamily', className: 'is-min'},
        {id: 'paintFamily', className: 'is-min'},
        {id: 'paintCategory', className: 'is-min'},
        {id: 'paintCode', className: 'is-min'},
        {id: 'dummyNc12', className: 'is-min'},
        {id: 'paintNc12', className: 'is-min'},
        {id: 'paintName', className: 'is-min'},
        {id: 'changed', className: 'is-min'},
        {id: 'error', className: 'is-min'},
        {id: 'createdAt', className: 'is-min'},
        {id: 'stage', className: 'is-min'},
        {id: 'job', className: 'is-min'},
        '-'
      ];
    },

    serializeActions: function()
    {
      return null;
    },

    showAddPaintDialog: function(dpOrder, sourcePaint)
    {
      const targetPaint = new DpPaint({
        family: dpOrder.get('paintFamily'),
        code: dpOrder.get('paintCode'),
        nc12: sourcePaint ? sourcePaint.nc12 : '',
        name: sourcePaint ? sourcePaint.name : ''
      });
      const dialogView = new DpPaintFormView({
        dialogClassName: 'dp-paints-form-dialog',
        editMode: false,
        model: targetPaint,
        formMethod: 'POST',
        formAction: targetPaint.url(),
        formActionText: this.t('addPaint:submit'),
        failureText: this.t('core', 'FORM:ERROR:addFailure'),
        panelTitleText: this.t('addPaint:title'),
        onDialogShown: () => dialogView.$id('nc12').focus(),
        handleSuccess: () =>
        {
          viewport.closeDialog();

          viewport.msg.show({
            type: 'success',
            time: 2000,
            text: this.t('addPaint:success')
          })

          this.removeAddPaintActions(targetPaint.get('family'), targetPaint.get('code'));
        }
      });

      viewport.showDialog(dialogView, this.t('addPaint:title'));
    },

    removeAddPaintActions: function(family, code)
    {
      this.$('a[data-action="addPaint"]').each((i, aEl) =>
      {
        const $a = this.$(aEl);
        const dpOrder = this.collection.get($a.closest('tr')[0].dataset.id);

        if (dpOrder.get('paintFamily') === family && dpOrder.get('paintCode') === code)
        {
          $a.remove();
        }
      });
    }

  });
});
