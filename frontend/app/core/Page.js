define([
  'backbone',
  'app/broker',
  'app/pubsub',
  'app/socket',
  'app/i18n',
  './util',
  './View',
  './views/ActionFormView'
], function(
  Backbone,
  broker,
  socket,
  pubsub,
  t,
  util,
  View,
  ActionFormView
) {
  'use strict';

  return View.extend({

  });

  function Page(options)
  {
    this.options = options || {};

    util.defineSandboxedProperty(this, 'broker', broker);
    util.defineSandboxedProperty(this, 'socket', socket);
    util.defineSandboxedProperty(this, 'pubsub', pubsub);

    util.subscribeTopics(this, 'broker', this.topics, true);
    util.subscribeTopics(this, 'pubsub', this.remoteTopics, true);

    if (typeof this.breadcrumbs === 'function')
    {
      this.breadcrumbs = this.breadcrumbs.bind(this);
    }

    if (typeof this.actions === 'function')
    {
      this.actions = this.actions.bind(this);
    }

    if (typeof this.initialize === 'function')
    {
      this.initialize(this.options);
    }
  }

  Page.actions = {
    add: function(collection, privilege)
    {
      return {
        label: t.bound(collection.model.prototype.nlsDomain || 'core', 'PAGE_ACTION:add'),
        icon: 'plus',
        href: collection.genClientUrl('add'),
        privileges: privilege
      };
    },
    edit: function(model, privilege)
    {
      return {
        label: t.bound(model.nlsDomain || 'core', 'PAGE_ACTION:edit'),
        icon: 'edit',
        href: model.genClientUrl('edit'),
        privileges: privilege
      };
    },
    delete: function(model, privilege)
    {
      return {
        label: t.bound(model.nlsDomain || 'core', 'PAGE_ACTION:delete'),
        icon: 'times',
        href: model.genClientUrl('delete'),
        privileges: privilege,
        callback: function(e)
        {
          if (e.button === 0)
          {
            e.preventDefault();

            ActionFormView.showDeleteDialog({model: model});
          }
        }
      };
    }
  };

  Page.prototype.render = function() {};

  return Page;
});
