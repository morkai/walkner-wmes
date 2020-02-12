// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  '../View',
  './ActionFormView',
  './PaginationView',
  'app/core/templates/list'
], function(
  _,
  $,
  t,
  user,
  View,
  ActionFormView,
  PaginationView,
  listTemplate
) {
  'use strict';

  var ListView = View.extend({

    template: listTemplate,

    tableClassName: 'table-bordered table-hover table-condensed',

    paginationOptions: {},

    refreshDelay: 5000,

    remoteTopics: function()
    {
      var topics = {};
      var topicPrefix = this.collection.getTopicPrefix();

      if (topicPrefix)
      {
        topics[topicPrefix + '.added'] = 'refreshCollection';
        topics[topicPrefix + '.edited'] = 'refreshCollection';
        topics[topicPrefix + '.deleted'] = 'onModelDeleted';
      }

      return topics;
    },

    events: {
      'click .list-item[data-id]': function(e)
      {
        if (e.target.classList.contains('actions-group'))
        {
          return false;
        }

        if (this.isNotClickable(e))
        {
          return;
        }

        var url = this.collection.get(e.currentTarget.dataset.id).genClientUrl();

        if (e.ctrlKey)
        {
          window.open(url);
        }
        else if (!e.altKey)
        {
          this.broker.publish('router.navigate', {
            url: url,
            trigger: true,
            replace: false
          });
        }
      },
      'mousedown .list-item[data-id]': function(e)
      {
        if (!this.isNotClickable(e) && e.button === 1)
        {
          e.preventDefault();
        }
      },
      'mouseup .list-item[data-id]': function(e)
      {
        if (this.isNotClickable(e) || e.button !== 1)
        {
          return;
        }

        window.open(this.collection.get(e.currentTarget.dataset.id).genClientUrl());

        return false;
      },
      'click .action-delete': function(e)
      {
        e.preventDefault();

        ActionFormView.showDeleteDialog({model: this.getModelFromEvent(e)});
      }
    },

    initialize: function()
    {
      this.refreshReq = null;
      this.lastRefreshAt = 0;

      this.listenTo(this.collection, 'sync', function()
      {
        this.lastRefreshAt = Date.now();
      });

      this.once('afterRender', function()
      {
        this.listenTo(this.collection, 'reset', this.onReset);
      });

      if (this.collection.paginationData)
      {
        this.paginationView = new PaginationView(_.assign(
          {replaceUrl: !!this.options.replaceUrl},
          this.paginationOptions,
          this.options.pagination,
          {model: this.collection.paginationData}
        ));

        this.setView('.pagination-container', this.paginationView);

        this.listenTo(this.collection.paginationData, 'change:page', this.scrollTop);
      }
    },

    destroy: function()
    {
      this.paginationView = null;
    },

    serialize: function()
    {
      return _.assign(View.prototype.serialize.apply(this, arguments), {
        columns: this.decorateColumns(this.serializeColumns()),
        actions: this.serializeActions(),
        rows: this.serializeRows(),
        className: _.result(this, 'className'),
        tableClassName: _.result(this, 'tableClassName'),
        noData: this.options.noData || t('core', 'LIST:NO_DATA'),
        panel: this.options.panel,
        renderValue: function(column, row)
        {
          if (row[column.valueProperty] == null)
          {
            if (column.noData == null)
            {
              return '<em>' + t('core', 'LIST:NO_DATA:cell') + '</em>';
            }

            return column.noData;
          }

          if (typeof column.tdDecorator === 'function')
          {
            return column.tdDecorator(column.id, row[column.valueProperty], row, column);
          }

          return row[column.valueProperty];
        }
      });
    },

    serializeColumns: function()
    {
      var columns = this.options.columns || this.columns;

      if (typeof columns === 'function')
      {
        columns = columns.call(this);
      }

      if (!Array.isArray(columns))
      {
        columns = [];
      }

      return columns;
    },

    decorateColumns: function(columns)
    {
      var view = this;
      var nlsDomain = view.collection.getNlsDomain();

      return columns.map(function(column)
      {
        if (!column)
        {
          return null;
        }

        if (column === '-')
        {
          column = {id: 'filler', label: ''};
        }
        else if (typeof column === 'string')
        {
          column = {id: column};
        }

        if (column.visible === false)
        {
          return null;
        }

        if (!column.valueProperty)
        {
          column.valueProperty = column.id;
        }

        if (!column.label && column.label !== '')
        {
          var labelKey = 'LIST:COLUMN:' + column.id;

          if (!t.has(nlsDomain, labelKey))
          {
            labelKey = 'PROPERTY:' + column.id;
          }

          column.label = t.bound(nlsDomain, labelKey);
        }

        ['th', 'td'].forEach(function(prefix)
        {
          var prop = prefix + 'Attrs';
          var _prop = '_' + prop;
          var attrs = column[_prop] || column[prop];

          if (_.isFunction(attrs) || (_.isObject(attrs) && !_.isArray(attrs)))
          {
            // OK
          }
          else
          {
            attrs = {};
          }

          if (!column[_prop])
          {
            column[_prop] = attrs;
          }

          column[prop] = view.decorateAttrs.bind(view, prefix, column[_prop]);
        });

        return column;
      }).filter(function(column) { return column !== null; });
    },

    decorateAttrs: function(prefix, attrs, row, column)
    {
      if (prefix === 'th')
      {
        column = row;
        row = {};
      }

      if (_.isFunction(attrs))
      {
        attrs = prefix === 'th' ? attrs(column) : attrs(row, column);
      }

      var className = [];

      if (_.isArray(attrs.className))
      {
        className = className.concat(attrs.className);
      }
      else if (_.isString(attrs.className))
      {
        className.push(attrs.className);
      }

      className.push(
        _.result(column, 'className'),
        _.result(column, prefix + 'ClassName')
      );

      className = className.filter(function(cn) { return !!cn; }).join(' ');

      var htmlAttrs = [];

      if (className.length)
      {
        htmlAttrs.push('class="' + className + '"');
      }

      if (!attrs.title)
      {
        if (!column.titleProperty && prefix === 'td' && className.indexOf('is-overflow') !== -1)
        {
          column.titleProperty = column.id;
        }

        if (column.titleProperty)
        {
          attrs.title = row[column.titleProperty];
        }
      }

      if (attrs.title)
      {
        attrs.title = attrs.title.replace(/<\/?[a-z].*?>/g, '');
      }

      if (column.width)
      {
        if (!attrs.style)
        {
          attrs.style = {};
        }

        attrs.style.width = column.width;
      }

      Object.keys(attrs).forEach(function(key)
      {
        if (key === 'className')
        {
          return;
        }

        var value = attrs[key];

        if (_.isFunction(value))
        {
          value = value(key, attrs, row, column);
        }

        if (_.isArray(value))
        {
          value = value.join(' ');
        }
        else if (key === 'style' && _.isObject(value))
        {
          var style = [];

          Object.keys(value).forEach(function(k)
          {
            style.push(k + ': ' + value[k]);
          });

          value = style.join('; ');
        }

        if (key.charAt(0) === '!')
        {
          key = key.substring(1);
        }
        else
        {
          value = _.escape(value);
        }

        htmlAttrs.push(key + '="' + value + '"');
      });

      return htmlAttrs.join(' ');
    },

    serializeActions: function()
    {
      return ListView.actions.viewEditDelete(this.collection);
    },

    serializeRows: function()
    {
      return this.collection.map(this.options.serializeRow || this.serializeRow, this);
    },

    serializeRow: function(model)
    {
      if (typeof model.serializeRow === 'function')
      {
        return model.serializeRow();
      }

      if (typeof model.serialize === 'function')
      {
        return model.serialize();
      }

      return model.toJSON();
    },

    onModelDeleted: function(message)
    {
      if (!message)
      {
        return;
      }

      var model = message.model || message;

      if (!model._id)
      {
        return;
      }

      this.$('.list-item[data-id="' + model._id + '"]').addClass('is-deleted');

      this.refreshCollection(model);
    },

    onReset: function()
    {
      this.render();
    },

    $row: function(rowId)
    {
      return this.$('tr[data-id="' + rowId + '"]');
    },

    $cell: function(rowId, columnId)
    {
      return this.$('tr[data-id="' + rowId + '"] > td[data-id="' + columnId + '"]');
    },

    refreshCollection: function(message)
    {
      if (message && this.timers.refreshCollection)
      {
        return;
      }

      var now = Date.now();

      if (now - this.lastRefreshAt > this.refreshDelay)
      {
        this.lastRefreshAt = now;
        this.refreshCollectionNow();
      }
      else
      {
        this.timers.refreshCollection = setTimeout(this.refreshCollectionNow.bind(this), this.refreshDelay);
      }
    },

    refreshCollectionNow: function(options)
    {
      if (!this.timers)
      {
        return;
      }

      if (this.timers.refreshCollection)
      {
        clearTimeout(this.timers.refreshCollection);
      }

      delete this.timers.refreshCollection;

      if (this.refreshReq)
      {
        this.refreshReq.abort();
      }

      var view = this;
      var req = this.promised(this.collection.fetch(_.isObject(options) ? options : {reset: true}));

      req.always(function()
      {
        if (view.refreshReq === req)
        {
          view.refreshReq.abort();
          view.refreshReq = null;
        }
      });

      this.refreshReq = req;
    },

    scrollTop: function()
    {
      var y = this.$el.offset().top - 14;
      var $navbar = $('.navbar-fixed-top');

      if ($navbar.length)
      {
        y -= $navbar.outerHeight();
      }

      if (window.scrollY > y)
      {
        $('html, body').stop(true, false).animate({scrollTop: y});
      }
    },

    getModelFromEvent: function(e)
    {
      return this.collection.get(this.$(e.target).closest('.list-item').attr('data-id'));
    },

    isNotClickable: function(e)
    {
      var listEl = this.el.classList.contains('list') ? this.el : this.el.querySelector('.list');
      var targetEl = e.target;
      var tagName = targetEl.tagName;

      return !listEl.classList.contains('is-clickable')
        || tagName === 'A'
        || tagName === 'INPUT'
        || tagName === 'BUTTON'
        || targetEl.classList.contains('actions')
        || window.getSelection().toString() !== ''
        || (tagName !== 'TD' && this.$(targetEl).closest('a, input, button').length);
    }

  });

  function getLabel(model, nlsDomain, key)
  {
    if (!nlsDomain)
    {
      nlsDomain = model.getNlsDomain();
    }

    if (t.has(nlsDomain, key))
    {
      return t(nlsDomain, key);
    }

    return t('core', key);
  }

  ListView.actions = {
    viewDetails: function(model, nlsDomain)
    {
      return {
        id: 'viewDetails',
        icon: 'file-text-o',
        label: getLabel(model, nlsDomain, 'LIST:ACTION:viewDetails'),
        href: model.genClientUrl()
      };
    },
    edit: function(model, nlsDomain)
    {
      return {
        id: 'edit',
        icon: 'edit',
        label: getLabel(model, nlsDomain, 'LIST:ACTION:edit'),
        href: model.genClientUrl('edit')
      };
    },
    delete: function(model, nlsDomain)
    {
      return {
        id: 'delete',
        icon: 'times',
        label: getLabel(model, nlsDomain, 'LIST:ACTION:delete'),
        href: model.genClientUrl('delete')
      };
    },
    viewEditDelete: function(collection, privilegePrefix, nlsDomain)
    {
      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model, nlsDomain)];

        if (user.isAllowedTo((privilegePrefix || model.getPrivilegePrefix()) + ':MANAGE'))
        {
          actions.push(
            ListView.actions.edit(model, nlsDomain),
            ListView.actions.delete(model, nlsDomain)
          );
        }

        return actions;
      };
    }
  };

  return ListView;
});
