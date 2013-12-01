define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../FteLeaderEntry',
  '../views/FteLeaderEntryFormView',
  'i18n!app/nls/fte'
], function(
  $,
  t,
  viewport,
  bindLoadingMessage,
  View,
  FteLeaderEntry,
  FteLeaderEntryFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'fteLeaderEntryForm',

    breadcrumbs: [
      {
        label: t.bound('fte', 'BREADCRUMBS:leader:entryList'),
        href: '#fte/leader'
      },
      t.bound('fte', 'BREADCRUMBS:leader:entryForm')
    ],

    actions: function()
    {
      var page = this;

      return [{
        type: 'danger',
        label: t.bound('fte', 'PAGE_ACTION:lock'),
        icon: 'lock',
        callback: function(e)
        {
          page.lockEntry($(e.target).closest('.btn'));

          return false;
        }
      }];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new FteLeaderEntry({_id: this.options.modelId}), this);

      this.view = new FteLeaderEntryFormView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    },

    lockEntry: function($action)
    {
      if ($action.hasClass('disabled'))
      {
        return;
      }

      $action.addClass('disabled');

      this.socket.emit('fte.leader.lockEntry', this.model.id, function(err)
      {
        if (err)
        {
          console.error(err);

          $action.removeClass('disabled');

          return viewport.msg.show({
            type: 'error',
            time: 5000,
            text: t('fte', 'currentLeaderEntry:msg:lockFailure')
          });
        }
      });
    }

  });
});
