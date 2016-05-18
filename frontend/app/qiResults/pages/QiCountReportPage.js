// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
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
  _,
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
      var model = this.model;

      this.setView('.filter-container', new QiCountReportFilterView({model: model}));
      this.setView(
        '#' + this.idPrefix + '-totalNokCount',
        new QiTotalNokCountChartView({model: model})
      );
      this.setView(
        '#' + this.idPrefix + '-nokCountPerDivision',
        new QiNokCountPerDivisionChartView({model: model})
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
    },

    updateSelectedDivisions: function()
    {
      var model = this.model;
      var allDivisions = Object.keys(model.get('divisions'));
      var selectedDivisions = allDivisions.filter(function(d) { return !model.isIgnoredDivision(d); });

console.log(selectedDivisions);
      this.$id('selectedDivisions').text(
        selectedDivisions.length === allDivisions.length
          ? ''
          : ('; ' + selectedDivisions.join(', '))
      );
    }

  });
});
