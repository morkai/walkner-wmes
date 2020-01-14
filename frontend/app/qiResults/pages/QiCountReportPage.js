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
  '../QiCountReport',
  '../views/QiCountReportFilterView',
  '../views/QiTotalNokCountChartView',
  '../views/QiNokCountPerDivisionChartView',
  '../views/QiNokQtyPerFamilyChartView',
  'app/qiResults/templates/countReportPage'
], function(
  _,
  t,
  View,
  bindLoadingMessage,
  formatTooltipHeader,
  createSettings,
  FactoryLayoutSettingCollection,
  qiDictionaries,
  QiCountReport,
  QiCountReportFilterView,
  QiTotalNokCountChartView,
  QiNokCountPerDivisionChartView,
  QiNokQtyPerFamilyChartView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: [
      t.bound('qiResults', 'BREADCRUMB:base'),
      t.bound('qiResults', 'BREADCRUMB:reports:count')
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

      this.setView('.filter-container', new QiCountReportFilterView({model: model}));
      this.setView(
        '#' + this.idPrefix + '-totalNokCount',
        new QiTotalNokCountChartView({model: model})
      );
      this.setView(
        '#' + this.idPrefix + '-nokCountPerDivision',
        new QiNokCountPerDivisionChartView({
          model: model,
          factoryLayoutSettings: this.factoryLayoutSettings.acquire()
        })
      );
      this.setView(
        '#' + this.idPrefix + '-nokQtyPerFamily',
        new QiNokQtyPerFamilyChartView({model: model})
      );

      this.listenTo(model, 'filtered', this.onFiltered);
      this.listenTo(model, 'change:selectedGroupKey', this.updateSelectedGroup);
      this.listenTo(model, 'change:ignoredDivisions', this.updateSelectedDivisions);
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

      this.updateSelectedGroup();
    },

    onFiltered: function()
    {
      this.promised(this.model.fetch());

      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl(),
        trigger: false,
        replace: true
      });
    },

    updateSelectedGroup: function()
    {
      var selectedGroupKey = this.model.get('selectedGroupKey');

      if (!selectedGroupKey)
      {
        var selectedGroup = this.model.getSelectedGroup();

        if (selectedGroup)
        {
          selectedGroupKey = selectedGroup.key;
        }
      }

      this.$id('selectedGroup').text(
        selectedGroupKey ? formatTooltipHeader.call({model: this.model}, selectedGroupKey) : '?'
      );
    },

    updateSelectedDivisions: function()
    {
      var model = this.model;
      var allDivisions = Object.keys(model.get('divisions'));
      var selectedDivisions = allDivisions.filter(function(d) { return !model.isIgnoredDivision(d); });

      this.$id('selectedDivisions').text(
        selectedDivisions.length === allDivisions.length
          ? ''
          : ('; ' + selectedDivisions.join(', '))
      );
    }

  });
});
