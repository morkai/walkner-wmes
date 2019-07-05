// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/viewport',
  'app/planning/util/contextMenu',
  './KanbanSearchDialogView'
], function(
  $,
  viewport,
  contextMenu,
  KanbanSearchDialogView
) {
  'use strict';

  return {

    ArrowUp: function(e, cell)
    {
      var view = this;

      if (cell.modelIndex === 0)
      {
        if (!cell.tr.parentNode)
        {
          view.$tbodyInner[0].scrollTop = 0;
        }

        return;
      }

      var prevTr = cell.tr.previousElementSibling;

      if (prevTr)
      {
        prevTr.cells[cell.td.cellIndex].focus();

        return;
      }

      view.afterRenderRows = function(modelIndex, cellIndex)
      {
        var row = view.$table.find('tr[data-model-index="' + modelIndex + '"]')[0];

        if (row && row.cells[cellIndex])
        {
          row.cells[cellIndex].focus();
        }
      }.bind(null, cell.modelIndex - 1, cell.td.cellIndex);

      if (cell.tr.parentNode)
      {
        view.$tbodyInner[0].scrollTop -= view.ROW_HEIGHT;
      }
      else
      {
        view.$tbodyInner[0].scrollTop = cell.modelIndex * view.ROW_HEIGHT - view.ROW_HEIGHT;
      }
    },
    ArrowDown: function(e, cell)
    {
      var view = this;
      var nextTr = cell.tr.nextElementSibling;

      if (cell.modelIndex === view.model.entries.filtered.length - 1)
      {
        if (!cell.tr.parentNode)
        {
          view.$tbodyInner[0].scrollTop = view.$tbodyInner[0].scrollHeight;
        }

        return;
      }

      if (cell.tr.parentNode && cell.tr.rowIndex < (cell.tr.parentNode.childElementCount - 1))
      {
        var endPos = nextTr.offsetTop + nextTr.offsetHeight;
        var visibleAreaHeight = view.$tbodyInner[0].offsetHeight - view.SCROLLBAR_HEIGHT;

        if (endPos <= visibleAreaHeight)
        {
          nextTr.cells[cell.td.cellIndex].focus();

          return;
        }
      }

      view.afterRenderRows = function(modelIndex, cellIndex)
      {
        var row = view.$table.find('tr[data-model-index="' + modelIndex + '"]')[0];

        if (row && row.cells[cellIndex])
        {
          row.cells[cellIndex].focus();
        }
      }.bind(null, cell.modelIndex + 1, cell.td.cellIndex);

      if (cell.tr.parentNode)
      {
        view.$tbodyInner[0].scrollTop += view.ROW_HEIGHT * (nextTr ? 1 : 2);
      }
      else
      {
        view.$tbodyInner[0].scrollTop = cell.modelIndex * view.ROW_HEIGHT + view.ROW_HEIGHT;
      }
    },
    ArrowRight: function(e, cell)
    {
      var nextTd = cell.td.nextElementSibling;

      if (cell.tr.parentNode)
      {
        if (nextTd.dataset.columnId !== 'filler2')
        {
          nextTd.focus();
        }

        return;
      }

      var view = this;

      view.afterRenderRows = function(modelIndex, cellIndex)
      {
        var tr = view.$table.find('tr[data-model-index="' + modelIndex + '"]')[0];

        if (!tr)
        {
          return;
        }

        var td = tr.cells[cellIndex];

        if (td.dataset.columnId === 'filler2')
        {
          td.previousElementSibling.focus();
        }
        else
        {
          td.focus();
        }
      }.bind(null, cell.modelIndex, cell.td.cellIndex + 1);

      view.$tbodyInner[0].scrollTop = cell.modelIndex * view.ROW_HEIGHT;
    },
    ArrowLeft: function(e, cell)
    {
      var prevTd = cell.td.previousElementSibling;

      if (cell.tr.parentNode)
      {
        if (prevTd)
        {
          prevTd.focus();
        }

        return;
      }

      var view = this;

      view.afterRenderRows = function(modelIndex, cellIndex)
      {
        var tr = view.$table.find('tr[data-model-index="' + modelIndex + '"]')[0];

        if (tr)
        {
          tr.cells[Math.max(0, cellIndex)].focus();
        }
      }.bind(null, cell.modelIndex, cell.td.cellIndex - 1);

      view.$tbodyInner[0].scrollTop = cell.modelIndex * view.ROW_HEIGHT;
    },
    Tab: function(e, cell)
    {
      var view = this;

      if (e.shiftKey)
      {
        return view.keyHandlers.ShiftTab.call(view, e, cell);
      }

      if (cell.td.nextElementSibling.tabIndex !== -1)
      {
        return cell.td.nextElementSibling.focus();
      }

      if (+cell.tr.dataset.modelIndex === (view.model.entries.filtered.length - 1))
      {
        view.lastKeyPressAt.Home = e.timeStamp;

        return view.keyHandlers.Home.call(view, e, cell);
      }

      cell.tr.firstElementChild.focus();

      view.keyHandlers.ArrowDown.call(view, e, view.focusedCell);
    },
    ShiftTab: function(e, cell)
    {
      var view = this;

      if (cell.tr.firstElementChild !== cell.td)
      {
        return cell.td.previousElementSibling.focus();
      }

      if (cell.tr.dataset.modelIndex === '0')
      {
        view.lastKeyPressAt.End = e.timeStamp;

        return view.keyHandlers.End.call(view, e, cell);
      }

      cell.tr.lastElementChild.previousElementSibling.focus();

      view.keyHandlers.ArrowUp.call(view, e, view.focusedCell);
    },
    PageUp: function(e, cell)
    {
      var view = this;
      var visibleAreaHeight = view.$tbodyOuter.outerHeight() - view.SCROLLBAR_HEIGHT;
      var visibleRowCount = Math.ceil(visibleAreaHeight / view.ROW_HEIGHT);
      var prevModelIndex = Math.max(0, cell.modelIndex - visibleRowCount);
      var $tr = view.$tbody.find('tr[data-model-index="' + prevModelIndex + '"]');

      if ($tr.length)
      {
        return $tr.find('td[data-column-id="' + cell.columnId + '"]').focus();
      }

      view.afterRenderRows = function()
      {
        var rows = view.$tbody[0].rows;
        var row = rows[cell.rowIndex] || rows[0];

        row.cells[cell.td.cellIndex].focus();
      };

      view.$tbodyInner[0].scrollTop -= visibleRowCount * view.ROW_HEIGHT;
    },
    PageDown: function(e, cell)
    {
      var view = this;
      var visibleAreaHeight = view.$tbodyOuter.outerHeight() - view.SCROLLBAR_HEIGHT;
      var visibleRowCount = Math.ceil(visibleAreaHeight / view.ROW_HEIGHT);
      var nextModelIndex = Math.min(view.model.entries.filtered.length - 1, cell.modelIndex + visibleRowCount);
      var $tr = view.$tbody.find('tr[data-model-index="' + nextModelIndex + '"]');

      if ($tr.length)
      {
        return $tr.find('td[data-column-id="' + cell.columnId + '"]').focus();
      }

      view.afterRenderRows = function()
      {
        var rows = view.$tbody[0].rows;
        var row = rows[cell.rowIndex] || rows[rows.length - 1];

        row.cells[cell.td.cellIndex].focus();
      };

      view.$tbodyInner[0].scrollTop += visibleRowCount * view.ROW_HEIGHT;
    },
    Home: function(e, cell)
    {
      var view = this;

      if (e.timeStamp - view.lastKeyPressAt.Home < 500)
      {
        if (view.$tbody[0].firstElementChild.dataset.modelIndex === '0')
        {
          view.$tbody[0].firstElementChild.firstElementChild.focus();

          return;
        }

        view.afterRenderRows = function()
        {
          view.$tbody[0].firstElementChild.firstElementChild.focus();
        };

        view.$tbodyInner[0].scrollTop = 0;
      }
      else
      {
        cell.tr.firstElementChild.focus();
      }
    },
    End: function(e, cell)
    {
      var view = this;

      if (e.timeStamp - view.lastKeyPressAt.End < 500)
      {
        if (+view.$tbody[0].lastElementChild.dataset.modelIndex === (view.model.entries.filtered.length - 1))
        {
          view.$tbody[0].lastElementChild.lastElementChild.previousElementSibling.focus();

          return;
        }

        view.afterRenderRows = function()
        {
          view.$tbody[0].lastElementChild.lastElementChild.previousElementSibling.focus();
        };

        view.$tbodyInner[0].scrollTop = view.$tbodyInner[0].scrollHeight;
      }
      else
      {
        cell.tr.lastElementChild.previousElementSibling.focus();
      }
    },
    Escape: function()
    {
      contextMenu.hide(this);
    },
    ' ': function()
    {

    },
    Enter: function(e, cell)
    {
      if (e.altKey)
      {
        this.showCellMenu(cell);
      }

      if (!e.altKey && cell.td.classList.contains('kanban-is-editable'))
      {
        this.showCellEditor(cell);
      }
    },
    C: function(e, cell)
    {
      if (!e.ctrlKey || window.getSelection().toString() !== '')
      {
        return;
      }

      var view = this;

      if (e.timeStamp - view.lastKeyPressAt.CtrlA < 1000)
      {
        view.handleCopyTable();
      }
      else if (e.timeStamp - view.lastKeyPressAt.C < 500)
      {
        view.handleCopyRow(cell.modelId);
      }
      else
      {
        view.handleCopyCell(cell.modelId, cell.columnId, cell.arrayIndex);
      }
    },
    S: function(e)
    {
      if (e.ctrlKey)
      {
        this.handleExportTable();
      }
    },
    A: function(e)
    {
      if (e.ctrlKey)
      {
        this.lastKeyPressAt.CtrlA = e.timeStamp;
      }
    },
    F: function(e)
    {
      if (!e.ctrlKey || viewport.currentDialog)
      {
        return;
      }

      var view = this;
      var searchDialog = new KanbanSearchDialogView({model: view.model});

      view.listenToOnce(searchDialog, 'found', view.find.bind(view));

      viewport.showDialog(searchDialog);

      $('.viewport-dialog').removeClass('fade');

      view.broker.subscribe('viewport.dialog.hidden').setLimit(1).on('message', function()
      {
        view.editing = null;

        $('.viewport-dialog').addClass('fade');
      });

      view.editing = view.focusedCell;

      return false;
    }

  };
});
