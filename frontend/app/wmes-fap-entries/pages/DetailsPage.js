// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/socket',
  'app/core/pages/DetailsPage',
  'app/core/util/onModelDeleted',
  'app/core/util/pageActions',
  '../dictionaries',
  '../views/DetailsView'
], function(
  socket,
  DetailsPage,
  onModelDeleted,
  pageActions,
  dictionaries,
  DetailsView
) {
  'use strict';

  return DetailsPage.extend({

    DetailsView: DetailsView,

    remoteTopics: function()
    {
      var topics = {
        'fap.entries.deleted': 'onDeleted'
      };

      topics['fap.entries.updated.' + this.model.id] = 'onUpdated';
      topics['fap.entries.presence.' + this.model.id] = 'onPresence';

      return topics;
    },

    localTopics: {
      'socket.connected': 'join'
    },

    actions: function()
    {
      var actions = [];
      var auth = this.model.serializeDetails().auth;

      if (auth.restart && this.model.get('status') === 'finished')
      {
        actions.push({
          type: 'info',
          icon: 'thumbs-down',
          label: this.t('PAGE_ACTION:restart'),
          callback: this.restart.bind(this)
        });
      }
      else if (auth.status && this.model.get('status') === 'started')
      {
        actions.push({
          type: 'success',
          icon: 'thumbs-up',
          label: this.t('PAGE_ACTION:finish'),
          callback: this.finish.bind(this)
        });
      }

      if (auth.delete)
      {
        actions.push(pageActions.delete(this.model, false));
      }

      return actions;
    },

    initialize: function()
    {
      DetailsPage.prototype.initialize.apply(this, arguments);

      this.listenTo(this.model, 'updateFailure', function()
      {
        this.model.fetch();
      });

      this.listenToOnce(this.model, 'sync', function()
      {
        this.listenTo(this.model, 'sync', this.render);
      });

      this.listenTo(this.model, 'change:status', this.updateStatus);
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    destroy: function()
    {
      this.leave();

      dictionaries.unload();
    },

    load: function(when)
    {
      return when(this.model.fetch(), dictionaries.load());
    },

    afterRender: function()
    {
      DetailsPage.prototype.afterRender.apply(this, arguments);

      dictionaries.load();

      this.join();
    },

    join: function()
    {
      this.socket.emit('fap.entries.join', this.model.id);
    },

    leave: function()
    {
      this.socket.emit('fap.entries.leave', this.model.id);
    },

    finish: function()
    {
      this.model.change('status', 'finished');
    },

    restart: function()
    {
      this.model.change('status', 'started');
    },

    updateStatus: function()
    {
      if (this.layout)
      {
        this.layout.setActions(this.actions, this);
      }
    },

    onDeleted: function(message)
    {
      onModelDeleted(this.broker, this.model, message);
    },

    onUpdated: function(message)
    {
      if (message._id === this.model.id && socket.getId() !== message.socketId)
      {
        this.model.handleChange(message.change);
      }
    },

    onPresence: function(message)
    {
      this.model.handlePresence(message.userId, message.presence);
    }

  });
});
