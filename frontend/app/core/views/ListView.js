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
      return {
        columns: this.decorateColumns(this.serializeColumns()),
        actions: this.serializeActions(),
        rows: this.serializeRows(),
        className: _.result(this, 'className'),
        tableClassName: _.result(this, 'tableClassName'),
        noData: this.options.noData || t('core', 'LIST:NO_DATA'),
        panel: this.options.panel
      };
    },

    serializeColumns: function()
    {
      var columns;

      if (Array.isArray(this.options.columns))
      {
        columns = this.options.columns;
      }
      else if (Array.isArray(this.columns))
      {
        columns = this.columns;
      }
      else
      {
        columns = [];
      }

      return columns;
    },

    decorateColumns: function(columns)
    {
      var nlsDomain = this.collection.getNlsDomain();

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
          column = {id: column, label: t.bound(nlsDomain, 'PROPERTY:' + column)};
        }

        if (!column.label && column.label !== '')
        {
          column.label = t.bound(nlsDomain, 'PROPERTY:' + column.id);
        }

        if (!column.thAttrs)
        {
          column.thAttrs = '';
        }

        if (!column.tdAttrs)
        {
          column.tdAttrs = '';
        }

        if (column.className || column.thClassName || column.tdClassName)
        {
          column.thAttrs += ' class="' + (column.className || '') + ' ' + (column.thClassName || '') + '"';
          column.tdAttrs += ' class="' + (column.className || '') + ' ' + (column.tdClassName || '') + '"';
        }

        return column;
      }).filter(function(column) { return column !== null; });
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

    beforeRender: function()
    {
      this.stopListening(this.collection, 'reset', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.collection, 'reset', this.render);
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
