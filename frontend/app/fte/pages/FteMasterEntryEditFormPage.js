// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../FteMasterEntry',
  '../views/FteMasterEntryEditFormView'
], function(
  t,
  bindLoadingMessage,
  View,
  FteMasterEntry,
  FteMasterEntryEditFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'fteMasterEntryForm',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('fte', 'BREADCRUMBS:master:browse'),
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
      this.model = bindLoadingMessage(new FteMasterEntry({_id: this.options.modelId}), this);

      this.view = new FteMasterEntryEditFormView({model: this.model});

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
