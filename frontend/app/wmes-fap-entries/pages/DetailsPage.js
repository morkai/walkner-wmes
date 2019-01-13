// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/socket',
  'app/user',
  'app/core/pages/DetailsPage',
  'app/core/util/onModelDeleted',
  'app/core/util/pageActions',
  '../dictionaries',
  '../views/DetailsView'
], function(
  _,
  $,
  socket,
  user,
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
      'socket.connected': 'join',
      'fap.entries.seen': function(message)
      {
        var entryId = this.model.id;

        if (_.some(message.seenEntries, function(seenEntryId) { return seenEntryId === entryId; }))
        {
          this.model.handleChange({
            date: new Date(),
            user: user.getInfo(),
            data: {},
            comment: ''
          });
        }
      }
    },

    actions: function()
    {
      var actions = [];
      var details = this.model.serializeDetails();
      var auth = details.auth;
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

      actions.push({
        icon: 'eye',
        label: this.t('PAGE_ACTION:markAsSeen'),
        callback: this.markAsSeen.bind(this),
        disabled: !details.observer.notify
      });

      if (details.observer.role !== 'viewer')
      {
        if (this.model.get('unsubscribed')[user.data._id])
        {
          actions.push({
            icon: 'bell-o',
            label: this.t('PAGE_ACTION:subscribe'),
            callback: this.subscribe.bind(this)
          });
        }
        else
        {
          actions.push({
            icon: 'bell-slash-o',
            label: this.t('PAGE_ACTION:unsubscribe'),
            callback: this.unsubscribe.bind(this)
          });
        }
      }

      if (auth.delete)
      {
        actions.push(pageActions.delete(this.model, false));
      }

      return actions;
    },

    initialize: function()
    {
      var page = this;

      DetailsPage.prototype.initialize.apply(page, arguments);

      var entry = page.model;

      page.listenTo(entry, 'updateFailure', function()
      {
        entry.fetch();
      });

      page.listenToOnce(entry, 'sync', function()
      {
        page.listenTo(entry, 'sync', page.render);
      });

      page.listenTo(
        entry,
        'change:status change:observers change:unsubscribed',
        _.debounce(page.updateActions.bind(page), 1)
      );

      page.listenTo(entry, 'change', page.scheduleMarkAsSeen.bind(page));

      $(window).on('focus.' + page.idPrefix, page.onFocus.bind(page));
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

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

    subscribe: function()
    {
      this.model.change('unsubscribed', false, true);
    },

    unsubscribe: function()
    {
      this.model.change('unsubscribed', true, false);
    },

    markAsSeen: function()
    {
      if (this.model.serializeDetails().observer.notify)
      {
        this.model.multiChange({});
      }
    },

    scheduleMarkAsSeen: function()
    {
      var page = this;

      if (!page.timers)
      {
        return;
      }

      clearTimeout(page.timers.markAsSeen);

      page.timers.markAsSeen = setTimeout(function()
      {
        if (document.hasFocus())
        {
          page.markAsSeen();
        }
      }, 10000);
    },

    updateActions: function()
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
        this.model.handleChange(change, message.notify);
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
        }, message.notify);
      }
    },

    onPresence: function(message)
    {
      this.model.handlePresence(message.userId, message.presence);
    },

    onFocus: function()
    {
      this.scheduleMarkAsSeen();
    }

  });
});
