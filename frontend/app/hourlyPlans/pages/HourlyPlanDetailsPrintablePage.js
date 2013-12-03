define([
  'moment',
  'app/i18n',
  'app/data/divisions',
  'app/data/views/renderOrgUnitPath',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../HourlyPlan',
  '../views/HourlyPlanDetailsPrintableView',
  'i18n!app/nls/hourlyPlans'
], function(
  moment,
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
        date: moment(this.model.get('date')).format('YYYY-MM-DD'),
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
