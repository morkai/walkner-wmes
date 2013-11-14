define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../DowntimeReason',
  '../views/DowntimeReasonDetailsView',
  'i18n!app/nls/downtimeReasons'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  DowntimeReason,
  DowntimeReasonDetailsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'downtimeReasonDetails',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('downtimeReasons', 'BREADCRUMBS:BROWSE'),
          href: this.model.genClientUrl('base')
        },
        this.model.getLabel()
      ];
    },

    actions: function()
    {
      return [
        pageActions.edit(this.model, 'DICTIONARIES:MANAGE'),
        pageActions.delete(this.model, 'DICTIONARIES:MANAGE')
      ];
    },

    initialize: function()
    {
      this.model =
        bindLoadingMessage(new DowntimeReason({_id: this.options.downtimeReasonId}), this);

      this.view = new DowntimeReasonDetailsView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
