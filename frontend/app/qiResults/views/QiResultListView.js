// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/views/ListView',
  '../dictionaries'
], function(
  _,
  t,
  ListView,
  qiDictionaries
) {
  'use strict';

  return ListView.extend({

    className: 'qiResults-list is-clickable is-colored',

    serializeColumns: function()
    {
      var columns = [
        {id: 'rid', tdClassName: 'is-min is-number'},
        {id: 'orderNo', tdClassName: 'is-min is-number'},
        {id: 'nc12', tdClassName: 'is-min is-number'},
        {id: 'productFamily', tdClassName: 'is-min'},
        'productName',
        {id: 'division', tdClassName: 'is-min', label: t('qiResults', 'LIST:COLUMN:division')},
        'kind',
        {id: 'inspectedAt', tdClassName: 'is-min'},
        'inspector',
        {id: 'qtyInspected', tdClassName: 'is-min is-number', label: t('qiResults', 'LIST:COLUMN:qtyInspected')}
      ];

      if (this.collection.hasAnyNokResult())
      {
        columns.push(
          {id: 'qtyToFix', tdClassName: 'is-min is-number', label: t('qiResults', 'LIST:COLUMN:qtyToFix')},
          {id: 'qtyNok', tdClassName: 'is-min is-number', label: t('qiResults', 'LIST:COLUMN:qtyNok')},
          {id: 'errorCategory', tdClassName: 'is-min'},
          {id: 'faultCode', tdClassName: 'is-min'}
        );
      }

      return columns;
    },

    serializeRow: function(result)
    {
      return result.serializeRow(qiDictionaries, {});
    },

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model)];

        actions.push({
          id: 'print',
          icon: 'print',
          label: t(model.getNlsDomain(), 'PAGE_ACTION:print'),
          href: model.genClientUrl('print'),
          className: model.get('ok') ? 'disabled' : ''
        });

        if (model.canEdit())
        {
          actions.push(ListView.actions.edit(model));
        }

        if (model.canDelete())
        {
          actions.push(ListView.actions.delete(model));
        }

        return actions;
      };
    },

    afterRender: function()
    {
      ListView.prototype.afterRender.call(this);

      var view = this;

      this.$el.popover({
        selector: '.list-item > td',
        container: this.el,
        trigger: 'hover',
        placement: 'auto left',
        html: true,
        content: function()
        {
          var model = view.collection.get(this.parentNode.dataset.id);

          if (this.dataset.id === 'faultCode')
          {
            return model.get('faultDescription');
          }

          return undefined;
        }
      });
    }

  });
});
