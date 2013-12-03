define([
  'app/i18n',
  'app/user',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../HourlyPlan',
  '../views/HourlyPlanDetailsView',
  'i18n!app/nls/hourlyPlans'
], function(
  t,
  user,
  bindLoadingMessage,
  View,
  HourlyPlan,
  HourlyPlanDetailsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'hourlyPlanDetails',

    breadcrumbs: [
      {
        label: t.bound('hourlyPlans', 'BREADCRUMBS:entryList'),
        href: '#hourlyPlans'
      },
      t.bound('hourlyPlans', 'BREADCRUMBS:entryDetails')
    ],

    actions: function()
    {
      var actions = [];

      if (this.model.get('locked'))
      {
        actions.push({
          label: t.bound('hourlyPlans', 'PAGE_ACTION:print'),
          icon: 'print',
          href: this.model.genClientUrl('print')
        });
      }
      else if (user.isAllowedTo('HOURLY_PLANS:MANAGE'))
      {
        if (!user.isAllowedTo('HOURLY_PLANS:ALL'))
        {
          var userDivision = user.getDivision();

          if (userDivision && userDivision.get('_id') !== this.model.get('division'))
          {
            return actions;
          }
        }

        actions.push({
          label: t.bound('hourlyPlans', 'PAGE_ACTION:edit'),
          icon: 'edit',
          href: this.model.genClientUrl('edit'),
          privileges: 'HOURLY_PLANS:MANAGE'
        });
      }

      return actions;
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new HourlyPlan({_id: this.options.modelId}), this);

      this.view = new HourlyPlanDetailsView({model: this.model});

      var page = this;

      this.listenToOnce(this.model, 'sync', function()
      {
        if (page.model.get('locked'))
        {
          return;
        }

        page.pubsub.subscribe('hourlyPlans.locked.' + page.model.id, function()
        {
          page.model.set({locked: true});

          if (page.layout)
          {
            page.layout.setActions(page.actions());
          }
        });
      });
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
