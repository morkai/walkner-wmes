define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../Aor',
  '../views/AorDetailsView',
  'i18n!app/nls/aors'
], function(
  t,
  bindLoadingMessage,
  pageActions,
  View,
  Aor,
  AorDetailsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'aorDetails',

    breadcrumbs: function()
    {
      return [
        {label: t.bound('aors', 'BREADCRUMBS:BROWSE'), href: this.model.genClientUrl('base')},
        this.model.getLabel()
      ];
    },

    actions: function()
    {
      return [
        pageActions.edit(this.model, 'AORS:MANAGE'),
        pageActions.delete(this.model, 'AORS:MANAGE')
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new Aor({_id: this.options.aorId}), this);

      this.view = new AorDetailsView({
        model: this.model
      });
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
