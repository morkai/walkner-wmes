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

  t = t.forDomain('qiResults');

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
        {id: 'nc12', tdClassName: 'is-min is-number', thClassName: 'is-filter'},
        {id: 'productFamily', tdClassName: 'is-min', thClassName: 'is-filter'},
        'productName',
        {id: 'division', tdClassName: 'is-min', thClassName: 'is-filter', label: t('LIST:COLUMN:division')},
        {id: 'line', tdClassName: 'is-min', thClassName: 'is-filter'},
        {id: 'kind', thClassName: 'is-filter'},
        {id: 'inspectedAt', tdClassName: 'is-min', thClassName: 'is-filter'},
        {id: 'inspector', thClassName: 'is-filter'}
      ];

      if (hasAnyNokResult)
      {
        columns.push(
          {id: 'nokOwner', thClassName: 'is-filter', label: t('LIST:COLUMN:nokOwner')}
        );
      }

      columns.push(
        {id: 'qtyOrder', tdClassName: 'is-min is-number', label: t('LIST:COLUMN:qtyOrder')},
        {id: 'qtyInspected', tdClassName: 'is-min is-number', label: t('LIST:COLUMN:qtyInspected')}
      );

      if (hasAnyNokResult)
      {
        columns.push(
          {id: 'qtyNokInspected', tdClassName: 'is-min is-number', label: t('LIST:COLUMN:qtyNokInspected')},
          {id: 'qtyToFix', tdClassName: 'is-min is-number', label: t('LIST:COLUMN:qtyToFix')},
          {id: 'qtyNok', tdClassName: 'is-min is-number', label: t('LIST:COLUMN:qtyNok')},
          {id: 'errorCategory', tdClassName: 'is-min', thClassName: 'is-filter'},
          {id: 'faultCode', tdClassName: 'is-min', thClassName: 'is-filter'},
          {id: 'correctiveAction', label: t('PROPERTY:correctiveActions'), noData: '', thClassName: 'is-filter'}
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

              return view.renderPartialHtml(renderCorrectiveActionsTable, {
                bordered: false,
                correctiveActions: model.serializeCorrectiveActions(qiDictionaries)
              });
            }
          }

          return undefined;
        },
        template: function()
        {
          return $($.fn.popover.Constructor.DEFAULTS.template)
            .addClass('qiResults-list-popover')
            .toggleClass('is-correctiveAction', this.dataset.id === 'correctiveAction');
        }
      });
    }

  });
});
