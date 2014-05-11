// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  'app/i18n',
  'app/user',
  '../View',
  './ActionFormView',
  './PaginationView',
  'app/core/templates/list'
], function(
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

    remoteTopics: function()
    {
      var topics = {};
      var topicPrefix = this.collection.getTopicPrefix();

      topics[topicPrefix + '.added'] = 'refreshCollection';
      topics[topicPrefix + '.edited'] = 'refreshCollection';
      topics[topicPrefix + '.deleted'] = 'onModelDeleted';

      return topics;
    },

    events: {
      'click .action-delete': function(e)
      {
        e.preventDefault();

        ActionFormView.showDeleteDialog({model: this.getModelFromEvent(e)});
      }
    },

    initialize: function()
    {
      if (this.collection.paginationData)
      {
        this.setView('.pagination-container', new PaginationView({
          model: this.collection.paginationData
        }));

        this.listenTo(this.collection.paginationData, 'change:page', this.scrollTop);
      }
    },

    serialize: function()
    {
      return {
        columns: this.serializeColumns(),
        actions: this.serializeActions(),
        rows: this.serializeRows(),
        className: this.className
      };
    },

    serializeColumns: function()
    {
      var nlsDomain = this.collection.getNlsDomain();
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

      return columns.map(function(propertyName)
      {
        return {id: propertyName, label: t(nlsDomain, 'PROPERTY:' + propertyName)};
      });
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
      if (!message || !message.model || !message.model._id)
      {
        return;
      }

      this.$('.list-item[data-id="' + message.model._id + '"]').addClass('is-deleted');

      this.refreshCollection(message);
    },

    refreshCollection: function(message)
    {
      if (message && this.timers.refreshCollection)
      {
        return;
      }

      if (message)
      {
        this.timers.refreshCollection = setTimeout(this.refreshCollectionNow.bind(this), 2000);
      }
      else
      {
        this.refreshCollectionNow();
      }
    },

    refreshCollectionNow: function()
    {
      if (this.timers.refreshCollection)
      {
        clearTimeout(this.timers.refreshCollection);
      }

      delete this.timers.refreshCollection;

      this.promised(this.collection.fetch({reset: true}));
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
