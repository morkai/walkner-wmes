// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/i18n',
  'app/data/divisions',
  'app/orgUnits/util/renderOrgUnitPath',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../HourlyPlan',
  '../views/HourlyPlanDetailsPrintableView'
], function(
  time,
  t,
  divisions,
  renderOrgUnitPath,
  bindLoadingMessage,
  View,
  HourlyPlan,
  HourlyPlanDetailsPrintableView
) {
  'use strict';

  return View.extend({

    layoutName: 'print',

    pageId: 'hourlyPlanDetailsPrintable',

    hdLeft: function()
    {
      var division = divisions.get(this.model.get('division'));

      return t('hourlyPlans', 'print:hdLeft', {
        division: division ? renderOrgUnitPath(division, false, false) : '?'
      });
    },

    hdRight: function()
    {
      return t('hourlyPlans', 'print:hdRight', {
        date: time.format(this.model.get('date'), 'L'),
        shift: t('core', 'SHIFT:' + this.model.get('shift'))
      });
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new HourlyPlan({_id: this.options.modelId}), this);

      this.view = new HourlyPlanDetailsPrintableView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
