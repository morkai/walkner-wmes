// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/broker',
  'app/user',
  'app/notifications',
  'app/core/View',
  '../Entry',
  './AddFormView',
  'app/wmes-fap-entries/templates/navbar'
], function(
  _,
  $,
  broker,
  user,
  notifications,
  View,
  Entry,
  AddFormView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click #-add': function()
      {
        var view = this;

        if (view.$('.fap-addForm').length)
        {
          return view.hideAddForm();
        }

        clearTimeout(view.timers.resetNewEntry);
        view.timers.resetNewEntry = null;

        view.toggleAddForm(true);

        var addFormView = new AddFormView({
          model: view.model
        });

        view.listenTo(addFormView, 'cancel', view.hideAddForm);

        view.setView('#-addForm', addFormView).render();
      }
    },

    initialize: function()
    {
      var view = this;

      view.model = new Entry();

      view.listenTo(view.model, 'sync', function()
      {
        view.hideAddForm();

        view.timers.resetModel = setTimeout(view.resetEntry.bind(view), 1);
      });

      $(window).on('keydown.' + view.idPrefix, view.onKeyDown.bind(view));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    getTemplateData: function()
    {
      return {
        browseEntriesLinks: [
          {label: 'all', rql: ''},
          {label: 'open', rql: '&status=in=(pending,started)'},
          {label: 'pending', rql: '&status=in=(pending)'},
          {label: 'started', rql: '&status=in=(started)'},
          {label: 'finished', rql: '&status=in=(finished)'},
          {label: 'analysis', rql: '&analysisNeed=true&analysisDone=false'}
        ]
      };
    },

    afterRender: function()
    {
      this.setUpUnseen();

      if (!user.isLoggedIn())
      {
        this.$el.addClass('hidden');
      }
      else if (this.$('.fap-addForm').length)
      {
        this.toggleAddForm(true);
      }
    },

    setUpUnseen: function()
    {
      if (this.notifications)
      {
        this.notifications.cancel();
      }

      this.reloadUnseen();

      if (!user.isLoggedIn())
      {
        return;
      }

      this.notifications = this.pubsub.subscribe(
        'fap.entries.notifications.' + user.data._id,
        this.onNotification.bind(this)
      );
    },

    reloadUnseen: function()
    {
      var view = this;

      view.unseenEntries = [];

      view.$('.fap-navbarBtn-unseen')
        .addClass('disabled')
        .text('?');

      if (view.req)
      {
        view.req.abort();
        view.req = null;
      }

      if (!user.isLoggedIn())
      {
        return;
      }

      view.req = view.ajax({
        url: '/fap/entries;unseen'
      });

      view.req.done(function(unseenEntries)
      {
        view.unseenEntries = unseenEntries;

        view.toggleUnseen();
      });

      view.req.always(function()
      {
        view.req = null;
      });
    },

    toggleUnseen: function()
    {
      this.$('.fap-navbarBtn-unseen')
        .toggleClass('disabled', this.unseenEntries.length === 0)
        .text(this.unseenEntries.length);
    },

    toggleAddForm: function(show)
    {
      var $icon = this.$id('add').find('.fa');

      this.$el.toggleClass('fap-navbar-adding', show);
      this.$id('menu').prop('disabled', show);

      if (show)
      {
        $icon.removeClass('fa-plus').addClass('fa-times');
      }
      else
      {
        $icon.removeClass('fa-times').addClass('fa-plus');
      }
    },

    hideAddForm: function()
    {
      var view = this;

      if (view.$('.fap-addForm').length)
      {
        view.removeView('#-addForm');
        view.toggleAddForm(false);

        view.timers.resetNewEntry = setTimeout(function() { view.model.clear(); }, 5 * 60 * 1000);
      }
    },

    resetEntry: function()
    {
      var entry = this.model;

      delete entry.focusedInput;
      delete entry.uploadQueue;
      delete entry.uploading;
      delete entry.uploadedFiles;
      delete entry.validatedOrder;

      entry.clear();
    },

    onKeyDown: function(e)
    {
      if (e.originalEvent.key === 'Escape')
      {
        this.hideAddForm();
      }
    },

    onNotification: function(message)
    {
      if (message.added)
      {
        this.handleAddedEntry(message.added);
      }

      if (message.changed)
      {
        this.handleChangedEntry(message.changed);
      }

      if (message.removed)
      {
        this.handleRemovedEntries(message.removed);
      }

      if (message.seen)
      {
        this.handleSeenEntries(message.seen);
      }
    },

    handleAddedEntry: function(added)
    {
      this.unseenEntries.push(added._id);
      this.toggleUnseen();
      this.showAddedNotification(added);
    },

    handleChangedEntry: function(changed)
    {
      if (!this.unseenEntries)
      {
        return;
      }

      if (this.unseenEntries.indexOf(changed._id) === -1)
      {
        this.unseenEntries.push(changed._id);
        this.toggleUnseen();
      }

      if (changed.comment && !changed.unsubscribed)
      {
        this.showChangedNotification(changed);
      }
    },

    handleRemovedEntries: function(removedEntries)
    {
      this.handleSeenEntries(removedEntries);
    },

    handleSeenEntries: function(seenEntries)
    {
      if (!this.unseenEntries && !this.unseenEntries.length)
      {
        return;
      }

      this.broker.publish('fap.entries.seen', {
        seenEntries: seenEntries
      });

      var seen = {};

      seenEntries.forEach(function(entryId)
      {
        seen[entryId] = true;

        notifications.close(['wmes-fap', entryId]);
      });

      this.unseenEntries = this.unseenEntries.filter(function(entryId) { return !seen[entryId]; });

      this.toggleUnseen();
    },

    showAddedNotification: function(entry)
    {
      notifications.show({
        tag: 'wmes-fap ' + entry._id,
        title: this.t('notifications:added:title', {
          rid: entry.rid,
          category: entry.category
        }),
        body: entry.owner + ': ' + entry.problem,
        data: {
          onClick: {
            open: '/#fap/entries/' + entry._id
          }
        },
        scoreClient: function(client)
        {
          var score = client.focused ? 1 : 0;

          if (client.url.includes('#fap/entries'))
          {
            score += 10000;
          }
          else if (client.url.includes('#fap'))
          {
            score += 1000;
          }

          return score;
        }
      }).catch(_.noop);
    },

    showChangedNotification: function(entry)
    {
      notifications.show({
        tag: 'wmes-fap ' + entry._id,
        title: this.t('notifications:changed:title', {
          rid: entry.rid
        }),
        body: entry.updater + ': ' + entry.comment,
        actions: [
          {
            action: 'reply',
            title: this.t('notifications:changed:reply'),
            type: 'text',
            placeholder: this.t('notifications:changed:placeholder')
          }
        ],
        data: {
          onClick: {
            open: '/#fap/entries/' + entry._id
          },
          onAction: {
            reply: {
              act: {
                action: 'wmesFapComment',
                data: {
                  entryId: entry._id
                }
              }
            }
          }
        },
        scoreClient: function(client)
        {
          var score = client.focused ? 1 : 0;

          if (client.url.includes('#fap/entries/' + entry._id))
          {
            if (client.focused)
            {
              return -1;
            }

            score += 100000;
          }
          else if (client.url.includes('#fap/entries'))
          {
            score += 10000;
          }
          else if (client.url.includes('#fap'))
          {
            score += 1000;
          }

          return score;
        }
      }).catch(_.noop);
    }

  }, {

    setUp: function()
    {
      if (window.MODULES && window.MODULES.indexOf('wmes-fap') === -1)
      {
        return;
      }

      var NavbarBtnView = this;

      broker.subscribe('navbar.rendered', function(message)
      {
        var navbarView = message.view;

        if (navbarView.$el.find('.fap-navbar').length)
        {
          return;
        }

        var navbarBtnView = new NavbarBtnView();

        navbarView.insertView('.navbar-collapse', navbarBtnView).render();
      });
    }

  });
});
