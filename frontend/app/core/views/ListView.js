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

    events: {
      'click .action-delete': function(e)
      {
        ActionFormView.showDeleteDialog({
          model: this.getModelFromEvent(e),
          labelProperty: this.labelProperty || '_id',
          nlsDomain: this.nlsDomain || 'core'
        });

        e.preventDefault();
      }
    },

    initialize: function()
    {
      /**
       * @private
       * @type {number}
       */
      this.lastRefreshAt = 0;

      this.setView('.pagination-container', new PaginationView({
        model: this.model.paginationData
      }));

      var view = this;

      this.listenTo(this.model.paginationData, 'change:page', function()
      {
        var y = view.$el.offset().top - 14;
        var $navbar = $('.navbar-fixed-top');

        if ($navbar.length)
        {
          y -= $navbar.outerHeight();
        }

        $('html, body').animate({scrollTop: y});
      });
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'reset', this.render);
    },

    refreshCollection: function()
    {
      var now = Date.now();
      var diff = now - this.lastRefreshAt;

      if (now - this.lastRefreshAt < 500)
      {
        this.timers.refreshCollection =
          setTimeout(this.refreshCollection.bind(this), 500 - diff);
      }
      else
      {
        this.lastRefreshAt = Date.now();

        this.model.fetch({reset: true});
      }
    },

    getModelFromEvent: function(e)
    {
      return this.model.get(
        this.$(e.target).closest('.list-item').attr('data-id')
      );
    }

  });

  ListView.actions = {
    viewDetails: function(model, nlsDomain)
    {
      return {
        id: 'viewDetails',
        icon: 'file-text-o',
        label: t(nlsDomain || 'core', 'LIST:ACTION:viewDetails'),
        href: model.genClientUrl()
      };
    },
    edit: function(model, nlsDomain)
    {
      return {
        id: 'edit',
        icon: 'edit',
        label: t(nlsDomain || 'core', 'LIST:ACTION:edit'),
        href: model.genClientUrl('edit')
      };
    },
    delete: function(model, nlsDomain)
    {
      return {
        id: 'delete',
        icon: 'times',
        label: t(nlsDomain || 'core', 'LIST:ACTION:delete'),
        href: model.genClientUrl('delete')
      };
    },
    viewEditDelete: function(collection, managePrivilege, nlsDomain)
    {
      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model, nlsDomain)];

        if (user.isAllowedTo(managePrivilege))
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
