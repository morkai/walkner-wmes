// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../HourlyPlan',
  '../views/HourlyPlanDetailsView'
], function(
  t,
  user,
  bindLoadingMessage,
  pageActions,
  View,
  HourlyPlan,
  HourlyPlanDetailsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'hourlyPlanDetails',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('hourlyPlans', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        this.model.getLabel()
      ];
    },

    actions: function()
    {
      var actions = [{
        label: t.bound('hourlyPlans', 'PAGE_ACTION:print'),
        icon: 'print',
        href: this.model.genClientUrl('print')
      }];

      if (this.model.isEditable(user))
      {
        actions.push(
          pageActions.edit(this.model),
          pageActions.delete(this.model)
        );
      }

      return actions;
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new HourlyPlan({_id: this.options.modelId}), this);

      this.view = new HourlyPlanDetailsView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
