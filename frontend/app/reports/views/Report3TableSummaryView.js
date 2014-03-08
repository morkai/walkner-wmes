define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/reports/templates/report3TableSummary',
  'datatables',
  'datatables-fixedcolumns'
], function(
  _,
  $,
  t,
  View,
  report3TableSummaryTemplate
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

  var COLUMNS = [
    {
      name: 'division',
      data: 'division',
      width: 45
    },
    {
      name: '_id',
      data: '_id',
      width: 100,
      class: 'is-selectable is-prodLine',
      createdCell: function(cellEl, prodLineId)
      {
        cellEl.dataset.id = prodLineId;
      }
    },
    {
      name: 'inventoryNo',
      data: 'inventoryNo',
      width: 40
    },
    {
      name: 'totalAvailabilityH',
      data: 'totalAvailabilityH',
      width: 40,
      render: renderNumber
    },
    {
      name: 'operationalAvailabilityH',
      data: 'operationalAvailabilityH',
      width: 40,
      render: renderNumber
    },
    {
      name: 'operationalAvailabilityP',
      data: 'operationalAvailabilityP',
      width: 40,
      render: renderNumber
    },
    {
      name: 'exploitationH',
      data: 'exploitationH',
      width: 40,
      render: renderNumber
    },
    {
      name: 'exploitationP',
      data: 'exploitationP',
      width: 40,
      render: renderNumber
    },
    {
      name: 'oee',
      data: 'oee',
      width: 25,
      render: renderNumber
    },
    {
      name: 'adjustingDuration',
      data: 'adjustingDuration',
      width: 45,
      render: renderNumber
    },
    {
      name: 'maintenanceDuration',
      data: 'maintenanceDuration',
      width: 50,
      render: renderNumber
    },
    {
      name: 'renovationDuration',
      data: 'renovationDuration',
      width: 55,
      render: renderNumber
    },
    {
      name: 'malfunctionDuration',
      data: 'malfunctionDuration',
      width: 55,
      render: renderNumber
    },
    {
      name: 'malfunctionCount',
      data: 'malfunctionCount',
      width: 55,
      render: renderNumber
    },
    {
      name: 'majorMalfunctionCount',
      data: 'majorMalfunctionCount',
      width: 50,
      render: renderNumber
    },
    {
      name: 'mttr',
      data: 'mttr',
      width: 30,
      render: renderNumber
    },
    {
      name: 'mtbf',
      data: 'mtbf',
      width: 30,
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

    template: report3TableSummaryTemplate,

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
      this.columnIndexToNameMap = {};
      this.columnNameToIndexMap = {};
      this.hoveredRows = [];
      this.dataTable = null;
      this.fixedColumns = null;
      this.tableTools = null;
      this.loading = 0;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:tableSummary', this.onTableSummaryChanged);

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
      this.tableTools = null;
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
        columns: COLUMNS,
        data: this.model.get('tableSummary'),
        language: {
          emptyTable: this.getEmptyTableMessage()
        }
      }).DataTable();

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
      if (this.dataTable)
      {
        this.dataTable.clear();
        this.dataTable.rows.add(this.model.get('tableSummary'));
        this.dataTable.draw();
      }
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
        this.dataTable.rows.add(this.model.get('tableSummary'));
        this.dataTable.draw();
      }
    },

    onModelError: function()
    {
      this.loading = -1;

      if (this.dataTable)
      {
        this.$('dataTables_scrollBody. .dataTables_empty').text(
          t('core', 'dataTables:loadingFailed')
        );
      }
    },

    onKeyDown: function(e)
    {
      if (e.keyCode === 16)
      {
        this.el.classList.add('unselectable');
      }
    },

    onKeyUp: function(e)
    {
      if (e.keyCode === 16)
      {
        this.el.classList.remove('unselectable');
      }
    }

  });
});
