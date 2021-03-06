// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/util/pageActions',
  'app/data/clipboard',
  'app/planning/util/contextMenu',
  'app/orders/OrderCollection',
  'app/pfepEntries/PfepEntryCollection',
  './KanbanEntryListView.keyHandlers',
  './KanbanEntryListView.filters',
  './KanbanEntryListView.editors',
  './SplitEntryDialogView',
  'app/kanban/templates/entryList',
  'app/kanban/templates/entryListColumns',
  'app/kanban/templates/entryListRow'
], function(
  _,
  $,
  user,
  viewport,
  View,
  pageActions,
  clipboard,
  contextMenu,
  OrderCollection,
  PfepEntryCollection,
  keyHandlers,
  filters,
  editors,
  SplitEntryDialogView,
  template,
  columnsTemplate,
  rowTemplate
) {
  'use strict';

  return View.extend({

    ROW_HEIGHT: 25,
    SCROLLBAR_HEIGHT: 17,

    template: template,

    filters: filters,
    keyHandlers: keyHandlers,
    editors: editors.editors,
    editorPositioners: editors.positioners,

    localTopics: {

      'planning.contextMenu.hiding': function(message)
      {
        message.$menu.find('[aria-describedby^="popover"]').popover('destroy');
      }

    },

    events: {
      'contextmenu': function()
      {
        return false;
      },
      'contextmenu .kanban-td': function(e)
      {
        if (e.currentTarget.classList.contains('kanban-is-with-menu'))
        {
          this.showColumnMenu(this.idCell(e), e.pageY, e.pageX);
        }
        else
        {
          this.showCellMenu(this.idCell(e), e.pageY, e.pageX);
        }

        return false;
      },
      'mousedown': function(e)
      {
        if (e.which !== 1)
        {
          return false;
        }
      },
      'click .kanban-td': function(e)
      {
        if (!e.ctrlKey)
        {
          return;
        }

        this.handleQueuePrint(e.currentTarget.parentNode.dataset.modelId);
      },
      'dblclick .kanban-td': function()
      {
        return false;
      },
      'focus .kanban-td': function(e)
      {
        var newCell = this.idCell(e);

        if (newCell.value === undefined)
        {
          return;
        }

        var oldCell = this.focusedCell;

        if (oldCell
          && oldCell.modelId === newCell.modelId
          && oldCell.columnId === newCell.columnId
          && oldCell.arrayIndex === newCell.arrayIndex)
        {
          newCell.clicks = oldCell.clicks;
        }

        this.focusedCell = newCell;

        this.focusCell();
      },
      'click .kanban-is-editable': function(e)
      {
        if (e.shiftKey || e.ctrlKey)
        {
          return;
        }

        var cell = this.idCell(e);

        if (e.altKey)
        {
          if (cell.column.handleAltClick)
          {
            cell.column.handleAltClick(cell);
          }

          return false;
        }

        if (!this.focusedCell || this.focusedCell.td !== e.currentTarget)
        {
          this.focusedCell = cell;
        }

        this.focusedCell.clicks += 1;

        if (this.focusedCell.clicks > 1)
        {
          this.showCellEditor(this.focusedCell);
        }
      },
      'click .kanban-is-with-menu': function(e)
      {
        if (e.shiftKey || e.ctrlKey || e.altKey)
        {
          return;
        }

        this.showColumnMenu(this.idCell(e), e.pageY, e.pageX);
      },
      'mouseenter .kanban-td': function(e)
      {
        this.$('.kanban-is-hovered').removeClass('kanban-is-hovered');

        var td = e.currentTarget;
        var tdSelector = '.kanban-td[data-column-id="' + td.dataset.columnId + '"]';

        if (td.dataset.arrayIndex)
        {
          tdSelector += '[data-array-index="' + td.dataset.arrayIndex + '"]';
        }

        this.hovered = tdSelector;

        this.$(tdSelector).addClass('kanban-is-hovered');

        var column = this.columns.map[td.dataset.columnId];

        if (column && td.parentNode.dataset.modelId)
        {
          if (column.expand >= 0)
          {
            this.expandTdValue(td);
          }
          else if (column.popover)
          {
            this.showTdPopover(td);
          }
        }
      },
      'mouseleave .kanban-td': function()
      {
        this.hovered = null;

        this.$('.kanban-is-hovered').removeClass('kanban-is-hovered');

        this.collapseTdValue();
        this.hideTdPopover();
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
      var row = view.rowCache[entry.id];

      if (row)
      {
        row.classList.remove('kanban-is-selected');

        var cells = row.querySelectorAll('.kanban-is-hovered, .kanban-is-selected');

        for (var i = 0; i < cells.length; ++i)
        {
          cells[i].classList.remove('kanban-is-hovered', 'kanban-is-selected');
        }
      }
      else
      {
        row = view.rowCache[entry.id] = $.parseHTML(rowTemplate({
          idPrefix: view.idPrefix,
          modelIndex: modelIndex,
          columns: view.columns,
          entry: entry.serialize(view.model)
        }))[0];
      }

      if (this.hovered)
      {
        row.querySelector(this.hovered).classList.add('kanban-is-hovered');
      }

      return view.rowCache[entry.id];
    },

    renderRows: function(newPosition, newIndex)
    {
      var view = this;

      if (!view.$tbody)
      {
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
      var visibleAreaHeight = view.$tbodyOuter.outerHeight() - view.SCROLLBAR_HEIGHT;
      var visibleRowCount = Math.ceil(visibleAreaHeight / view.ROW_HEIGHT);
      var rowCount = view.model.entries.filtered.length;
      var totalHeight = view.ROW_HEIGHT * (rowCount + 1);
      var scrollTop = view.$tbodyInner[0].scrollTop;

      if (newIndex >= 0)
      {
        newPosition = newIndex * view.ROW_HEIGHT;

        if (newPosition >= scrollTop
          && newPosition < (scrollTop + visibleAreaHeight - view.ROW_HEIGHT * 2))
        {
          newPosition = -1;
        }
        else if ((newIndex + visibleRowCount) * view.ROW_HEIGHT >= totalHeight)
        {
          newPosition = totalHeight - visibleRowCount * view.ROW_HEIGHT;
        }
      }

      if (newPosition >= 0)
      {
        scrollTop = newPosition;
      }

      var startIndex = Math.max(0, Math.floor(scrollTop / view.ROW_HEIGHT));
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
    },

    finalizeRenderRows: function()
    {
      var view = this;
      var $tbody = view.$tbody;

      if (view.afterRenderRows)
      {
        view.afterRenderRows.call(view);
        view.afterRenderRows = null;

        view.focusCell();
      }
      else if (view.focusedCell)
      {
        var modelId = view.focusedCell.modelId;
        var columnId = view.focusedCell.columnId;
        var arrayIndex = view.focusedCell.arrayIndex;
        var $tr = $tbody.find('tr[data-model-id="' + modelId + '"]');

        if (!$tr.length)
        {
          view.focusCell();
        }
        else
        {
          var tdSelector = 'td[data-column-id="' + columnId + '"]';

          if (arrayIndex >= 0)
          {
            tdSelector += '[data-array-index="' + arrayIndex + '"]';
          }

          var $td = $tr.find(tdSelector);

          if ($td[0] === document.activeElement)
          {
            view.focusCell();
          }
          else if (document.hasFocus())
          {
            $td.focus();
          }
          else
          {
            view.focusCell();
          }
        }
      }
      else if ($tbody[0].childElementCount)
      {
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

      if (view.editing)
      {
        var editorPositioner = view.editorPositioners[view.editing.columnId];

        if (typeof editorPositioner === 'string')
        {
          editorPositioner = view.editorPositioners[editorPositioner];
        }

        if (editorPositioner)
        {
          editorPositioner.call(view, view.editing);
        }
      }
    },

    calcHeight: function()
    {
      return window.innerHeight - (this.el.offsetTop || 102) - 15;
    },

    resize: function()
    {
      if (!this.$tbodyOuter || !this.$tbodyOuter.length)
      {
        return;
      }

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

      _.forEach(column.filters, function(filter, label)
      {
        options.menu.push({
          label: view.t('filters:' + label),
          handler: view.handleFilterValue.bind(view, cell.columnId, 'eval', filter)
        });
      });

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
          handler: function($filter)
          {
            filter.handler.call(view, cell, $filter);

            $filter.find('.kanban-filter-help').popover({
              container: 'body',
              trigger: 'hover',
              placement: 'auto bottom',
              html: true,
              title: view.t('filters:help:title:' + filter.type),
              content: view.t('filters:help:content:' + filter.type),
              css: {
                maxWidth: '375px'
              }
            });
          }
        });
      }

      contextMenu.show(view, top, left, options);
    },

    showCellMenu: function(cell, top, left)
    {
      if (!cell.model)
      {
        return;
      }

      var view = this;
      var options = {
        menu: [
          {
            icon: 'fa-download',
            label: view.t('menu:export'),
            handler: view.handleExportTable.bind(view)
          },
          {
            icon: 'fa-clipboard',
            label: view.t('menu:copy:table'),
            handler: view.handleCopyTable.bind(view)
          },
          {
            label: view.t('menu:copy:row'),
            handler: view.handleCopyRow.bind(view, cell.modelId)
          },
          {
            label: view.t('menu:copy:cell'),
            handler: view.handleCopyCell.bind(view, cell.modelId, cell.columnId, cell.arrayIndex)
          }
        ]
      };

      if (cell.column._id === '_id'
        && !/[a-z]$/.test(cell.modelId)
        && user.isAllowedTo('KANBAN:MANAGE', 'FN:process-engineer'))
      {
        options.menu.push({
          icon: 'fa-chain-broken',
          label: view.t('menu:split'),
          handler: view.handleSplitEntry.bind(view, cell.modelId)
        });
      }

      if (!cell.model.get('discontinued'))
      {
        options.menu.unshift({
          icon: 'fa-print',
          label: view.t('menu:queuePrint'),
          handler: view.handleQueuePrint.bind(view, cell.modelId)
        });
      }

      if (cell.column._id === 'container')
      {
        var container = this.model.containers.get(cell.model.get('container'));

        if (container && container.get('image'))
        {
          options.menu.unshift({
            icon: 'fa-image',
            label: view.t('menu:containerImage'),
            handler: function()
            {
              cell.column.handleAltClick(cell);
            }
          });
        }
      }

      if (cell.td.classList.contains('kanban-is-editable'))
      {
        options.menu.unshift({
          icon: 'fa-pencil',
          label: view.t('menu:edit'),
          handler: function()
          {
            view.broker
              .subscribe('planning.contextMenu.hidden', view.showCellEditor.bind(view, view.focusedCell))
              .setLimit(1);
          }
        });
      }

      var externalLinks = [];

      if (cell.columnId === 'nc12')
      {
        if (user.isAllowedTo('PFEP:VIEW'))
        {
          externalLinks.push({
            label: view.t('menu:nc12:pfep'),
            handler: function()
            {
              var collection = new PfepEntryCollection();

              collection.rqlQuery.selector.args = [{
                name: 'eq',
                args: ['nc12', cell.model.get('nc12')]
              }];

              viewport.msg.loading();

              var req = view.promised(collection.fetch());

              req.fail(function()
              {
                viewport.msg.loadingFailed();
              });

              req.done(function()
              {
                viewport.msg.loaded();

                if (collection.length === 1)
                {
                  window.open(collection.at(0).genClientUrl());
                }
                else if (collection.length)
                {
                  window.open(collection.genClientUrl() + '?' + collection.rqlQuery);
                }
                else
                {
                  viewport.msg.show({
                    type: 'warning',
                    time: 2500,
                    text: view.t('menu:nc12:pfep:notFound')
                  });
                }
              });
            }
          });
        }

        if (user.isAllowedTo('ORDERS:VIEW'))
        {
          externalLinks.push({
            label: view.t('menu:nc12:orders'),
            handler: function()
            {
              var collection = new OrderCollection();

              collection.rqlQuery.selector.args = [{
                name: 'eq',
                args: ['bom.nc12', cell.model.get('nc12')]
              }];

              window.open(collection.genClientUrl() + '?' + collection.rqlQuery);
            }
          });
        }
      }

      if (externalLinks.length)
      {
        externalLinks[0].icon = 'fa-external-link';

        options.menu = options.menu.concat(externalLinks);
      }

      cell.td.focus();

      if (!top && !left)
      {
        var rect = cell.td.getBoundingClientRect();

        top = rect.top + rect.height / 2;
        left = rect.left + rect.width / 2;
      }

      contextMenu.show(view, top, left, options);
    },

    handleQueuePrint: function(entryId)
    {
      var entry = this.model.entries.get(entryId);

      if (!entry)
      {
        return;
      }

      if (entry.get('discontinued'))
      {
        return viewport.msg.show({
          type: 'warning',
          time: 2500,
          text: this.t('msg:discontinued', {id: entryId})
        });
      }

      this.model.builder.addFromEntry(entry.serialize(this.model));
    },

    handleCopyTable: function()
    {
      var view = this;
      var lines = [view.columns.list.map(function(column)
      {
        if (!column.arrayIndex)
        {
          return view.model.tableView.getColumnText(column._id);
        }

        var columns = [];

        for (var i = 0; i < column.arrayIndex; ++i)
        {
          columns.push(view.model.tableView.getColumnText(column._id, i));
        }

        return columns.join('\t');
      }).join('\t')];

      view.model.entries.filtered.forEach(function(entry)
      {
        lines.push(view.exportEntry(entry));
      });

      this.handleCopy('table', lines);
    },

    handleCopyRow: function(entryId)
    {
      this.handleCopy('row', [this.exportEntry(this.model.entries.get(entryId))]);
    },

    handleCopyCell: function(entryId, columnId, arrayIndex)
    {
      var column = this.columns.map[columnId];
      var entry = this.model.entries.get(entryId).serialize(this.model);
      var value = entry[columnId];

      if (arrayIndex >= 0)
      {
        value = value[arrayIndex];
      }

      this.handleCopy('cell', [column.exportValue(value, column, arrayIndex, entry)]);
    },

    handleCopy: function(type, lines)
    {
      var view = this;

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
          text: view.t('msg:clipboard:' + type)
        });
      });
    },

    handleSplitEntry: function(entryId)
    {
      var entry = this.model.entries.get(entryId);

      if (!entry)
      {
        return;
      }

      var dialogView = new SplitEntryDialogView({
        model: entry
      });

      viewport.showDialog(dialogView, this.t('splitEntry:title'));
    },

    exportEntry: function(entry)
    {
      entry = entry.serialize(this.model);

      var line = [];

      this.columns.list.forEach(function(column)
      {
        if (column.arrayIndex)
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

      return line.join('\t');
    },

    showCellEditor: function(cell)
    {
      var editor = this.editors[cell.columnId];

      if (!editor)
      {
        return;
      }

      this.editing = cell;

      cell.td.classList.remove('kanban-is-editable');
      cell.td.classList.add('kanban-is-editing');

      if (typeof editor === 'string')
      {
        editor = this.editors[editor];
      }

      editor.call(this, cell);
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

    handleExportTable: function()
    {
      var view = this;

      view.$exportMsg = viewport.msg.show({
        type: 'info',
        text: view.t('export:progress')
      });

      var tableView = view.model.tableView;
      var entries = view.model.entries.filtered;
      var columns = {};
      var data = [];
      var kanbanIdVisible = view.columns.map.kanbanId.visible;
      var containerVisible = view.columns.map.container.visible;

      view.columns.list.forEach(function(column)
      {
        if (!column.arrayIndex)
        {
          columns[column._id] = {
            type: column.type,
            width: column.width,
            headerRotation: column.rotated ? 90 : 0,
            headerAlignmentH: 'Center',
            headerAlignmentV: 'Center',
            caption: tableView.getColumnText(column._id, -1, false).replace(/<br>/g, '\r\n')
          };

          if (kanbanIdVisible && column._id === 'family')
          {
            columns.line = {
              type: 'string',
              width: 10,
              headerAlignmentH: 'Center',
              headerAlignmentV: 'Center',
              caption: view.t('column:line')
            };
            columns.workstations = {
              type: 'string',
              width: 4,
              headerRotation: 90,
              headerAlignmentH: 'Center',
              headerAlignmentV: 'Center',
              caption: view.t('column:workstations')
            };
            columns.locations = {
              type: 'string',
              width: 4,
              headerRotation: 90,
              headerAlignmentH: 'Center',
              headerAlignmentV: 'Center',
              caption: view.t('column:locations')
            };
          }
          else if (containerVisible && column._id === 'container')
          {
            columns.containerLength = {
              type: 'integer',
              width: 4,
              headerRotation: 90,
              headerAlignmentH: 'Center',
              headerAlignmentV: 'Center',
              caption: view.t('kanbanContainers', 'PROPERTY:length')
            };
            columns.containerWidth = {
              type: 'integer',
              width: 4,
              headerRotation: 90,
              headerAlignmentH: 'Center',
              headerAlignmentV: 'Center',
              caption: view.t('kanbanContainers', 'PROPERTY:width')
            };
            columns.containerHeight = {
              type: 'integer',
              width: 4,
              headerRotation: 90,
              headerAlignmentH: 'Center',
              headerAlignmentV: 'Center',
              caption: view.t('kanbanContainers', 'PROPERTY:height')
            };
          }

          return;
        }

        for (var i = 0; i < column.arrayIndex; ++i)
        {
          columns[column._id + i] = {
            type: column.type,
            width: column.width,
            headerRotation: 90,
            headerAlignmentH: 'Center',
            headerAlignmentV: 'Center',
            caption: tableView.getColumnText(column._id, i, false).replace(/<br>/g, '\r\n')
          };
        }
      });

      entries.forEach(function(entry)
      {
        entry = entry.serialize(view.model);

        if (columns.kanbanId)
        {
          var kanbanIndex = -1;

          entry.lines.forEach(function(line)
          {
            entry.workstations.forEach(function(workstations, i)
            {
              var kanbanQty = workstations * 2;
              var locations = entry.locations[i];

              for (var w = 0; w < kanbanQty; ++w)
              {
                exportRow(entry, line, entry.kanbanId[++kanbanIndex], kanbanIndex, 'ST' + (i + 1), locations);
              }
            });
          });

          entry.workstations.forEach(function(workstations, i)
          {
            var kanbanQty = workstations * 2;
            var locations = entry.locations[i];

            entry.lines.forEach(function(line)
            {
              for (var w = 0; w < kanbanQty; ++w)
              {
                exportRow(entry, line, entry.kanbanId[++kanbanIndex], kanbanIndex, 'ST' + (i + 1), locations);
              }
            });
          });
        }
        else
        {
          exportRow(entry);
        }
      });

      var meta = {
        filename: view.t('export:fileName'),
        sheetName: view.t('export:sheetName'),
        freezeRows: 1,
        freezeColumns: 1
          + (tableView.getVisibility('nc12') ? 1 : 0)
          + (tableView.getVisibility('description') ? 1 : 0),
        headerHeight: 100,
        subHeader: false,
        columns: columns
      };

      var formData = new FormData();

      formData.append(
        'meta',
        new Blob([JSON.stringify(meta)], {type: 'application/json'}),
        'KANABN_META.json'
      );
      formData.append(
        'data',
        new Blob([data.map(function(line) { return JSON.stringify(line); }).join('\n')], {type: 'text/plain'}),
        'KANBAN_DATA.txt'
      );

      var req = view.ajax({
        type: 'POST',
        url: '/xlsxExporter',
        processData: false,
        contentType: false,
        data: formData
      });

      req.fail(function()
      {
        viewport.msg.hide(view.$exportMsg, true);

        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: view.t('export:failure')
        });
      });

      req.done(function(id)
      {
        pageActions.exportXlsx('/xlsxExporter/' + id);

        viewport.msg.hide(view.$exportMsg, true);
      });

      function exportRow(entry, line, kanbanId, kanbanIndex, workstations, locations)
      {
        var row = {};

        view.columns.list.forEach(function(column)
        {
          if (column._id === 'kanbanId')
          {
            row[column._id] = kanbanId;

            return;
          }

          if (!column.arrayIndex)
          {
            row[column._id] = column.exportValue(entry[column._id], column, -1, entry);

            if (kanbanIndex >= 0 && column._id === 'family')
            {
              row.line = line;
              row.workstations = workstations;
              row.locations = locations;
            }
            else if (column._id === 'container')
            {
              var container = view.model.containers.get(entry.container);

              if (container)
              {
                row.containerLength = container.get('length');
                row.containerWidth = container.get('width');
                row.containerHeight = container.get('height');
              }
              else
              {
                row.containerLength = 0;
                row.containerWidth = 0;
                row.containerHeight = 0;
              }
            }

            return;
          }

          for (var i = 0; i < column.arrayIndex; ++i)
          {
            row[column._id + i] = column.exportValue(entry[column._id][i], column, i, entry);
          }
        });

        data.push(row);
      }
    },

    clearCache: function()
    {
      this.rowCache = null;
    },

    onFilter: function()
    {
      if (!this.$tbodyInner)
      {
         return;
      }

      this.filtered = true;
    },

    onSort: function()
    {
      var view = this;
      var filtered = view.filtered;

      view.filtered = false;

      if (!view.$tbodyInner)
      {
         return;
      }

      view.clearCache();

      var tbodyInner = view.$tbodyInner[0];
      var entries = view.model.entries;
      var entry = view.focusedCell ? entries.filteredMap[view.focusedCell.model.id] : null;
      var visibleAreaHeight = view.$tbodyOuter.outerHeight() - view.SCROLLBAR_HEIGHT;

      if (entry)
      {
        var newIndex = entries.filtered.indexOf(entry);
        var newPosition = newIndex * view.ROW_HEIGHT;
        var entryInVisibleArea = newPosition >= tbodyInner.scrollTop
          && newPosition < (tbodyInner.scrollTop + visibleAreaHeight - view.ROW_HEIGHT * 2);

        if (entryInVisibleArea || filtered)
        {
          view.renderRows(-1, newIndex);
        }
        else
        {
          tbodyInner.scrollTop = newPosition;
        }
      }
      else
      {
        view.prevFocusedCell = view.focusedCell;
        view.focusedCell = null;

        if (tbodyInner.scrollTop === 0)
        {
          view.renderRows(0);
        }
        else if (filtered && view.prevFocusedCell)
        {
          view.renderRows(tbodyInner.scrollTop);
        }
        else
        {
          tbodyInner.scrollTop = 0;
        }
      }
    },

    onEntryChange: function(entry)
    {
      if (!this.rowCache)
      {
        return;
      }

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

        this.focusCell();
      }
    },

    focusCell: function()
    {
      this.$('.kanban-is-selected').removeClass('kanban-is-selected');
      this.$tbody.find('.kanban-is-focused').removeClass('kanban-is-focused');

      var cell = this.focusedCell;

      if (!cell)
      {
        return;
      }

      if (cell.td)
      {
        cell.td.parentNode.classList.add('kanban-is-selected');
        cell.td.classList.add('kanban-is-focused');
      }

      var tdSelector = '.kanban-td[data-column-id="' + cell.columnId + '"]';

      if (cell.arrayIndex >= 0)
      {
        tdSelector += '[data-array-index="' + cell.arrayIndex + '"]';
      }

      this.$(tdSelector).addClass('kanban-is-selected');
    },

    onSortableChange: function()
    {
      this.renderColumns();
    },

    onVisibilityChange: function(tableView, columnId)
    {
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
        this.oldScrollTop = newScrollTop;

        this.renderRows();
      }
    },

    onWindowKeyDown: function(e)
    {
      if (!this.$tbody)
      {
        return;
      }

      var tag = e.target.tagName;

      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA')
      {
        return;
      }

      if (!this.focusedCell)
      {
        this.$tbody.find('tr:first-child > td:first-child').focus();
      }

      if (!this.focusedCell)
      {
        return;
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

      if (this.keyHandlers[key])
      {
        e.preventDefault();

        if (this.editing)
        {
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


    find: function(type, model)
    {
      var view = this;

      if (type === 'component')
      {
        view.model.tableView.setFilters({
          nc12: {
            type: 'text',
            data: model.id
          }
        });
      }
      else if (type === 'entry')
      {
        var $tr = view.$tbody.find('tr[data-model-id="' + model.id + '"]');

        if ($tr.length)
        {
          return $tr[0].firstElementChild.focus();
        }

        if (!view.model.entries.filteredMap[model.id])
        {
          view.model.tableView.clearFilters();
        }

        $tr = view.$tbody.find('tr[data-model-id="' + model.id + '"]');

        if ($tr.length)
        {
          return $tr[0].firstElementChild.focus();
        }

        view.afterRenderRows = function()
        {
          view.$tbody.find('tr[data-model-id="' + model.id + '"]')[0].firstElementChild.focus();
        };

        view.$tbodyInner[0].scrollTop = view.model.entries.filtered.indexOf(model) * view.ROW_HEIGHT;
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

      var serializedEntry = entry.serialize(view.model);
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

      var req = view.updateEditorValue(entry, column, arrayIndex, newValue);

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: view.t('msg:update:failure')
        });

        var serializedEntry = entry.serialize(view.model);

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

    updateEditorValue: function(entry, column, arrayIndex, newValue)
    {
      var data = entry.serialize(this.model);

      if (column._id === 'markerColor')
      {
        return this.model.settings.updateRowColor(data.storageBinRow, newValue);
      }

      return this.ajax({
        method: 'PATCH',
        url: entry.url(),
        data: JSON.stringify({
          property: column._id,
          arrayIndex: arrayIndex,
          newValue: newValue
        })
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

    expandTdValue: function(tdEl)
    {
      var valueEl = tdEl.firstElementChild;
      var innerEl = valueEl.firstElementChild;

      if (!innerEl)
      {
        return;
      }

      var text = innerEl.textContent.trim();

      if (!text.length)
      {
        return;
      }

      var tdRect = tdEl.getBoundingClientRect();
      var innerRect = innerEl.getBoundingClientRect();
      var windowWidth = window.innerWidth - 15 - this.SCROLLBAR_HEIGHT;
      var windowHeight = window.innerHeight - 15 - this.SCROLLBAR_HEIGHT;

      if (innerRect.left + innerRect.width < windowWidth && innerRect.width <= (tdRect.width - 8))
      {
        return;
      }

      var width = this.columns.map[tdEl.dataset.columnId].expand || tdRect.width;

      valueEl.style.width = width + 'px';

      if (tdRect.left + width > windowWidth)
      {
        valueEl.style.left = (windowWidth - (tdRect.left + width)) + 'px';
      }

      tdEl.classList.add('kanban-is-expanded');

      innerRect = valueEl.getBoundingClientRect();

      if (innerRect.top + innerRect.height > windowHeight)
      {
        valueEl.style.top = (windowHeight - (innerRect.top + innerRect.height)) + 'px';
      }
    },

    collapseTdValue: function()
    {
      var $expanded = this.$tbody.find('.kanban-is-expanded');

      if (!$expanded.length)
      {
        return;
      }

      $expanded.removeClass('kanban-is-expanded').find('.kanban-td-value').css({
        top: '',
        left: '',
        width: ''
      });
    },

    showTdPopover: function(td)
    {
      this.hideTdPopover();

      var cell = this.idCell({currentTarget: td});

      this.$popover = cell.column.popover(cell);
    },

    hideTdPopover: function()
    {
      if (this.$popover)
      {
        this.$popover.popover('destroy');
        this.$popover = null;
      }
    }

  });
});
