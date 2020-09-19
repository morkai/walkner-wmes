// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../i18n',
  '../user',
  '../core/Model',
  '../core/util/transliterate',
  '../core/util/parseNumber',
  'app/kanban/templates/popover',
  'app/kanban/templates/containerPopover'
], function(
  _,
  $,
  t,
  user,
  Model,
  transliterate,
  parseNumber,
  popoverTemplate,
  containerPopoverTemplate
) {
  'use strict';

  var defaultValueExporter = function(v)
  {
    if (v == null)
    {
      return '';
    }

    var t = typeof v;

    if (t === 'number')
    {
      return (Math.round(v * 1000) / 1000).toString();
    }

    if (t === 'boolean')
    {
      return v ? '1' : '0';
    }

    if (t === 'object')
    {
      return JSON.stringify(v);
    }

    var s = v.toString();

    if (s.indexOf('\t') === -1)
    {
      return s;
    }

    return '"' + s.replace(/"/g, '""') + '"';
  };
  var defaultValueParser = function(value) { return value; };
  var defaultEditorValue = function(value) { return value; };
  var defaultTdClassName = function() { return ''; };
  var defaultTdValueRenderer = function(value) { return value; };
  var invalidTdClassName = function(value)
  {
    return value ? '' : 'kanban-is-invalid';
  };
  var invalidFifoTdClassName = function(value, column, arrayIndex, entry)
  {
    return value || entry.storageType === 100 ? '' : 'kanban-is-invalid';
  };

  var WORKSTATION_COUNT = 10;
  var VALIDATION_FILTER_PROPERTIES = {
    workstations: 'invalidWorkstations',
    locations: 'invalidLocations'
  };
  var COLUMNS = {
    _id: {
      width: 7,
      renderValue: function(value)
      {
        if (/[a-z]$/.test(value))
        {
          value = value.substring(0, value.length - 1)
            + '<span class="kanban-td-id-suffix">'
            + value.charAt(value.length - 1)
            + '</span>';
        }

        return value;
      }
    },
    nc12: {
      width: 13,
      renderValue: function(value, column, arrayIndex, entry)
      {
        if (!entry.description)
        {
          return value;
        }

        return '<a href="#kanban/components/' + value + '" target="_blank">' + value + '</a>';
      }
    },
    description: {
      width: 45,
      tdClassName: invalidTdClassName
    },
    supplyArea: {
      width: 12,
      tdClassName: invalidTdClassName,
      renderValue: function(value, column, arrayIndex, entry)
      {
        if (!entry.supplyAreaId)
        {
          return value;
        }

        return '<a href="#kanban/supplyAreas/' + entry.supplyAreaId + '" target="_blank">' + value + '</a>';
      }
    },
    workCenter: {
      width: 12,
      expand: 125,
      tdClassName: function()
      {
        return this.state.auth.manage || this.state.auth.processEngineer ? 'kanban-is-editable' : '';
      }
    },
    family: {
      width: 10
    },
    storageType: {
      type: 'integer',
      width: 6,
      rotated: true
    },
    kanbanQtyUser: {
      type: 'integer',
      width: 6,
      rotated: true,
      renderValue: function(value)
      {
        return value.toLocaleString().replace(/\s+/g, '');
      }
    },
    componentQty: {
      type: 'integer',
      width: 9,
      rotated: true,
      tdClassName: invalidFifoTdClassName
    },
    storageBin: {
      width: 10,
      rotated: true,
      tdClassName: invalidTdClassName
    },
    markerColor: {
      width: 3,
      rotated: true,
      expand: 150,
      tdClassName: function()
      {
        return this.state.auth.manage || this.state.auth.whman ? 'kanban-is-editable' : '';
      },
      renderValue: function(value, column, i, entry)
      {
        if (!value)
        {
          return '';
        }

        var color = this.state.settings.getMarkerColor(entry.markerColor);

        return '<span class="kanban-td-color-marker" style="background: ' + color.color + '"></span>'
          + '<span class="kanban-td-color-label">' + color.text + '</span>';
      },
      exportValue: function(value)
      {
        return value
          ? (t.has('kanban', 'color:' + value) ? t('kanban', 'color:' + value) : value)
          : '';
      }
    },
    newStorageBin: {
      width: 10,
      rotated: true
    },
    newMarkerColor: {
      width: 3,
      rotated: true,
      expand: 150,
      tdClassName: function()
      {
        return this.state.auth.manage || this.state.auth.whman ? 'kanban-is-editable' : '';
      },
      renderValue: function(value, column, i, entry)
      {
        if (!value)
        {
          return '';
        }

        var color = this.state.settings.getMarkerColor(entry.newMarkerColor);

        return '<span class="kanban-td-color-marker" style="background: ' + color.color + '"></span>'
          + '<span class="kanban-td-color-label">' + color.text + '</span>';
      },
      exportValue: function(value)
      {
        return value
          ? (t.has('kanban', 'color:' + value) ? t('kanban', 'color:' + value) : value)
          : '';
      }
    },
    kanbanId: {
      width: 10,
      expand: 186,
      tdClassName: function(value, column, arrayIndex, entry)
      {
        return value.length === 0 && entry.storageType !== 100 ? 'kanban-is-invalid' : '';
      },
      renderValue: function(value)
      {
        return value.join(' ');
      },
      exportValue: function(value)
      {
        return value.join(',');
      }
    },
    kanbanIdCount: {
      type: 'integer',
      width: 6,
      rotated: true,
      tdClassName: function(value, column, arrayIndex, entry)
      {
        return value === entry.emptyFullCount
          ? ''
          : value < entry.emptyFullCount
            ? 'kanban-is-invalid'
            : 'kanban-is-warning';
      },
      filters: {
        'kanbanIds:invalid': '$$.emptyFullCount == 0 || $ < $$.emptyFullCount || $ > $$.emptyFullCount',
        'kanbanIds:tooMany': '$$.emptyFullCount > 0 && $ > $$.emptyFullCount',
        'kanbanIds:tooFew': '$$.emptyFullCount != 0 && $ < $$.emptyFullCount'
      }
    },
    lineCount: {
      type: 'integer',
      width: 3,
      rotated: true
    },
    emptyFullCount: {
      type: 'integer',
      width: 7,
      rotated: true
    },
    stock: {
      type: 'integer',
      width: 7,
      rotated: true
    },
    maxBinQty: {
      type: 'integer',
      width: 7,
      rotated: true,
      tdClassName: invalidFifoTdClassName
    },
    minBinQty: {
      type: 'integer',
      width: 7,
      rotated: true,
      tdClassName: invalidFifoTdClassName
    },
    replenQty: {
      type: 'integer',
      width: 7,
      rotated: true,
      tdClassName: invalidFifoTdClassName
    },
    unit: {
      type: 'string',
      width: 4
    },
    kind: {
      width: 3,
      rotated: true,
      tdClassName: function(value, column, arrayIndex, entry)
      {
        var className = invalidFifoTdClassName(value, column, arrayIndex, entry);

        if (entry.storageType !== 100 && (this.state.auth.manage || this.state.auth.processEngineer))
        {
          className += ' kanban-is-editable';
        }

        return className;
      },
      renderValue: function(value)
      {
        return t('kanban', 'kind:' + value + ':short');
      },
      exportValue: function(value)
      {
        return t('kanban', 'kind:' + value + ':short');
      }
    },
    workstations: {
      width: 5,
      type: 'decimal',
      rowSpan: 1,
      colSpan: WORKSTATION_COUNT,
      arrayIndex: WORKSTATION_COUNT,
      sortable: false,
      tdClassName: function(value, column, i, entry)
      {
        var className = !entry.workstationsTotal || (!value && entry.locations[i]) ? 'kanban-is-invalid' : '';

        if (this.state.auth.manage || this.state.auth.processEngineer)
        {
          className += ' kanban-is-editable';
        }

        return className;
      },
      renderValue: function(value)
      {
        return value.toLocaleString();
      },
      editorValue: function(value)
      {
        return value.toLocaleString().replace(/\s+/g, '');
      },
      exportValue: function(value)
      {
        return this.editorValue(value);
      },
      parseValue: function(value)
      {
        return Math.min(99, Math.max(0, parseNumber(value)));
      }
    },
    container: {
      width: 10,
      tdClassName: function()
      {
        return this.state.auth.manage || this.state.auth.processEngineer || this.state.auth.leader
          ? 'kanban-is-editable'
          : '';
      },
      renderValue: function(value)
      {
        if (!value)
        {
          return '';
        }

        return '<a href="#kanban/containers/' + encodeURIComponent(value) + '" target="_blank">'
          + _.escape(value)
          + '</a>';
      },
      popover: function(cell)
      {
        if (!cell.value)
        {
          return null;
        }

        var container = this.state.containers.get(cell.value);
        var $td = $(cell.td).popover({
          container: 'body',
          placement: 'auto left',
          trigger: 'manual',
          html: true,
          title: container.get('name'),
          template: popoverTemplate({
            type: 'container'
          }),
          content: containerPopoverTemplate({
            container: container.toJSON()
          })
        });

        return $td.popover('show');
      },
      handleAltClick: function(cell)
      {
        if (cell.value)
        {
          window.open('/kanban/containers/' + encodeURIComponent(cell.value) + '.jpg');
        }
      }
    },
    locations: {
      width: 4,
      rowSpan: 1,
      colSpan: WORKSTATION_COUNT,
      arrayIndex: WORKSTATION_COUNT,
      sortable: false,
      tdClassName: function(value, column, i, entry)
      {
        var className = !entry.workstationsTotal || (!value && entry.workstations[i]) ? 'kanban-is-invalid' : '';

        if (this.state.auth.manage || this.state.auth.processEngineer || this.state.auth.leader)
        {
          className += ' kanban-is-editable';
        }

        return className;
      },
      parseValue: function(value)
      {
        value = String(value).toUpperCase();

        return /^[A-Z][0-9][0-9]$/.test(value) ? value : '';
      }
    },
    discontinued: {
      width: 3,
      rotated: true,
      tdClassName: function()
      {
        return this.state.auth.manage || this.state.auth.processEngineer ? 'kanban-is-editable' : '';
      },
      renderValue: function(value)
      {
        return '<i class="fa fa-' + (value ? 'check' : 'times') + '"></i>';
      },
      exportValue: function(value)
      {
        return value ? '1' : '0';
      }
    },
    comment: {
      width: 40,
      sortable: false,
      expand: 0,
      tdClassName: function()
      {
        return this.state.auth.manage || this.state.auth.processEngineer || this.state.auth.leader
          ? 'kanban-is-editable'
          : '';
      },
      renderValue: function(value)
      {
        return _.escape(value);
      },
      parseValue: function(value)
      {
        return String(value).trim();
      }
    }
  };

  return Model.extend({

    urlRoot: '/kanban/tableViews',

    clientUrlRoot: '#kanban/tableViews',

    topicPrefix: 'kanban.tableViews',

    privilegePrefix: 'KANBAN',

    nlsDomain: 'kanban',

    defaults: function()
    {
      return {
        name: '',
        columns: {},
        filterMode: 'and',
        filters: {},
        sort: {_id: 1}
      };
    },

    initialize: function(attrs, options)
    {
      this.state = options.state;
    },

    setUpPubsub: function(pubsub)
    {
      var tableView = this;

      pubsub.subscribe('kanban.tableViews.edited', function(message)
      {
        if (message.model._id === tableView.id)
        {
          tableView.handleEditMessage(message.model);
        }
      });
    },

    getHiddenColumns: function()
    {
      return Object.keys(this.attributes.columns);
    },

    hasAnyHiddenColumn: function()
    {
      return this.getHiddenColumns().length > 0;
    },

    getVisibility: function(columnId)
    {
      return this.attributes.columns[columnId] !== false;
    },

    setVisibility: function(columnId, newState)
    {
      if (newState)
      {
        delete this.attributes.columns[columnId];
      }
      else
      {
        this.attributes.columns[columnId] = false;
      }

      this.trigger('change:visibility', this, columnId, {});
      this.trigger('change:columns', this, this.attributes.columns, {});
      this.trigger('change', this, {save: true});
    },

    getFilterMode: function()
    {
      return this.get('filterMode');
    },

    setFilterMode: function(filterMode)
    {
      this.set('filterMode', filterMode, {save: true});
    },

    hasAnyFilter: function()
    {
      return Object.keys(this.attributes.filters).length > 0;
    },

    getFilter: function(columnId)
    {
      return this.attributes.filters[columnId] || null;
    },

    setFilter: function(columnId, filter)
    {
      if (filter)
      {
        this.attributes.filters[columnId] = filter;
      }
      else
      {
        delete this.attributes.filters[columnId];
      }

      this.trigger('change:filter', this, columnId, {});
      this.trigger('change:filters', this, this.attributes.filters, {});
      this.trigger('change', this, {save: true});
    },

    setFilters: function(newFilters)
    {
      var tableView = this;
      var oldFilters = tableView.attributes.filters;

      tableView.attributes.filters = newFilters;

      Object.keys(oldFilters).forEach(function(columnId)
      {
        if (!newFilters[columnId])
        {
          tableView.trigger('change:filter', tableView, columnId, {});
        }
      });

      Object.keys(newFilters).forEach(function(columnId)
      {
        tableView.trigger('change:filter', tableView, columnId, {});
      });

      tableView.trigger('change:filters', tableView, tableView.attributes.filters, {});
      tableView.trigger('change', tableView, {save: true});
    },

    clearFilters: function()
    {
      var tableView = this;
      var oldFilters = tableView.attributes.filters;

      tableView.attributes.filters = {};

      Object.keys(oldFilters).forEach(function(columnId)
      {
        tableView.trigger('change:filter', tableView, columnId, {});
      });

      tableView.trigger('change:filters', tableView, tableView.attributes.filters, {});
      tableView.trigger('change', tableView, {save: true});
    },

    getSortOrder: function(columnId)
    {
      return this.attributes.sort[columnId] || 0;
    },

    setSortOrder: function(columnId, order)
    {
      var tableView = this;
      var oldFilters = tableView.attributes.sort;

      tableView.attributes.sort = {};

      Object.keys(oldFilters).forEach(function(columnId)
      {
        tableView.trigger('change:order', tableView, columnId, {});
      });

      tableView.attributes.sort[columnId] = order;

      tableView.trigger('change:order', tableView, columnId, {});
      tableView.trigger('change:sort', tableView, tableView.attributes.sort, {});
      tableView.trigger('change', tableView, {save: true});
    },

    getColumnText: function(columnId, arrayIndex, stripBr)
    {
      var n = 0;

      if (arrayIndex >= 0)
      {
        n = arrayIndex + 1;
        columnId += 'N';
      }

      var text = stripBr !== false && t.has('kanban', 'column:' + columnId + ':title')
        ? t('kanban', 'column:' + columnId + ':title', {n: n})
        : t('kanban', 'column:' + columnId, {n: n});

      return stripBr === false ? text : text
        .replace(/\n/g, '<br>')
        .replace(/<br>/g, ' ')
        .replace(/\s+/, ' ');
    },

    serializeColumns: function()
    {
      var tableView = this;
      var columns = {
        list: [],
        map: []
      };

      Object.keys(COLUMNS).forEach(function(columnId)
      {
        var column = tableView.serializeColumn(columnId);

        if (column.visible)
        {
          columns.list.push(column);
        }

        columns.map[columnId] = column;
      });

      return columns;
    },

    serializeColumn: function(columnId)
    {
      var column = _.assign(
        {
          state: this.state,
          _id: columnId,
          type: 'string',
          thClassName: '',
          labelClassName: '',
          tdClassName: defaultTdClassName,
          valueClassName: defaultTdClassName,
          arrayIndex: 0,
          rowSpan: 2,
          colSpan: 1,
          visible: this.getVisibility(columnId),
          sortOrder: this.getSortOrder(columnId),
          filter: this.getFilter(columnId),
          rotated: false,
          sortable: true,
          withMenu: true,
          label: t.bound('kanban', 'column:' + columnId),
          title: t.has('kanban', 'column:' + columnId + ':title')
            ? t.bound('kanban', 'column:' + columnId + ':title')
            : '',
          renderValue: defaultTdValueRenderer,
          exportValue: defaultValueExporter,
          editorValue: defaultEditorValue,
          parseValue: defaultValueParser
        },
        COLUMNS[columnId]
      );

      if (column.rotated && !column.title)
      {
        column.title = column.label;
      }

      var thClassName = [];
      var labelClassName = [];

      if (column.withMenu) { thClassName.push('kanban-is-with-menu'); }
      if (column.filter) { thClassName.push('kanban-is-filtered'); }
      if (column.sortOrder) { thClassName.push('kanban-is-' + (column.sortOrder === 1 ? 'asc' : 'desc')); }
      if (column.rotated) { labelClassName.push('kanban-is-rotated'); }

      column.thClassName = thClassName.join(' ');
      column.labelClassName = labelClassName.join(' ');

      return column;
    },

    createSort: function(options)
    {
      var sortProperties = _.keys(this.attributes.sort);
      var sortOrders = _.values(this.attributes.sort);

      if (!_.includes(sortProperties, '_id'))
      {
        sortProperties.push('_id');
        sortOrders.push(1);
      }

      function sort(i, aObj, bObj)
      {
        if (i === sortProperties.length)
        {
          return 0;
        }

        var sortProperty = sortProperties[i];
        var sortOrder = sortOrders[i];

        var aVal = aObj[sortProperty];
        var bVal = bObj[sortProperty];

        if (aVal === null)
        {
          if (bVal === null)
          {
            return sort(i + 1, aObj, bObj);
          }

          return sortOrder === 1 ? -1 : 1;
        }
        else if (bVal === null)
        {
          return sortOrder === 1 ? 1 : -1;
        }

        var type = typeof aVal;
        var cmp = 0;

        if (type === 'number')
        {
          cmp = sortOrder === 1 ? (aVal - bVal) : (bVal - aVal);
        }
        else if (type === 'string')
        {
          cmp = sortOrder === 1 ? aVal.localeCompare(bVal || '') : (bVal || '').localeCompare(aVal);
        }

        return cmp === 0 ? sort(i + 1, aObj, bObj) : cmp;
      }

      return function(a, b)
      {
        return sort(0, a.serialize(options), b.serialize(options));
      };
    },

    createFilter: function(options)
    {
      var all = this.get('filterMode') === 'and';
      var filters = this.compileFilters(this.get('filters'));

      if (filters.length === 0)
      {
        return function(a) { return a.attributes.deleted !== true; };
      }

      return function(a)
      {
        if (a.attributes.deleted)
        {
          return false;
        }

        a = a.serialize(options);

        var i;
        var filter;

        if (all)
        {
          for (i = 0; i < filters.length; ++i)
          {
            filter = filters[i];

            if (!filter.check(a[filter.columnId], a))
            {
              return false;
            }
          }

          return true;
        }

        for (i = 0; i < filters.length; ++i)
        {
          filter = filters[i];

          if (filter.check(a[filter.columnId], a))
          {
            return true;
          }
        }

        return false;
      };
    },

    compileFilters: function(filterMap)
    {
      var tableView = this;
      var filterList = [];

      _.forEach(filterMap, function(filter, columnId)
      {
        filterList.push({
          columnId: columnId,
          check: tableView.compileFilter(columnId, filter)
        });
      });

      return filterList;
    },

    compileFilter: function(columnId, filter)
    {
      if (!filter.check)
      {
        filter.check = this.filterCompilers[filter.type](filter.data, columnId);
      }

      return filter.check;
    },

    filterCompilers: {
      empty: function()
      {
        return function($)
        {
          return $ === undefined || $ === null || $ === 0 || $.length === 0;
        };
      },
      notEmpty: function()
      {
        return function($)
        {
          return $ !== undefined && $ !== null && $ !== 0 && $.length !== 0;
        };
      },
      eval: function(code)
      {
        if (code === '?')
        {
          return this.empty();
        }

        if (code === '!')
        {
          return this.notEmpty();
        }

        var evalFilter = function() { return true; };

        try
        {
          eval('evalFilter = function($, $$) { return ' + code + '; }'); // eslint-disable-line no-eval
        }
        catch (err)
        {
          console.warn('Invalid eval filter:', code);
        }

        return evalFilter;
      },
      numeric: function(code)
      {
        if (code === '?')
        {
          return this.empty();
        }

        if (code === '!')
        {
          return this.notEmpty();
        }

        if (code.indexOf('$$') !== -1)
        {
          return this.eval(code);
        }

        var numericFilter = function() { return true; };

        if (/^[0-9]+$/.test(code))
        {
          code = '=' + code;
        }

        if (code.indexOf('$') === -1)
        {
          code = '$' + code;
        }

        code = code
          .replace(/={2,}/g, '=')
          .replace(/([^<>])=/g, '$1==')
          .replace(/<>/g, '!=');

        try
        {
          eval('numericFilter = function($) { return ' + code + '; }'); // eslint-disable-line no-eval
        }
        catch (err)
        {
          console.warn('Invalid numeric filter:', code);
        }

        return numericFilter;
      },
      text: function(code)
      {
        if (code === '?')
        {
          return this.empty();
        }

        if (code === '!')
        {
          return this.notEmpty();
        }

        if (code.indexOf('$$') !== -1)
        {
          return this.eval(code);
        }

        var textFilter = function() { return true; };

        if (/^\/.*?\/$/.test(code))
        {
          code = 'return ' + code + 'i.test($)';
        }
        else
        {
          var words = transliterate(code)
            .replace(/[^A-Za-z0-9 ]+/g, '')
            .toUpperCase()
            .split(' ')
            .filter(function(word) { return word.length > 0; });

          if (!words.length)
          {
            return textFilter;
          }

          code = '$ = String($).replace(/[^A-Za-z0-9]+/g, "").toUpperCase(); return ' + words
            .map(function(word) { return '$.indexOf(' + JSON.stringify(word) + ') !== -1'; })
            .join(' && ');
        }

        try
        {
          eval('textFilter = function($) { ' + code + '; }'); // eslint-disable-line no-eval
        }
        catch (err)
        {
          console.warn('Invalid text filter:', code);
        }

        return textFilter;
      },
      select: function(data, columnId)
      {
        var validationProperty = VALIDATION_FILTER_PROPERTIES[columnId];

        if (validationProperty)
        {
          var requiredValue = data[0] === 'invalid';

          return function($, $$)
          {
            return $$[validationProperty] === requiredValue;
          };
        }

        return function($)
        {
          return data.indexOf($ == undefined ? '' : String($)) !== -1; // eslint-disable-line eqeqeq
        };
      }
    },

    handleEditMessage: function(data) // eslint-disable-line no-unused-vars
    {
      // TODO
    }

  });
});
