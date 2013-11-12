define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../WorkCenter',
  '../views/WorkCenterDetailsView',
  'i18n!app/nls/workCenters'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  WorkCenter,
  WorkCenterDetailsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'workCenterDetails',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('workCenters', 'BREADCRUMBS:BROWSE'),
          href: this.model.genClientUrl('base')
        },
        this.model.getLabel()
      ];
    },

    actions: function()
    {
      return [
        pageActions.edit(this.model, 'WORK_CENTERS:MANAGE'),
        pageActions.delete(this.model, 'WORK_CENTERS:MANAGE')
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new WorkCenter({_id: this.options.workCenterId}), this);

      this.view = new WorkCenterDetailsView({
        model: this.model
      });
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
