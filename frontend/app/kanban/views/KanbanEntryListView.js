// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/data/clipboard',
  'app/planning/util/contextMenu',
  'app/kanban/templates/entryList',
  'app/kanban/templates/entryListColumns',
  'app/kanban/templates/entryListRow',
  'app/kanban/templates/inputEditor',
  'app/kanban/templates/filters/numeric',
  'app/kanban/templates/filters/text',
  'app/kanban/templates/filters/select'
], function(
  _,
  $,
  viewport,
  View,
  idAndLabel,
  clipboard,
  contextMenu,
  template,
  columnsTemplate,
  rowTemplate,
  inputEditorTemplate,
  numericFilterTemplate,
  textFilterTemplate,
  selectFilterTemplate
) {
  'use strict';

  var ROW_HEIGHT = 25;
  var SCROLLBAR_HEIGHT = 17;

  return View.extend({

    template: template,

    events: {
      'contextmenu': function()
      {
        return false;
      },
      'mousedown': function(e)
      {
        if (e.which !== 1)
        {
          return false;
        }
      },
      'dblclick .kanban-td': function()
      {
        return false;
      },
      'focus .kanban-td': function(e)
      {
        var newCell = this.idCell(e);

        console.log(
          'focus',
          'model=', newCell.model ? newCell.model.id : null,
          'column=', newCell.columnId,
          'value=', newCell.value
        );

        if (newCell.value === undefined)
        {
          return;
        }

        this.$tbody.find('.kanban-is-selected').removeClass('kanban-is-selected');
        this.$tbody.find('.kanban-is-focused').removeClass('kanban-is-focused');

        newCell.td.classList.add('kanban-is-focused');
        newCell.tr.classList.add('kanban-is-selected');

        var oldCell = this.focusedCell;

        if (oldCell
          && oldCell.modelId === newCell.modelId
          && oldCell.columnId === newCell.columnId
          && oldCell.arrayIndex === newCell.arrayIndex)
        {
          newCell.clicks = oldCell.clicks;
        }

        this.focusedCell = newCell;
      },
      'click .kanban-is-editable': function(e)
      {
        if (!this.focusedCell || this.focusedCell.td !== e.currentTarget)
        {
          this.focusedCell = this.idCell(e);
        }

        this.focusedCell.clicks += 1;

        if (this.focusedCell.clicks > 1)
        {
          this.showCellEditor(this.idCell(e));
        }
      },
      'click .kanban-is-with-menu': function(e)
      {
        this.showColumnMenu(this.idCell(e), e.pageY, e.pageX);
      }
    },

    initialize: function()
    {
      this.editing = null;
      this.focusedCell = null;
      this.prevFocusedCell = null;
      this.lastKeyPressAt = {};

      this.listenTo(this.model.tableView, 'change:filter change:order', this.onSortableChange);
      this.listenTo(this.model.tableView, 'change:visibility', this.onVisibilityChange);
      this.listenTo(this.model.entries, 'filter', this.onFilter);
      this.listenTo(this.model.entries, 'sort', this.onSort);
      this.listenTo(this.model.entries, 'change', this.onEntryChange);

      $(window)
        .on('resize.' + this.idPrefix, _.debounce(this.resize.bind(this), 8))
        .on('keydown.' + this.idPrefix, this.onWindowKeyDown.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    getTemplateData: function()
    {
      return {
        height: this.calcHeight()
      };
    },

    afterRender: function()
    {
      console.log('afterRender');

      var view = this;

      view.$theadInner = view.$('.kanban-thead-innerContainer').on('scroll', view.onTheadScroll.bind(view));
      view.$tbodyInner = view.$('.kanban-tbody-innerContainer').on('scroll', view.onTbodyScroll.bind(view));
      view.$tbodyOuter = view.$('.kanban-tbody-outerContainer');
      view.$scroller = view.$('.kanban-tbody-scroller');
      view.$thead = view.$('.kanban-thead-table');
      view.$table = view.$('.kanban-tbody-table');
      view.$tbody = view.$('.kanban-tbody-tbody');

      view.oldScrollTop = 0;
      view.rowCache = null;
      view.afterRenderRows = null;
      view.editing = null;

      view.renderColumns();
      view.renderRows();
    },

    renderColumns: function()
    {
      if (!this.$thead)
      {
        return;
      }

      this.columns = this.model.tableView.serializeColumns();

      this.$thead.html(columnsTemplate({
        idPrefix: this.idPrefix,
        columns: this.columns
      }));
    },

    renderRow: function(entry, modelIndex)
    {
      var view = this;

      if (!view.rowCache[entry.id])
      {
        view.rowCache[entry.id] = $.parseHTML(rowTemplate({
          idPrefix: view.idPrefix,
          modelIndex: modelIndex,
          columns: view.columns,
          entry: entry.serialize(view.model)
        }))[0];
      }

      return view.rowCache[entry.id];
    },

    renderRows: function(newPosition, newIndex)
    {
      console.log('renderRows: start');
      console.time('renderRows');

      var view = this;

      if (!view.$tbody)
      {
        console.timeEnd('renderRows');

        return;
      }

      if (typeof newPosition !== 'number')
      {
        newPosition = -1;
      }

      if (typeof newIndex !== 'number')
      {
        newIndex = -1;
      }

      var entries = view.model.entries.filtered;
      var tbody = view.$tbody[0];
      var visibleAreaHeight = view.$tbodyOuter.outerHeight() - SCROLLBAR_HEIGHT;
      var visibleRowCount = Math.ceil(visibleAreaHeight / ROW_HEIGHT);
      var rowCount = view.model.entries.filtered.length;
      var totalHeight = ROW_HEIGHT * (rowCount + 1);
      var scrollTop = view.$tbodyInner[0].scrollTop;

      if (newIndex >= 0)
      {
        newPosition = newIndex * ROW_HEIGHT;

        if (newPosition >= scrollTop
          && newPosition < (scrollTop + visibleAreaHeight - ROW_HEIGHT * 2))
        {
          newPosition = -1;
        }
        else if ((newIndex + visibleRowCount) * ROW_HEIGHT >= totalHeight)
        {
          newPosition = totalHeight - visibleRowCount * ROW_HEIGHT;
        }
      }

      if (newPosition >= 0)
      {
        scrollTop = newPosition;
      }

      var startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT));
      var endIndex = startIndex + visibleRowCount;
      var lastIndex = endIndex - 1;
      var currentStartIndex = -1;
      var currentLastIndex = -1;

      if (tbody.childElementCount)
      {
        currentStartIndex = +tbody.firstElementChild.dataset.modelIndex;
        currentLastIndex = +tbody.lastElementChild.dataset.modelIndex;
      }

      var optimize = null;

      if (view.rowCache === null)
      {
        view.rowCache = {};
      }
      else if (startIndex > currentStartIndex && lastIndex > currentLastIndex && startIndex < (currentLastIndex - 5))
      {
        optimize = 'down';
      }
      else if (startIndex < currentStartIndex && lastIndex < currentLastIndex && lastIndex > (currentStartIndex + 5))
      {
        optimize = 'up';
      }
      else if (startIndex === currentStartIndex && lastIndex === currentLastIndex)
      {
        optimize = 'same';
      }

      view.$table.css('top', scrollTop + 'px');
      view.$scroller.css('height', totalHeight + 'px');

      if (newPosition >= 0)
      {
        view.$tbodyInner[0].scrollTop = scrollTop;
      }

      console.log('optimize=', optimize, 'scrollTop=', scrollTop);

      if (optimize === 'same')
      {
        return view.finalizeRenderRows();
      }

      var fragment = document.createDocumentFragment();
      var addCount, removeCount, addI, removeI, modelIndex, entry; // eslint-disable-line one-var

      if (optimize === 'down')
      {
        removeCount = startIndex - currentStartIndex;
        addCount = lastIndex - currentLastIndex;

        for (addI = 1; addI <= addCount; ++addI)
        {
          modelIndex = currentLastIndex + addI;
          entry = entries[modelIndex];

          if (entry)
          {
            fragment.appendChild(view.renderRow(entry, modelIndex));
          }
        }

        tbody.appendChild(fragment);

        for (removeI = 0; removeI < removeCount; ++removeI)
        {
          tbody.removeChild(tbody.firstElementChild);
        }
      }
      else if (optimize === 'up')
      {
        removeCount = currentLastIndex - lastIndex;
        addCount = currentStartIndex - startIndex;

        for (addI = 0; addI < addCount; ++addI)
        {
          modelIndex = startIndex + addI;
          entry = entries[modelIndex];

          if (entry)
          {
            fragment.appendChild(view.renderRow(entry, modelIndex));
          }
        }

        tbody.insertBefore(fragment, tbody.firstElementChild);

        for (removeI = 0; removeI < removeCount; ++removeI)
        {
          tbody.removeChild(tbody.lastElementChild);
        }
      }
      else
      {
        var models = entries.slice(startIndex, endIndex);

        models.forEach(function(entry, i)
        {
          fragment.appendChild(view.renderRow(entry, startIndex + i));
        });

        tbody.innerHTML = '';
        tbody.appendChild(fragment);
      }

      view.finalizeRenderRows();

      console.log('            start=', startIndex, 'end=', endIndex, 'focusedCell=', view.focusedCell);
    },

    finalizeRenderRows: function()
    {
      var view = this;
      var $tbody = view.$tbody;

      if (view.afterRenderRows)
      {
        console.log('finalizeRenderRows afterRenderRows');
        view.afterRenderRows.call(view);
        view.afterRenderRows = null;
      }
      else if (view.focusedCell)
      {
        console.log('finalizeRenderRows focusedCell=', view.focusedCell.modelId, view.focusedCell.columnId);
        var modelId = view.focusedCell.modelId;
        var columnId = view.focusedCell.columnId;
        var arrayIndex = view.focusedCell.arrayIndex;
        var $tr = $tbody.find('tr[data-model-id="' + modelId + '"]');
        var tdSelector = 'td[data-column-id="' + columnId + '"]';

        if (arrayIndex >= 0)
        {
          tdSelector += '[data-array-index="' + arrayIndex + '"]';
        }

        var $td = $tr.find(tdSelector);

        if ($td[0] !== document.activeElement)
        {
          if (document.hasFocus())
          {
            $td.focus();
          }
          else
          {
            view.$tbody.find('.kanban-is-selected').removeClass('kanban-is-selected');
            view.$tbody.find('.kanban-is-focused').removeClass('kanban-is-focused');

            $tr.addClass('kanban-is-selected');
            $td.addClass('kanban-is-focused');
          }
        }
      }
      else if ($tbody[0].childElementCount)
      {
        console.log('finalizeRenderRows focus');
        if (view.prevFocusedCell)
        {
          var modelIndex = view.prevFocusedCell.modelIndex;
          var firstModelIndex = +$tbody[0].firstElementChild.dataset.modelIndex;
          var lastModelIndex = +$tbody[0].lastElementChild.dataset.modelIndex;

          if (view.prevFocusedCell.modelIndex < firstModelIndex)
          {
            modelIndex = firstModelIndex;
          }
          else if (view.prevFocusedCell.modelIndex > lastModelIndex)
          {
            modelIndex = lastModelIndex;
          }

          var $row = $tbody.find('tr[data-model-index="' + modelIndex + '"]');
          var $cell = $row.find('td[data-column-id="' + view.prevFocusedCell.columnId + '"]');

          if ($cell.length)
          {
            $cell.focus();
          }
          else
          {
            $row[0].children[0].focus();
          }
        }
        else
        {
          $tbody[0].children[0].children[0].focus();
        }
      }

      if (view.editing && view.editorPositioners[view.editing.columnId])
      {
        view.editorPositioners[view.editing.columnId].call(view, view.editing);
      }

      console.timeEnd('renderRows');
    },

    calcHeight: function()
    {
      return window.innerHeight - (this.el.offsetTop || 102) - 15;
    },

    resize: function()
    {
      console.log('resize');

      var height = this.calcHeight();

      this.el.style.height = height + 'px';

      this.$tbodyOuter[0].style.height = (height - 148) + 'px';

      this.renderRows();
    },

    idCell: function(e)
    {
      var td = e.currentTarget;
      var tr = td.parentNode;
      var modelId = tr.dataset.modelId;
      var columnId = td.dataset.columnId;
      var arrayIndex = parseInt(td.dataset.arrayIndex, 10);
      var entry = this.model.entries.get(modelId);
      var data = entry ? entry.serialize(this.model) : {};
      var value = data[columnId];

      if (isNaN(arrayIndex))
      {
        arrayIndex = -1;
      }

      if (value && arrayIndex >= 0)
      {
        value = value[arrayIndex];
      }

      return {
        td: td,
        tr: tr,
        columnId: columnId,
        column: this.columns.map[columnId],
        rowIndex: tr.rowIndex,
        arrayIndex: arrayIndex,
        modelIndex: parseInt(tr.dataset.modelIndex, 10),
        modelId: modelId,
        model: entry,
        data: data,
        value: value,
        clicks: e.clicks || 0
      };
    },

    resolveCell: function(cell)
    {
      if (!this.$tbody)
      {
        return null;
      }

      if (cell.tr.parentNode)
      {
        return cell;
      }

      var $td = this.$tbody.find(
        'tr[data-model-id="' + cell.modelId + '"] > td[data-column-id="' + cell.columnId + '"]'
      );

      return !$td.length ? null : this.idCell({
        currentTarget: $td[0],
        clicks: cell.clicks
      });
    },

    showColumnMenu: function(cell, top, left)
    {
      var view = this;
      var $th = view.$theadInner.find('td[data-column-id="' + cell.columnId + '"]');

      if (!top && !left)
      {
        var rect = $th[0].getBoundingClientRect();

        top = rect.top + rect.height;
        left = rect.left;
      }

      var column = cell.column;
      var tableView = view.model.tableView;
      var sortOrder = tableView.getSortOrder(cell.columnId);
      var options = {
        menu: [
          tableView.getColumnText(cell.columnId),
          {
            icon: 'fa-sort-amount-asc',
            label: view.t('menu:sort:asc'),
            handler: view.handleSort.bind(view, cell.columnId, 1),
            disabled: !column.sortable || sortOrder === 1
          },
          {
            icon: 'fa-sort-amount-desc',
            label: view.t('menu:sort:desc'),
            handler: view.handleSort.bind(view, cell.columnId, -1),
            disabled: !column.sortable || sortOrder === -1
          },
          '-',
          {
            icon: 'fa-eye',
            label: view.t('menu:show'),
            handler: view.handleShowColumns.bind(view),
            disabled: !tableView.hasAnyHiddenColumn()
          },
          {
            icon: 'fa-eye-slash',
            label: view.t('menu:hide'),
            handler: view.handleHideColumn.bind(view, cell.columnId),
            disabled: cell.columnId === '_id'
          },
          '-',
          {
            icon: 'fa-filter',
            label: view.t('menu:filter:clear'),
            handler: view.handleClearFilter.bind(view),
            disabled: !tableView.hasAnyFilter()
          },
          {
            label: view.t('menu:filter:and'),
            handler: view.handleFilterMode.bind(view, 'and'),
            disabled: tableView.getFilterMode() === 'and'
          },
          {
            label: view.t('menu:filter:or'),
            handler: view.handleFilterMode.bind(view, 'or'),
            disabled: tableView.getFilterMode() === 'or'
          }
        ]
      };

      var filter = view.filters[cell.columnId];

      if (typeof filter === 'string')
      {
        filter = view.filters[filter];
      }

      if (filter)
      {
        options.menu.push({
          template: function(templateData)
          {
            templateData.columnId = cell.columnId;

            return filter.template(templateData);
          },
          handler: filter.handler.bind(view, cell)
        });
      }

      contextMenu.show(view, top, left, options);
    },

    showCellEditor: function(cell)
    {
      if (this.editors[cell.columnId])
      {
        this.editing = cell;

        cell.td.classList.remove('kanban-is-editable');
        cell.td.classList.add('kanban-is-editing');

        this.editors[cell.columnId].call(this, cell);
      }
    },

    handleFilterMode: function(filterMode)
    {
      this.model.tableView.setFilterMode(filterMode);
    },

    handleClearFilter: function()
    {
      this.model.tableView.clearFilters();
    },

    handleSort: function(columnId, order)
    {
      this.model.tableView.setSortOrder(columnId, order);
    },

    showColumnVisibilityMenu: function(pos)
    {
      var view = this;
      var options = {
        animate: false,
        menu: [view.t('menu:show')].concat(view.model.tableView.getHiddenColumns().map(function(columnId)
        {
          return {
            label: view.model.tableView.getColumnText(columnId),
            handler: view.handleShowColumn.bind(view, columnId, pos)
          };
        }))
      };

      this.broker.subscribe('planning.contextMenu.hidden').setLimit(1).on('message', function()
      {
        contextMenu.show(view, pos.top - 5, pos.left - 1, options);
      });
    },

    handleShowColumns: function(e)
    {
      this.showColumnVisibilityMenu(e.currentTarget.getBoundingClientRect());
    },

    handleShowColumn: function(columnId, pos)
    {
      this.model.tableView.setVisibility(columnId, true);

      if (this.model.tableView.hasAnyHiddenColumn())
      {
        this.showColumnVisibilityMenu(pos);
      }
    },

    handleHideColumn: function(columnId)
    {
      this.model.tableView.setVisibility(columnId, false);
    },

    clearCache: function()
    {
      console.log('clearCache');

      this.rowCache = null;
    },

    onFilter: function()
    {
      if (!this.$tbodyInner)
      {
        console.log('onFilter 0');

        return;
      }

      console.log('onFilter 1');

      this.filtered = true;
    },

    onSort: function()
    {
      var view = this;
      var filtered = view.filtered;

      view.filtered = false;

      if (!view.$tbodyInner)
      {
        console.log('onSort 0');

        return;
      }

      console.log('onSort 1');

      view.clearCache();

      var tbodyInner = view.$tbodyInner[0];
      var entries = view.model.entries;
      var entry = view.focusedCell ? entries.filteredMap[view.focusedCell.model.id] : null;
      var visibleAreaHeight = view.$tbodyOuter.outerHeight() - SCROLLBAR_HEIGHT;

      if (entry)
      {
        var newIndex = entries.filtered.indexOf(entry);
        var newPosition = newIndex * ROW_HEIGHT;
        var entryInVisibleArea = newPosition >= tbodyInner.scrollTop
          && newPosition < (tbodyInner.scrollTop + visibleAreaHeight - ROW_HEIGHT * 2);

        if (entryInVisibleArea || filtered)
        {
          console.log('onSort 2');
          view.renderRows(-1, newIndex);
        }
        else
        {
          console.log('onSort 3');
          tbodyInner.scrollTop = newPosition;
        }
      }
      else
      {
        view.prevFocusedCell = view.focusedCell;
        view.focusedCell = null;

        if (tbodyInner.scrollTop === 0)
        {
          console.log('onSort 4');
          view.renderRows(0);
        }
        else if (filtered && view.prevFocusedCell)
        {
          console.log('onSort 5');
          view.renderRows(tbodyInner.scrollTop);
        }
        else
        {
          console.log('onSort 6');
          tbodyInner.scrollTop = 0;
        }
      }
    },

    onEntryChange: function(entry)
    {
      if (!this.rowCache)
      {
        console.log('onEntryChange', entry.id, 'nope');
        return;
      }

      console.log('onEntryChange', entry.id, 'yepp');

      delete this.rowCache[entry.id];

      var $tr = this.$tbody.find('tr[data-model-id="' + entry.id + '"]');

      if (!$tr.length)
      {
        return;
      }

      var focused = this.focusedCell && this.focusedCell.tr === $tr[0];

      $tr.replaceWith(this.renderRow(entry, +$tr[0].dataset.modelIndex));

      if (focused)
      {
        $tr = this.$tbody.find('tr[data-model-id="' + entry.id + '"]');

        var $td = $tr.find('.kanban-td[data-column-id="' + this.focusedCell.columnId + '"]');

        if (this.focusedCell.arrayIndex >= 0)
        {
          $td = $td.filter('[data-array-index="' + this.focusedCell.arrayIndex + '"]');
        }

        this.focusedCell = this.idCell({
          currentTarget: $td[0],
          clicks: this.focusedCell.clicks
        });

        this.$tbody.find('.kanban-is-selected').removeClass('kanban-is-selected');
        this.$tbody.find('.kanban-is-focused').removeClass('kanban-is-focused');

        $tr.addClass('kanban-is-selected');
        $td.addClass('kanban-is-focused');
      }
    },

    onSortableChange: function(tableView, columnId)
    {
      console.log('onSortableChange', columnId);

      this.renderColumns();
    },

    onVisibilityChange: function(tableView, columnId)
    {
      console.log('onVisibilityChange', columnId);

      if (this.focusedCell
        && columnId === this.focusedCell.columnId
        && !this.model.tableView.getVisibility(columnId))
      {
        var prevCell = this.focusedCell.td;

        do
        {
          prevCell = prevCell.previousElementSibling;
        }
        while (prevCell && prevCell.dataset.columnId === columnId);

        if (prevCell)
        {
          if (prevCell.parentNode.parentNode)
          {
            prevCell.focus();
          }
          else
          {
            this.focusedCell = this.idCell({currentTarget: prevCell});
          }
        }
      }

      this.clearCache();
      this.renderColumns();
      this.renderRows();
    },

    onTheadScroll: function()
    {
      this.$tbodyInner[0].scrollLeft = this.$theadInner[0].scrollLeft;
    },

    onTbodyScroll: function()
    {
      this.$theadInner[0].scrollLeft = this.$tbodyInner[0].scrollLeft;

      var newScrollTop = this.$tbodyInner[0].scrollTop;

      if (this.oldScrollTop !== newScrollTop)
      {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SCROLL', 'old=' + this.oldScrollTop, 'new=' + newScrollTop);

        this.oldScrollTop = newScrollTop;

        this.renderRows();
      }
    },

    onWindowKeyDown: function(e)
    {
      var tag = e.target.tagName;

      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA')
      {
        return;
      }

      if (!this.focusedCell)
      {
        this.$tbody.find('tr:first-child > td:first-child').focus();
      }

      this.handleTdKeyDown(e, this.focusedCell);
    },

    handleTdKeyDown: function(e, cell)
    {
      var key = e.originalEvent.key;

      if (key.length === 1)
      {
        key = key.toUpperCase();
      }

      console.log('handleTdKeyDown', key, cell);

      if (this.keyHandlers[key])
      {
        e.preventDefault();

        if (this.editing)
        {
          console.log('                editing!');
          return;
        }

        if (!this.lastKeyPressAt[key])
        {
          this.lastKeyPressAt[key] = Number.MIN_VALUE;
        }

        this.keyHandlers[key].call(this, e, cell);

        this.lastKeyPressAt[key] = e.timeStamp;
      }
    },

    keyHandlers: {
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
          view.$tbodyInner[0].scrollTop -= ROW_HEIGHT;
        }
        else
        {
          view.$tbodyInner[0].scrollTop = cell.modelIndex * ROW_HEIGHT - ROW_HEIGHT;
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
          var visibleAreaHeight = view.$tbodyInner[0].offsetHeight - SCROLLBAR_HEIGHT;

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
          view.$tbodyInner[0].scrollTop += ROW_HEIGHT * (nextTr ? 1 : 2);
        }
        else
        {
          view.$tbodyInner[0].scrollTop = cell.modelIndex * ROW_HEIGHT + ROW_HEIGHT;
        }
      },
      ArrowRight: function(e, cell)
      {
        var nextTd = cell.td.nextElementSibling;

        if (cell.tr.parentNode)
        {
          if (nextTd.dataset.columnId !== 'filler')
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

          if (td.dataset.columnId === 'filler')
          {
            td.previousElementSibling.focus();
          }
          else
          {
            td.focus();
          }
        }.bind(null, cell.modelIndex, cell.td.cellIndex + 1);

        view.$tbodyInner[0].scrollTop = cell.modelIndex * ROW_HEIGHT;
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

        view.$tbodyInner[0].scrollTop = cell.modelIndex * ROW_HEIGHT;
      },
      Tab: function(e, cell)
      {
        // TODO
      },
      PageUp: function(e, cell)
      {
        // TODO
      },
      PageDown: function(e, cell)
      {
        // TODO
      },
      Home: function(e, cell)
      {
        // TODO
      },
      End: function(e, cell)
      {
        // TODO
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
        if (cell.td.classList.contains('kanban-is-editable'))
        {
          this.showCellEditor(cell);
        }
      },
      C: function(e, cell)
      {
        if (!e.ctrlKey)
        {
          return;
        }

        var view = this;
        var lines = [];
        var line;
        var msg = 'cell';

        if (e.timeStamp - view.lastKeyPressAt.CtrlA < 1000)
        {
          view.model.entries.filtered.forEach(exportEntry);

          msg = 'table';
        }
        else if (e.timeStamp - view.lastKeyPressAt.C < 500)
        {
          exportEntry(cell.model);

          msg = 'row';
        }
        else if (cell.arrayIndex >= 0)
        {
          lines.push(cell.column.exportValue(
            cell.model.serialize()[cell.columnId][cell.arrayIndex],
            cell.column,
            cell.arrayIndex,
            cell.model.serialize()
          ));
        }
        else
        {
          lines.push(cell.column.exportValue(
            cell.model.serialize()[cell.columnId],
            cell.column,
            -1,
            cell.model.serialize()
          ));
        }

        clipboard.copy(function(clipboardData)
        {
          clipboardData.setData('text/plain', lines.join('\r\n'));

          if (view.$clipboardMsg)
          {
            viewport.msg.hide(view.$clipboardMsg, true);
          }

          view.$clipboardMsg = viewport.msg.show({
            type: 'info',
            time: 1500,
            text: view.t('msg:clipboard:' + msg)
          });
        });

        function exportEntry(entry)
        {
          entry = entry.serialize();
          line = [];

          view.columns.list.forEach(function(column)
          {
            if (Array.isArray(entry[column._id]))
            {
              entry[column._id].forEach(function(value, arrayIndex)
              {
                line.push(column.exportValue(value, column, arrayIndex, entry));
              });
            }
            else
            {
              line.push(column.exportValue(entry[column._id], column, -1, entry));
            }
          });

          lines.push(line.join('\t'));
        }
      },
      A: function(e)
      {
        if (e.ctrlKey)
        {
          this.lastKeyPressAt.CtrlA = e.timeStamp;
        }
      }
    },

    handleEditorValue: function(entryId, columnId, arrayIndex, newValue)
    {
      var view = this;
      var column = view.columns.map[columnId];

      if (!column)
      {
        return;
      }

      var entry = view.model.entries.get(entryId);

      if (!entry)
      {
        return;
      }

      var serializedEntry = entry.serialize();
      var oldValue = serializedEntry[columnId];

      if (arrayIndex >= 0)
      {
        oldValue = oldValue[arrayIndex];
      }

      if (newValue === oldValue)
      {
        return;
      }

      var $tr = view.$tbody.find('tr[data-model-id="' + entryId + '"]');
      var $td = $tr.find('td[data-column-id="' + columnId + '"]');

      if (arrayIndex >= 0)
      {
        $td = $td.filter('[data-array-index="' + arrayIndex + '"]');
      }

      $td
        .attr('class', 'kanban-td ' + column.tdClassName(newValue, column, arrayIndex, serializedEntry))
        .find('.kanban-td-value')
        .html(column.renderValue(newValue, column, arrayIndex, serializedEntry));

      $td.focus();

      var req = view.ajax({
        method: 'PATCH',
        url: entry.url(),
        data: JSON.stringify({
          property: columnId,
          arrayIndex: arrayIndex,
          newValue: newValue
        })
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: view.t('msg:update:failure')
        });

        var serializedEntry = entry.serialize();

        $td
          .attr('class', 'kanban-td ' + column.tdClassName(oldValue, column, arrayIndex, serializedEntry))
          .find('.kanban-td-value')
          .html(column.renderValue(oldValue, column, arrayIndex, serializedEntry));

        if (!view.focusedCell || view.focusedCell.td === $td[0])
        {
          $td.focus();
        }
      });
    },

    afterEdit: function()
    {
      this.$tbody
        .find('.kanban-is-editing')
        .removeClass('kanban-is-editing')
        .addClass('kanban-is-editable');

      this.editing = null;
    },

    editors: {

      input: function(cell, maxLength, pattern, placeholder)
      {
        var view = this;
        var rect = cell.td.getBoundingClientRect();
        var entry = cell.model.serialize();

        $(document.body).append(inputEditorTemplate({
          idPrefix: view.idPrefix,
          columnId: cell.columnId,
          maxLength: maxLength,
          pattern: pattern,
          placeholder: placeholder,
          value: cell.column.editorValue(
            cell.arrayIndex >= 0 ? entry[cell.columnId][cell.arrayIndex] : entry[cell.columnId],
            cell.column,
            cell.arrayIndex,
            entry
          )
        }));

        view.$id('editor-backdrop').one('click', hide);
        view.$id('editor-form').on('submit', submit).css({
          top: rect.top + 'px',
          left: rect.left + 'px'
        });
        view.$id('editor-input').on('blur', hide).on('keydown', keyDown).select();

        function submit()
        {
          var newValue = cell.column.parseValue(
            view.$id('editor-input').val(),
            cell.column,
            cell.arrayIndex,
            cell.model.serialize()
          );

          view.handleEditorValue(cell.modelId, cell.columnId, cell.arrayIndex, newValue);

          hide();

          return false;
        }

        function hide()
        {
          view.$id('editor-backdrop').remove();
          view.$id('editor-form').remove();

          view.afterEdit();
        }

        function keyDown(e)
        {
          if (e.originalEvent.key === 'Escape')
          {
            hide();
          }
        }
      },

      kind: function(cell)
      {
        var view = this;
        var rect = cell.td.getBoundingClientRect();
        var oldKind = cell.model.get('kind');
        var menu = [];

        ['kk', 'pk', null].forEach(function(newKind)
        {
          menu.push({
            label: view.t('kind:' + newKind),
            handler: view.handleEditorValue.bind(view, cell.modelId, cell.columnId, cell.arrayIndex, newKind),
            disabled: oldKind === newKind
          });
        });

        contextMenu.show(view, rect.top, rect.left, menu);

        view.broker.subscribe('planning.contextMenu.hidden', view.afterEdit.bind(view)).setLimit(1);
      },

      discontinued: function(cell)
      {
        this.handleEditorValue(cell.modelId, cell.columnId, cell.arrayIndex, !cell.model.get('discontinued'));
        this.afterEdit();
      },

      workstations: function(cell)
      {
        this.editors.input.call(this, cell, 3, '^([0-9]|[1-9][0-9]|[0-9].[0-9])$');
      },

      locations: function(cell)
      {
        this.editors.input.call(this, cell, 3, '^[A-Za-z]([0-9][0-9])$', 'X00');
      }

    },

    editorPositioners: {

      contextMenu: function(editingCell)
      {
        var cell = this.resolveCell(editingCell);

        if (cell)
        {
          var rect = cell.td.getBoundingClientRect();

          contextMenu.position(this, rect.top, rect.left);
        }
      },

      inputEditor: function(editingCell)
      {
        var cell = this.resolveCell(editingCell);

        if (cell)
        {
          var rect = cell.td.getBoundingClientRect();

          this.$id('editor-form').css({
            top: rect.top + 'px',
            left: rect.left + 'px'
          });
        }
      },

      kind: function()
      {
        this.editorPositioners.contextMenu.apply(this, arguments);
      },

      workstations: function()
      {
        this.editorPositioners.inputEditor.apply(this, arguments);
      },

      locations: function()
      {
        this.editorPositioners.inputEditor.apply(this, arguments);
      }

    },

    handleFilterValue: function(columnId, type, data)
    {
      contextMenu.hide(this);

      var newFilter = null;

      if (type)
      {
        newFilter = {
          type: type,
          data: data
        };
      }

      this.model.tableView.setFilter(columnId, newFilter);

      return false;
    },

    filters: {

      numeric: {
        template: numericFilterTemplate,
        handler: function(cell, $filter)
        {
          var view = this;
          var $data = $filter.find('.form-control');
          var oldData = (view.model.tableView.getFilter(cell.columnId) || {data: ''}).data;

          $data.val(oldData).on('input', function()
          {
            this.setCustomValidity('');
          });

          $filter.find('.btn[data-action="clear"]').on('click', function()
          {
            view.handleFilterValue(cell.columnId);
          });

          $filter.find('form').on('submit', function()
          {
            var newData = $data.val()
              .trim()
              .replace(/and/ig, '&&')
              .replace(/or/ig, '||')
              .replace(/=+/g, '=');

            if (newData === '')
            {
              return view.handleFilterValue(cell.columnId);
            }

            if (newData === '?')
            {
              return view.handleFilterValue(cell.columnId, 'empty', '?');
            }

            if (/^[0-9]+$/.test(newData))
            {
              return view.handleFilterValue(cell.columnId, 'numeric', newData);
            }

            var code = newData;

            if (newData.indexOf('$') === -1)
            {
              code = '$' + code;
            }

            code = code
              .replace(/([^<>])=/g, '$1==')
              .replace(/<>/g, '!=');

            try
            {
              var result = eval('(function($) { return ' + code + '; })(666);'); // eslint-disable-line no-eval

              if (typeof result !== 'boolean')
              {
                throw new Error('Invalid result type. Expected boolean, got ' + typeof result + '.');
              }
            }
            catch (err)
            {
              $data[0].setCustomValidity(view.t('filters:invalid'));

              view.timers.revalidate = setTimeout(function() { $filter.find('.btn-primary').click(); }, 1);

              return false;
            }

            return view.handleFilterValue(cell.columnId, 'numeric', newData);
          });
        }
      },
      text: {
        template: textFilterTemplate,
        handler: function(cell, $filter)
        {
          var view = this;
          var $data = $filter.find('.form-control');
          var oldData = (view.model.tableView.getFilter(cell.columnId) || {data: ''}).data;

          $data.val(oldData).on('input', function()
          {
            this.setCustomValidity('');
          });

          $filter.find('.btn[data-action="clear"]').on('click', function()
          {
            view.handleFilterValue(cell.columnId);
          });

          $filter.find('form').on('submit', function()
          {
            var newData = $data.val().trim();

            if (newData === '')
            {
              return view.handleFilterValue(cell.columnId);
            }

            if (newData === '?')
            {
              return view.handleFilterValue(cell.columnId, 'empty', '?');
            }

            if (!/^\/.*?\/$/.test(newData))
            {
              if (!newData.replace(/[^A-Za-z0-9]+/g, '').length)
              {
                $data[0].setCustomValidity(view.t('filters:invalid'));

                view.timers.revalidate = setTimeout(function() { $filter.find('.btn-primary').click(); }, 1);

                return false;
              }

              return view.handleFilterValue(cell.columnId, 'text', newData);
            }

            var code = newData + 'i.test($)';

            try
            {
              var result = eval('(function($) { return ' + code + '; })("abc");'); // eslint-disable-line no-eval

              if (typeof result !== 'boolean')
              {
                throw new Error('Invalid result type. Expected boolean, got ' + typeof result + '.');
              }
            }
            catch (err)
            {
              $data[0].setCustomValidity(view.t('filters:invalid'));

              view.timers.revalidate = setTimeout(function() { $filter.find('.btn-primary').click(); }, 1);

              return false;
            }

            return view.handleFilterValue(cell.columnId, 'text', newData);
          });
        }
      },
      select: function(cell, $filter, options, multiple)
      {
        var view = this;
        var $data = $filter.find('.form-control').prop('multiple', multiple !== false);
        var oldData = (view.model.tableView.getFilter(cell.columnId) || {data: []}).data;

        $filter.find('select').html(options.map(function(option)
        {
          return '<option value="' + option.id + '" ' + (_.includes(oldData, option.id) ? 'selected' : '') + '>'
            + _.escape(option.text)
            + '</option>';
        }).join(''));

        $filter.find('.btn[data-action="clear"]').on('click', function()
        {
          view.handleFilterValue(cell.columnId);
        });

        $filter.find('form').on('submit', function()
        {
          var newData = $data.val();

          if (!Array.isArray(newData))
          {
            newData = [newData];
          }

          return view.handleFilterValue(
            cell.columnId,
            'select',
            newData.length === 0 ? null : newData
          );
        });
      },
      _id: 'numeric',
      kanbanQtyUser: 'numeric',
      componentQty: 'numeric',
      kanbanIdEmpty: 'numeric',
      kanbanIdFull: 'numeric',
      lineCount: 'numeric',
      emptyFullCount: 'numeric',
      stock: 'numeric',
      maxBinQty: 'numeric',
      minBinQty: 'numeric',
      replenQty: 'numeric',
      nc12: 'text',
      description: 'text',
      storageBin: 'text',
      supplyArea: {
        template: selectFilterTemplate,
        handler: function(cell, $filter)
        {
          this.filters.select.call(this, cell, $filter, this.model.entries.getSupplyAreas());
        }
      },
      family: {
        template: selectFilterTemplate,
        handler: function(cell, $filter)
        {
          this.filters.select.call(
            this,
            cell,
            $filter,
            [{id: '', text: this.t('filters:value:empty')}].concat(this.model.supplyAreas.getFamilies())
          );
        }
      },
      kind: {
        template: selectFilterTemplate,
        handler: function(cell, $filter)
        {
          this.filters.select.call(
            this,
            cell,
            $filter,
            [
              {id: '', text: this.t('filters:value:empty')},
              {id: 'kk', text: this.t('kind:kk')},
              {id: 'pk', text: this.t('kind:pk')}
            ]
          );
        }
      },
      workstations: {
        template: selectFilterTemplate,
        handler: function(cell, $filter)
        {
          this.filters.select.call(
            this,
            cell,
            $filter,
            [
              {id: 'valid', text: this.t('filters:value:valid')},
              {id: 'invalid', text: this.t('filters:value:invalid')}
            ],
            false
          );
        }
      },
      locations: 'workstations',
      discontinued: {
        template: selectFilterTemplate,
        handler: function(cell, $filter)
        {
          this.filters.select.call(
            this,
            cell,
            $filter,
            [
              {id: 'true', text: this.t('core', 'BOOL:true')},
              {id: 'false', text: this.t('core', 'BOOL:false')}
            ],
            false
          );
        }
      }

    }

  });
});
