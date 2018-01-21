// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../FteLeaderEntry',
  '../views/FteLeaderEntryEditFormView'
], function(
  t,
  bindLoadingMessage,
  View,
  FteLeaderEntry,
  FteLeaderEntryEditFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'fteLeaderEntryForm',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('fte', 'BREADCRUMBS:' + this.model.TYPE + ':browse'),
          href: this.model.genClientUrl('base')
        },
        {
          label: t.bound('fte', 'BREADCRUMBS:details'),
          href: this.model.genClientUrl()
        },
        t.bound('fte', 'BREADCRUMBS:editForm')
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);

      this.view = new FteLeaderEntryEditFormView({model: this.model});

      this.listenTo(this.view, 'remoteError', function(err)
      {
        if (err.message === 'AUTH')
        {
          this.broker.publish('router.navigate', {
            url: this.model.genClientUrl(),
            trigger: true,
            replace: true
          });
        }
      });
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
