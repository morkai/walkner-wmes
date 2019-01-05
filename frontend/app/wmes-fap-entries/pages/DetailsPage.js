// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/socket',
  'app/core/pages/DetailsPage',
  'app/core/util/onModelDeleted',
  'app/core/util/pageActions',
  '../dictionaries',
  '../views/DetailsView'
], function(
  $,
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
      var status = this.model.get('status');

      if (status === 'finished')
      {
        if (auth.restart)
        {
          actions.push({
            type: 'info',
            label: this.t('PAGE_ACTION:restart'),
            callback: this.start.bind(this)
          });
        }
      }
      else if (auth.status)
      {
        if (status === 'pending')
        {
          actions.push({
            type: 'info',
            label: this.t('PAGE_ACTION:start'),
            callback: this.start.bind(this)
          });
        }

        actions.push({
          type: 'success',
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
      var page = this;

      if (dictionaries.loaded)
      {
        return when(page.model.fetch());
      }

      var deferred = $.Deferred();

      dictionaries.load()
        .then(function() { return page.model.fetch(); })
        .done(function() { deferred.resolve(); })
        .fail(function() { deferred.reject(); });

      return when(deferred.promise());
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
      if (this.model.get('solution').trim() === '')
      {
        this.view.showEditor(this.$('.fap-is-editable[data-prop="solution"]'), 'solution');
      }
      else
      {
        this.model.multiChange({
          status: 'finished',
          finishedAt: new Date()
        });
      }
    },

    start: function()
    {
      this.model.multiChange({
        status: 'started',
        startedAt: new Date(),
        finishedAt: null
      });
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
      var change = message.change;

      if (socket.getId() !== message.socketId)
      {
        this.model.handleChange(change);
      }
      else if (change.data.subscribers)
      {
        this.model.handleChange({
          date: change.date,
          user: change.user,
          data: {
            subscribers: change.data.subscribers
          },
          comment: ''
        });
      }
    },

    onPresence: function(message)
    {
      this.model.handlePresence(message.userId, message.presence);
    }

  });
});
