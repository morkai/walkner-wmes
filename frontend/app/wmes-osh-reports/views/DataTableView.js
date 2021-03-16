// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/View'
], function(
  $,
  View
) {
  'use strict';

  return View.extend({

    events: {
      'mouseenter tbody > tr': function(e)
      {
        const tbodyEl = e.currentTarget.parentNode.parentNode.classList.contains('DTFC_Cloned')
          ? this.el.querySelector('.dataTables_scroll tbody')
          : this.el.querySelector('.DTFC_Cloned tbody');

        if (!tbodyEl)
        {
          return;
        }

        this.hoveredRows.push(tbodyEl.children[$(e.currentTarget).index()]);
        this.hoveredRows.push(e.currentTarget);

        for (let i = 0, l = this.hoveredRows.length; i < l; ++i)
        {
          this.hoveredRows[i].classList.add('is-hovered');
        }
      },
      'mouseleave tbody > tr': function()
      {
        while (this.hoveredRows.length)
        {
          this.hoveredRows.shift().classList.remove('is-hovered');
        }
      }
    },

    initialize: function()
    {
      this.hoveredRows = [];
      this.dataTable = null;
      this.fixedColumns = null;

      this.once('afterRender', () =>
      {
        this.listenTo(this.model, `change:${this.dataProperty}`, this.render);
      });

      this.setUpTooltips();
      this.setUpDataTable();
    },

    getTemplateData: function()
    {
      return {
        months: this.model.get('months') || [],
        rows: this.serializeRows(),
        n: n => n >= 0 ? (Math.round(n * 100) / 100).toLocaleString() : ''
      };
    },

    setUpTooltips: function()
    {
      this.on('afterRender', () =>
      {
        this.$el.tooltip({
          container: document.body,
          selector: 'th[title]'
        });
      });

      this.on('beforeRender remove', () =>
      {
        this.$el.tooltip('destroy');
      });
    },

    setUpDataTable: function()
    {
      this.on('afterRender', () =>
      {
        const $table = this.$('table');

        if (!$table.length)
        {
          return;
        }

        this.dataTable = $table
          .dataTable(this.getDataTableOptions())
          .DataTable(); // eslint-disable-line new-cap

        this.fixedColumns = new $.fn.dataTable.FixedColumns(this.dataTable, {
          leftColumns: this.freezeColumns || 0,
          heightMatch: 'none'
        });
      });

      this.on('beforeRender remove', () =>
      {
        if (this.dataTable)
        {
          this.dataTable.destroy();
        }
      });
    },

    serializeRows: function()
    {
      return [];
    },

    getDataTableOptions: function()
    {
      return {
        autoWidth: false,
        info: false,
        ordering: false,
        orderMulti: false,
        paging: false,
        processing: false,
        searching: false,
        scrollX: true,
        scrollY: Math.min(555, Math.ceil(window.innerHeight * 0.7)),
        scrollCollapse: true,
        language: {
          emptyTable: this.getEmptyTableMessage()
        }
      };
    },

    getEmptyTableMessage: function()
    {
      const view = this;

      function getEmptyTableMessage()
      {
        if (view.model.currentReadRequest)
        {
          return view.t('core', 'dataTables:loadingRecords');
        }

        return view.t('core', 'dataTables:emptyTable');
      }

      getEmptyTableMessage.toString = getEmptyTableMessage;

      return getEmptyTableMessage;
    }

  });
});
