define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../HourlyPlan',
  '../views/HourlyPlanFormView'
], function(
  $,
  t,
  viewport,
  bindLoadingMessage,
  View,
  HourlyPlan,
  HourlyPlanFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'hourlyPlanForm',

    breadcrumbs: [
      {
        label: t.bound('hourlyPlans', 'BREADCRUMBS:entryList'),
        href: '#hourlyPlans'
      },
      t.bound('hourlyPlans', 'BREADCRUMBS:entryForm')
    ],

    actions: function()
    {
      var page = this;

      return [{
        type: 'danger',
        label: t.bound('hourlyPlans', 'PAGE_ACTION:lock'),
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
      this.model = bindLoadingMessage(new HourlyPlan({_id: this.options.modelId}), this);

      this.view = new HourlyPlanFormView({model: this.model});
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

      this.socket.emit('hourlyPlans.lockEntry', this.model.id, function(err)
      {
        if (err)
        {
          console.error(err);

          $action.removeClass('disabled');

          return viewport.msg.show({
            type: 'error',
            time: 5000,
            text: t('hourlyPlans', 'msg:lockFailure')
          });
        }
      });
    }

  });
});
