// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/pages/DetailsPage',
  'app/core/util/pageActions',
  '../dictionaries',
  '../views/D8EntryDetailsView',
  '../views/D8EntryHistoryView',
  'app/d8Entries/templates/detailsPage'
], function(
  $,
  t,
  user,
  viewport,
  DetailsPage,
  pageActions,
  dictionaries,
  D8EntryDetailsView,
  D8EntryHistoryView,
  template
) {
  'use strict';

  return DetailsPage.extend({

    template: template,

    baseBreadcrumb: true,

    localTopics: {
      'd8.entries.seen': 'onSeen'
    },

    actions: function()
    {
      var actions = [];

      if (this.model.isNotSeen())
      {
        actions.push({
          id: 'markAsSeen',
          icon: 'eye',
          label: t('d8Entries', 'PAGE_ACTION:markAsSeen'),
          callback: this.markAsSeen.bind(this)
        });
      }

      var observer = this.model.get('observer');

      if (observer.role === 'subscriber')
      {
        actions.push({
          id: 'unobserve',
          icon: 'eye-slash',
          label: t('d8Entries', 'PAGE_ACTION:unobserve'),
          callback: this.unobserve.bind(this)
        });
      }
      else if (observer.role === 'viewer')
      {
        actions.push({
          id: 'observe',
          icon: 'eye',
          label: t('d8Entries', 'PAGE_ACTION:observe'),
          callback: this.observe.bind(this)
        });
      }

      actions.push({
        id: 'download',
        icon: 'download',
        label: t('d8Entries', 'PAGE_ACTION:download'),
        callback: this.download.bind(this)
      });

      if (this.model.canEdit())
      {
        actions.push(pageActions.edit(this.model, false));
      }

      if (this.model.canDelete())
      {
        actions.push(pageActions.delete(this.model, false));
      }

      return actions;
    },

    initialize: function()
    {
      DetailsPage.prototype.initialize.apply(this, arguments);

      this.setView('.d8Entries-detailsPage-properties', this.detailsView);
      this.setView('.d8Entries-detailsPage-history', this.historyView);
    },

    destroy: function()
    {
      DetailsPage.prototype.destroy.call(this);

      dictionaries.unload();
    },

    defineViews: function()
    {
      this.detailsView = new D8EntryDetailsView({model: this.model});
      this.historyView = new D8EntryHistoryView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch(), dictionaries.load());
    },

    setUpLayout: function(layout)
    {
      this.listenTo(this.model, 'reset change', function()
      {
        layout.setActions(this.actions, this);
      });
    },

    afterRender: function()
    {
      DetailsPage.prototype.afterRender.call(this);

      dictionaries.load();
    },

    markAsSeen: function(e)
    {
      var btnEl = e.currentTarget.querySelector('.btn');

      btnEl.disabled = true;

      this.socket.emit('d8.entries.markAsSeen', {_id: this.model.id}, function(err)
      {
        if (err)
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: t('d8Entries', 'MSG:markAsSeen:failure')
          });

          btnEl.disabled = false;
        }
      });
    },

    observe: function(e)
    {
      var btnEl = e.currentTarget.querySelector('.btn');

      btnEl.disabled = true;

      this.socket.emit('d8.entries.observe', {_id: this.model.id, state: true}, function(err)
      {
        if (err)
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: t('d8Entries', 'MSG:observe:failure')
          });

          btnEl.disabled = false;
        }
      });
    },

    unobserve: function(e)
    {
      var btnEl = e.currentTarget.querySelector('.btn');

      btnEl.disabled = true;

      this.socket.emit('d8.entries.observe', {_id: this.model.id, state: false}, function(err)
      {
        if (err)
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: t('d8Entries', 'MSG:unobserve:failure')
          });

          btnEl.disabled = false;
        }
      });
    },

    download: function()
    {
      var attachment = this.model.get('attachment');

      if (!attachment)
      {
        return viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: t('d8Entries', 'MSG:noAttachment')
        });
      }

      window.location.href = '/d8/entries/' + this.model.id + '/attachments/' + attachment._id + '?download=1';
    },

    onSeen: function(entryId)
    {
      if (entryId === this.model.id)
      {
        this.model.markAsSeen();
      }
    }

  });
});
