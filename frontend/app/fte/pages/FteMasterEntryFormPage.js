define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../FteMasterEntry',
  '../views/FteMasterEntryFormView'
], function(
  $,
  t,
  viewport,
  bindLoadingMessage,
  View,
  FteMasterEntry,
  FteMasterEntryFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'fteMasterEntryForm',

    breadcrumbs: [
      {
        label: t.bound('fte', 'BREADCRUMBS:master:entryList'),
        href: '#fte/master'
      },
      t.bound('fte', 'BREADCRUMBS:master:entryForm')
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
      this.model = bindLoadingMessage(new FteMasterEntry({_id: this.options.modelId}), this);

      this.view = new FteMasterEntryFormView({model: this.model});
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

      this.socket.emit('fte.master.lockEntry', this.model.id, function(err)
      {
        if (err)
        {
          console.error(err);

          $action.removeClass('disabled');

          return viewport.msg.show({
            type: 'error',
            time: 5000,
            text: t('fte', 'masterEntry:msg:lockFailure')
          });
        }
      });
    }

  });
});
