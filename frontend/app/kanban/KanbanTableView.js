// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../user',
  '../core/Model'
], function(
  _,
  t,
  user,
  Model
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
  var invalidTdClassName = function(value) { return value ? '' : 'kanban-is-invalid'; };

  var COLUMNS = {
    _id: {
      exportValue: function(value)
      {
        return '"' + value + '"';
      }
    },
    nc12: {
      renderValue: function(value, column, arrayIndex, entry)
      {
        if (!entry.description)
        {
          return value;
        }

        return '<a href="#kanban/components/' + value + '" target="_blank">' + value + '</a>';
      },
      exportValue: function(value)
      {
        return '"' + value + '"';
      }
    },
    description: {
      tdClassName: invalidTdClassName
    },
    supplyArea: {
      tdClassName: invalidTdClassName,
      renderValue: function(value, column, arrayIndex, entry)
      {
        if (!entry.family)
        {
          return value;
        }

        return '<a href="#kanban/supplyAreas/' + value + '" target="_blank">' + value + '</a>';
      }
    },
    family: {
      tdClassName: invalidTdClassName
    },
    kanbanQtyUser: {
      rotated: true
    },
    componentQty: {
      rotated: true,
      tdClassName: invalidTdClassName
    },
    storageBin: {
      rotated: true,
      tdClassName: invalidTdClassName
    },
    kanbanIdEmpty: {
      tdClassName: invalidTdClassName
    },
    kanbanIdFull: {
      tdClassName: invalidTdClassName
    },
    lineCount: {
      rotated: true
    },
    emptyFullCount: {
      rotated: true
    },
    stock: {
      rotated: true
    },
    maxBinQty: {
      rotated: true,
      tdClassName: invalidTdClassName
    },
    minBinQty: {
      rotated: true,
      tdClassName: invalidTdClassName
    },
    replenQty: {
      rotated: true,
      tdClassName: invalidTdClassName
    },
    kind: {
      rotated: true,
      tdClassName: function(value)
      {
        var className = invalidTdClassName(value);

        if (this.state.auth.manage || this.state.auth.processEngineer)
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
      rowSpan: 1,
      colSpan: 6,
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
      parseValue: function(value)
      {
        return Math.min(99, Math.max(0, parseInt(value, 10) || 0));
      }
    },
    locations: {
      rowSpan: 1,
      colSpan: 6,
      sortable: false,
      tdClassName: function(value, column, i, entry)
      {
        var className = !entry.workstationsTotal || (!value && entry.workstations[i]) ? 'kanban-is-invalid' : '';

        if (this.state.auth.manage || this.state.auth.processEngineer)
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
      rotated: true,
      tdClassName: function()
      {
        return this.state.auth.manage || this.state.auth.processEngineer ? 'kanban-is-editable' : '';
      },
      renderValue: function(value)
      {
        return '<i class="fa fa-' + (value ? 'check' : 'times') + '"></i>';
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
      this.attributes.filters[columnId] = filter;

      this.trigger('change:filter', this, columnId, {});
      this.trigger('change:filters', this, this.attributes.filters, {});
      this.trigger('change', this, {save: true});
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

    getColumnText: function(columnId)
    {
      var text = t.has('kanban', 'column:' + columnId + ':title')
        ? t('kanban', 'column:' + columnId + ':title')
        : t('kanban', 'column:' + columnId);

      return text
        .replace(/\n/g, ' ')
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
          thClassName: '',
          labelClassName: '',
          tdClassName: defaultTdClassName,
          valueClassName: defaultTdClassName,
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
      var filterMode = this.get('filterMode');
      var filters = this.get('filters');

      return function(a)
      {
        a = a.serialize(options);

        return true;
      };
    },

    handleEditMessage: function(data)
    {
      // TODO
      console.log('TableView edited:', data);
    }

  });
});
