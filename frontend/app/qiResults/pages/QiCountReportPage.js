// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  'app/reports/util/formatTooltipHeader',
  '../dictionaries',
  '../QiCountReport',
  '../views/QiCountReportFilterView',
  '../views/QiTotalNokCountChartView',
  '../views/QiNokCountPerDivisionChartView',
  '../views/QiNokQtyPerFamilyChartView',
  'app/qiResults/templates/countReportPage'
], function(
  t,
  View,
  formatTooltipHeader,
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
      t.bound('qiResults', 'BREADCRUMBS:base'),
      t.bound('qiResults', 'BREADCRUMBS:reports:count')
    ],

    actions: function()
    {
      return [{
        label: t.bound('qiResults', 'PAGE_ACTION:settings'),
        icon: 'cogs',
        privileges: 'QI:RESULTS:MANAGE',
        href: '#qi/settings?tab=reports'
      }];
    },

    initialize: function()
    {
      this.setView('.filter-container', new QiCountReportFilterView({model: this.model}));
      this.setView(
        '#' + this.idPrefix + '-totalNokCount',
        new QiTotalNokCountChartView({model: this.model})
      );
      this.setView(
        '#' + this.idPrefix + '-nokCountPerDivision',
        new QiNokCountPerDivisionChartView({model: this.model})
      );
      this.setView(
        '#' + this.idPrefix + '-nokQtyPerFamily',
        new QiNokQtyPerFamilyChartView({model: this.model})
      );

      this.listenTo(this.model, 'filtered', this.onFiltered);
      this.listenTo(this.model, 'change:selectedGroupKey', this.updateSelectedGroup);
    },

    destroy: function()
    {
      qiDictionaries.unload();
    },

    load: function(when)
    {
      if (qiDictionaries.loaded)
      {
        return when(this.model.fetch());
      }

      return qiDictionaries.load().then(this.model.fetch.bind(this.model));
    },

    afterRender: function()
    {
      qiDictionaries.load();

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
    }

  });
});
