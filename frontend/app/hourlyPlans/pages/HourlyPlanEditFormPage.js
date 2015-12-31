// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../HourlyPlan',
  '../views/HourlyPlanEditFormView'
], function(
  t,
  bindLoadingMessage,
  View,
  HourlyPlan,
  HourlyPlanEditFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'hourlyPlanEditForm',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('hourlyPlans', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        {
          label: this.model.getLabel(),
          href: this.model.genClientUrl()
        },
        t.bound('hourlyPlans', 'BREADCRUMBS:editForm')
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new HourlyPlan({_id: this.options.modelId}), this);

      this.view = new HourlyPlanEditFormView({model: this.model});

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
