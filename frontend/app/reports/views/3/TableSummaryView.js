// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/reports/templates/3/tableSummary',
  'datatables.net',
  'datatables-fixedcolumns'
], function(
  _,
  $,
  t,
  View,
  template
) {
  'use strict';

  function renderNumber(data, type)
  {
    if ((type === 'display' || type === 'filter') && typeof data.toLocaleString === 'function')
    {
      data = data.toLocaleString();
    }

    return data;
  }

  var DECIMAL_SEPARATOR = typeof Number.prototype.toLocaleString === 'function'
    ? (1.2).toLocaleString().substr(1, 1)
    : '.';

  function exportNumber(localeNumber)
  {
    var parts = localeNumber.split(DECIMAL_SEPARATOR);

    if (parts.length === 2)
    {
      return parts[0].replace(/[^0-9]+/g, '') + DECIMAL_SEPARATOR + parts[1].replace(/[^0-9]+/g, '');
    }

    return parts[0].replace(/[^0-9]+/g, '');
  }

  var COLUMNS = [
    {
      name: 'division',
      data: 'division',
      width: '45px'
    },
    {
      name: '_id',
      data: '_id',
      width: '100px',
      class: 'is-selectable is-prodLine',
      createdCell: function(cellEl, prodLineId)
      {
        cellEl.dataset.id = prodLineId;
      }
    },
    {
      name: 'inventoryNo',
      data: 'inventoryNo',
      width: '40px'
    },
    {
      name: 'totalAvailabilityH',
      data: 'totalAvailabilityH',
      width: '40px',
      render: renderNumber
    },
    {
      name: 'operationalAvailabilityH',
      data: 'operationalAvailabilityH',
      width: '40px',
      render: renderNumber
    },
    {
      name: 'operationalAvailabilityP',
      data: 'operationalAvailabilityP',
      width: '40px',
      render: renderNumber
    },
    {
      name: 'exploitationH',
      data: 'exploitationH',
      width: '40px',
      render: renderNumber
    },
    {
      name: 'exploitationP',
      data: 'exploitationP',
      width: '40px',
      render: renderNumber
    },
    {
      name: 'oee',
      data: 'oee',
      width: '25px',
      render: renderNumber
    },
    {
      name: 'adjustingDuration',
      data: 'adjustingDuration',
      width: '45px',
      render: renderNumber
    },
    {
      name: 'maintenanceDuration',
      data: 'maintenanceDuration',
      width: '50px',
      render: renderNumber
    },
    {
      name: 'renovationDuration',
      data: 'renovationDuration',
      width: '55px',
      render: renderNumber
    },
    {
      name: 'malfunctionDuration',
      data: 'malfunctionDuration',
      width: '55px',
      render: renderNumber
    },
    {
      name: 'malfunctionCount',
      data: 'malfunctionCount',
      width: '55px',
      render: renderNumber
    },
    {
      name: 'majorMalfunctionCount',
      data: 'majorMalfunctionCount',
      width: '50px',
      render: renderNumber
    },
    {
      name: 'mttr',
      data: 'mttr',
      width: '30px',
      render: renderNumber
    },
    {
      name: 'mtbf',
      data: 'mtbf',
      width: '30px',
      render: renderNumber
    }
  ];
  var COLUMN_NAME_TO_INDEX = {};
  var COLUMN_INDEX_TO_NAME = {};

  COLUMNS.forEach(function(column, i)
  {
    COLUMN_NAME_TO_INDEX[column.name] = i;
    COLUMN_INDEX_TO_NAME[i] = column.name;
  });

  return View.extend({

    template: template,

    events: {
      'mouseover tbody > tr': function(e)
      {
        var tbodyEl = e.currentTarget.parentNode.parentNode.classList.contains('DTFC_Cloned')
          ? this.el.querySelector('.dataTables_scroll tbody')
          : this.el.querySelector('.DTFC_Cloned tbody');

        this.hoveredRows.push(tbodyEl.childNodes[$(e.currentTarget).index()]);
        this.hoveredRows.push(e.currentTarget);

        for (var i = 0, l = this.hoveredRows.length; i < l; ++i)
        {
          this.hoveredRows[i].classList.add('is-hovered');
        }
      },
      'mouseout tbody > tr': function()
      {
        while (this.hoveredRows.length)
        {
          this.hoveredRows.shift().classList.remove('is-hovered');
        }
      },
      'click td.is-selectable': function(e)
      {
        e.currentTarget.classList.toggle('is-selected');

        this.model.query.toggleProdLineSelection(
          e.currentTarget.dataset.id,
          e.currentTarget.classList.contains('is-selected')
        );
      }
    },

    initialize: function()
    {
      this.hoveredRows = [];
      this.dataTable = null;
      this.fixedColumns = null;
      this.loading = 0;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:tableSummary', this.onTableSummaryChanged);
      this.listenTo(this.model.query, 'change:columns', this.onColumnVisibilityChanged);

      this.onResize = _.debounce(this.onResize.bind(this), 100);
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onKeyUp = this.onKeyUp.bind(this);

      $(window).resize(this.onResize);
      $(document.body)
        .keydown(this.onKeyDown)
        .keyup(this.onKeyUp);
    },

    destroy: function()
    {
      $(window).off('resize', this.onResize);
      $(document.body)
        .off('keydown', this.onKeyDown)
        .off('keyup', this.onKeyUp);

      if (this.dataTable)
      {
        this.dataTable.destroy();
      }

      this.fixedColumns = null;
    },

    afterRender: function()
    {
      var $table = this.$('table');

      this.dataTable = $table.dataTable({
        autoWidth: false,
        info: false,
        ordering: true,
        orderMulti: true,
        order: this.getOrder(),
        paging: false,
        processing: false,
        searching: false,
        scrollX: true,
        scrollY: this.calcScrollY(),
        scrollCollapse: false,
        columns: COLUMNS.map(function(column)
        {
          column.visible = this.model.query.isColumnVisible(column.name);

          return column;
        }, this),
        data: this.model.get('tableSummary'),
        language: {
          emptyTable: this.getEmptyTableMessage()
        }
      }).DataTable(); // eslint-disable-line new-cap

      this.fixedColumns = new $.fn.dataTable.FixedColumns(this.dataTable, {
        leftColumns: 2,
        heightMatch: 'none'
      });

      $table.on('draw.dt', this.onDraw.bind(this));
      $table.on('order.dt', this.onOrder.bind(this));

      this.onDraw();
    },

    getEmptyTableMessage: function()
    {
      var view = this;

      function getEmptyTableMessage()
      {
        if (view.loading === 1)
        {
          return t('core', 'dataTables:loadingRecords');
        }

        if (view.loading === -1)
        {
          return t('core', 'dataTables:loadingFailed');
        }

        return t('core', 'dataTables:emptyTable');
      }

      getEmptyTableMessage.toString = getEmptyTableMessage;

      return getEmptyTableMessage;
    },

    getOrder: function()
    {
      var sort = this.model.query.get('sort');
      var order = [];

      Object.keys(sort).forEach(function(property)
      {
        order.push([COLUMN_NAME_TO_INDEX[property], sort[property] === 1 ? 'asc' : 'desc']);
      });

      return order;
    },

    calcScrollY: function()
    {
      if (window.innerWidth <= 1328)
      {
        return 22 * 10;
      }

      return Math.max(window.innerHeight - this.el.offsetTop - 125, 590);
    },

    onResize: function()
    {
      if (this.dataTable)
      {
        var scrollY = this.calcScrollY();

        this.dataTable.settings()[0].oScroll.sY = scrollY;
        this.$('.dataTables_scrollBody').css('height', scrollY + 'px');
        this.dataTable.draw();
      }
    },

    onDraw: function()
    {
      var tbodyEl = this.el.querySelector('.DTFC_Cloned > tbody');

      this.model.query.getSelectedProdLines().forEach(function(prodLineId)
      {
        var cellEl = tbodyEl.querySelector('td.is-prodLine[data-id="' + prodLineId + '"]');

        if (cellEl)
        {
          cellEl.classList.add('is-selected');
        }
      });
    },

    onOrder: function()
    {
      var sort = {};

      this.dataTable.order().forEach(function(order)
      {
        sort[COLUMN_INDEX_TO_NAME[order[0]]] = order[1] === 'asc' ? 1 : -1;
      });

      this.model.query.set('sort', sort);
    },

    onTableSummaryChanged: function()
    {
      if (this.dataTable && this.loading !== 1)
      {
        this.dataTable.clear();
        this.dataTable.rows.add(this.model.get('tableSummary'));
        this.dataTable.draw();
      }
    },

    onColumnVisibilityChanged: function(columnName, visible)
    {
      this.dataTable.column(columnName + ':name').visible(visible);
    },

    onModelLoading: function()
    {
      this.loading = 1;

      if (this.dataTable)
      {
        this.dataTable.clear().draw();
      }
    },

    onModelLoaded: function()
    {
      this.loading = 0;

      if (this.dataTable)
      {
        this.dataTable.clear();
        this.dataTable.rows.add(this.model.get('tableSummary'));
        this.dataTable.draw();
      }
    },

    onModelError: function()
    {
      this.loading = -1;

      if (this.dataTable)
      {
        this.dataTable.clear();
        this.dataTable.draw();
      }
    },

    onKeyDown: function(e)
    {
      if (e.keyCode === 16)
      {
        this.el.classList.add('is-unselectable');
      }
    },

    onKeyUp: function(e)
    {
      if (e.keyCode === 16)
      {
        this.el.classList.remove('is-unselectable');
      }
    },

    serializeToCsv: function()
    {
      if (!this.dataTable)
      {
        return '';
      }

      var columnNames = [];

      this.dataTable.columns().header().each(function(th)
      {
        if (th.parentNode !== null)
        {
          columnNames.push('"' + th.textContent + '"');
        }
      });

      var csv = columnNames.join(';') + '\r\n';

      this.dataTable.rows().nodes().each(function(tr)
      {
        var row = [];

        for (var i = 0, l = tr.childElementCount; i < l; ++i)
        {
          var value = tr.children[i].textContent;

          if (i < 3)
          {
            value = '"' + value + '"';
          }
          else
          {
            value = exportNumber(value);
          }

          row.push(value);
        }

        csv += row.join(';') + '\r\n';
      });

      return csv;
    }

  });
});
