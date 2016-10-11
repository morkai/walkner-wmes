// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/views/ListView',
  '../dictionaries',
  'app/qiResults/templates/correctiveActionsTable'
], function(
  _,
  t,
  time,
  ListView,
  qiDictionaries,
  renderCorrectiveActionsTable
) {
  'use strict';

  return ListView.extend({

    className: 'qiResults-list is-clickable is-colored',

    events: _.extend({

      'click .action-print': function(e)
      {
        if (e.button !== 0)
        {
          return;
        }

        var url = e.currentTarget.href;
        var win = window.open(url);

        if (win)
        {
          win.onload = win.print.bind(win);

          return false;
        }

        window.location.href = url;
      }

    }, ListView.prototype.events),

    destroy: function()
    {
      this.$el.popover('destroy');
    },

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
          {id: 'faultCode', tdClassName: 'is-min'},
          {id: 'correctiveAction', label: t('qiResults', 'PROPERTY:correctiveActions'), noData: ''}
        );
      }

      return columns;
    },

    serializeRows: function()
    {
      var options = {
        dateFormat: 'L',
        today: time.getMoment().startOf('day').hours(6).valueOf()
      };

      return this.collection.map(function(result)
      {
        return result.serializeRow(qiDictionaries, options);
      });
    },

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model)];
        var pdfUrl = model.url() + '.pdf';

        actions.push({
          id: 'print',
          icon: 'print',
          label: t(model.getNlsDomain(), 'PAGE_ACTION:print'),
          href: pdfUrl,
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
          var $tip = view.$el.data('bs.popover').tip().removeClass('is-correctiveAction');
          var model = view.collection.get(this.parentNode.dataset.id);

          if (this.dataset.id === 'faultCode')
          {
            return model.get('faultDescription');
          }

          if (this.dataset.id === 'correctiveAction')
          {
            var correctiveActions = model.get('correctiveActions');

            if (correctiveActions && correctiveActions.length)
            {
              $tip.addClass('is-correctiveAction');

              return renderCorrectiveActionsTable({
                bordered: false,
                correctiveActions: model.serializeCorrectiveActions(qiDictionaries)
              });
            }
          }

          return undefined;
        }
      }).on('shown.bs.popover', function(e)
      {
        view.$el.find('.popover').toggleClass('is-correctiveAction', e.target.dataset.id === 'correctiveAction');
      });
    }

  });
});
