// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/reports/util/formatTooltipHeader',
  'app/data/createSettings',
  'app/factoryLayout/FactoryLayoutSettingCollection',
  '../dictionaries',
  '../QiNokRatioReport',
  '../views/QiNokRatioReportFilterView',
  '../views/QiNokRatioTotalChartView',
  '../views/QiNokRatioDivisionChartView',
  'app/qiResults/templates/nokRatioReportPage'
], function(
  _,
  t,
  View,
  bindLoadingMessage,
  formatTooltipHeader,
  createSettings,
  FactoryLayoutSettingCollection,
  qiDictionaries,
  QiNokRatioReport,
  QiNokRatioReportFilterView,
  QiNokRatioTotalChartView,
  QiNokRatioDivisionChartView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: [
      t.bound('qiResults', 'BREADCRUMB:base'),
      t.bound('qiResults', 'BREADCRUMB:reports:nokRatio')
    ],

    actions: function()
    {
      return [{
        label: t.bound('qiResults', 'PAGE_ACTION:settings'),
        icon: 'cogs',
        privileges: 'QI:DICTIONARIES:MANAGE',
        href: '#qi/settings?tab=reports'
      }];
    },

    initialize: function()
    {
      var model = bindLoadingMessage(this.model, this);

      this.factoryLayoutSettings = createSettings(FactoryLayoutSettingCollection);

      this.setView('.filter-container', new QiNokRatioReportFilterView({model: model}));
      this.setView(
        '#' + this.idPrefix + '-total',
        new QiNokRatioTotalChartView({model: model})
      );
      this.setView(
        '#' + this.idPrefix + '-division',
        new QiNokRatioDivisionChartView({
          model: model,
          factoryLayoutSettings: this.factoryLayoutSettings.acquire()
        })
      );

      this.listenTo(model, 'filtered', this.onFiltered);
    },

    destroy: function()
    {
      qiDictionaries.unload();

      this.factoryLayoutSettings.release();
      this.factoryLayoutSettings = null;
    },

    load: function(when)
    {
      if (qiDictionaries.loaded)
      {
        return when(this.model.fetch(), this.factoryLayoutSettings.acquire().fetchIfEmpty());
      }

      return qiDictionaries.load().then(
        this.model.fetch.bind(this.model),
        this.factoryLayoutSettings.acquire().fetchIfEmpty()
      );
    },

    afterRender: function()
    {
      qiDictionaries.load();
      this.factoryLayoutSettings.acquire();
    },

    onFiltered: function()
    {
      this.promised(this.model.fetch());

      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl(),
        trigger: false,
        replace: true
      });
    }

  });
});
