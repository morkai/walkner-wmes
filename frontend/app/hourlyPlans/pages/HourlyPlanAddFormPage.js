// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/View',
  '../HourlyPlan',
  '../views/HourlyPlanAddFormView'
], function(
  t,
  View,
  HourlyPlan,
  HourlyPlanAddFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'hourlyPlanAddForm',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('hourlyPlans', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        t.bound('hourlyPlans', 'BREADCRUMBS:addForm')
      ];
    },

    initialize: function()
    {
      this.model = new HourlyPlan();

      this.view = new HourlyPlanAddFormView({model: this.model});

      this.listenTo(this.view, 'editable', function(hourlyPlan)
      {
        this.broker.publish('router.navigate', {
          url: hourlyPlan.genClientUrl('edit'),
          trigger: true
        });
      });

      this.listenTo(this.view, 'uneditable', function(hourlyPlan)
      {
        this.broker.publish('router.navigate', {
          url: hourlyPlan.genClientUrl(),
          trigger: true
        });
      });
    }

  });
});
