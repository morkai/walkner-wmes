// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/core/views/ListView',
  'app/core/util/html2pdf',
  'app/printers/views/PrinterPickerView',
  '../dictionaries',
  'app/qiResults/templates/correctiveActionsTable'
], function(
  _,
  $,
  t,
  time,
  ListView,
  html2pdf,
  PrinterPickerView,
  qiDictionaries,
  renderCorrectiveActionsTable
) {
  'use strict';

  return ListView.extend({

    className: 'qiResults-list is-clickable is-colored',

    events: _.assign({

      'click .action-print': function(e)
      {
        var view = this;
        var model = view.collection.get(this.$(e.target).closest('tr').attr('data-id'));

        e.listAction = {
          view: view,
          tag: 'qi'
        };

        PrinterPickerView.listAction(e, function(printer)
        {
          view.ajax({url: model.url() + '.html', dataType: 'html'}).done(function(html)
          {
            html2pdf(html, {orientation: 'landscape'}, printer);
          });
        });

        return false;
      },

      'click .is-filter': function(e)
      {
        this.trigger('showFilter', e.currentTarget.dataset.columnId);
      }

    }, ListView.prototype.events),

    destroy: function()
    {
      this.$el.popover('destroy');
    },

    serializeColumns: function()
    {
      var hasAnyNokResult = this.collection.hasAnyNokResult();
      var columns = [
        {id: 'rid', tdClassName: 'is-min is-number', thClassName: 'is-filter'},
        {id: 'orderNo', tdClassName: 'is-min is-number', thClassName: 'is-filter'},
        {id: 'nc12', tdClassName: 'is-min text-mono', thClassName: 'is-filter'},
        {id: 'productFamily', tdClassName: 'is-overflow w75', thClassName: 'is-filter'},
        {id: 'productName', tdClassName: 'is-overflow w300'},
        {id: 'division', tdClassName: 'is-min', thClassName: 'is-filter'},
        {id: 'line', tdClassName: 'is-min', thClassName: 'is-filter'},
        {id: 'kind', tdClassName: 'is-overflow w200', thClassName: 'is-filter'},
        {id: 'inspectedAt', tdClassName: 'is-min', thClassName: 'is-filter'},
        {id: 'inspectorLeader', tdClassName: 'is-overflow w175', thClassName: 'is-filter'}
      ];

      if (hasAnyNokResult)
      {
        columns.push(
          {id: 'nokOwner', tdClassName: 'is-overflow w175', thClassName: 'is-filter'}
        );
      }

      columns.push(
        {id: 'qtyOrder', tdClassName: 'is-min is-number'},
        {id: 'qtyInspected', tdClassName: 'is-min is-number'}
      );

      if (hasAnyNokResult)
      {
        columns.push(
          {id: 'qtyNokInspected', tdClassName: 'is-min is-number'},
          {id: 'qtyToFix', tdClassName: 'is-min is-number'},
          {id: 'qtyNok', tdClassName: 'is-min is-number'},
          {id: 'errorCategory', tdClassName: 'is-min', thClassName: 'is-filter'},
          {id: 'faultCode', tdClassName: 'is-min has-popover', thClassName: 'is-filter'},
          {
            id: 'correctiveAction',
            label: this.t('PROPERTY:correctiveActions'),
            noData: '',
            thClassName: 'is-filter',
            tdClassName: 'is-overflow w250 has-popover'
          }
        );
      }

      columns.push('-');

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
      var view = this;

      return function(row)
      {
        var model = view.collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model)];
        var pdfUrl = model.url() + '.pdf';

        actions.push({
          id: 'print',
          icon: 'print',
          label: view.t('PAGE_ACTION:print'),
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
      var view = this;

      ListView.prototype.afterRender.apply(view, arguments);

      view.$el.popover({
        selector: '.has-popover',
        container: this.el,
        trigger: 'hover',
        placement: 'auto left',
        html: true,
        className: function(popover)
        {
          var className = ['qiResults-list-popover'];

          if (popover.$element[0].dataset.id === 'correctiveAction')
          {
            className.push('is-correctiveAction');
          }

          return className.join(' ');
        },
        title: function() { return ''; },
        content: function()
        {
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
              return view.renderPartialHtml(renderCorrectiveActionsTable, {
                bordered: false,
                correctiveActions: model.serializeCorrectiveActions(qiDictionaries)
              });
            }
          }

          return undefined;
        }
      });
    }

  });
});
