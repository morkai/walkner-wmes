// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  '../dictionaries',
  '../views/QiResultFilterView',
  '../views/QiResultListView',
  'app/qiResults/templates/addPageActions'
], function(
  t,
  FilteredListPage,
  pageActions,
  qiDictionaries,
  QiResultFilterView,
  QiResultListView,
  addPageActionsTemplate
) {
  'use strict';

  return FilteredListPage.extend({

    baseBreadcrumb: true,
    FilterView: QiResultFilterView,
    ListView: QiResultListView,

    actions: function(layout)
    {
      var collection = this.collection;

      return [
        pageActions.jump(this, collection),
        pageActions.export(layout, this, this.collection, false),
        {
          template: addPageActionsTemplate,
          privilege: 'QI:INSPECTOR QI:MANAGE'
        },
        {
          label: t.bound('qiResults', 'PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'QI:DICTIONARIES:MANAGE',
          href: '#qi/settings?tab=results'
        }
      ];
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}), qiDictionaries.load());
    },

    destroy: function()
    {
      FilteredListPage.prototype.destroy.call(this);

      qiDictionaries.unload();
    },

    afterRender: function()
    {
      FilteredListPage.prototype.afterRender.call(this);

      qiDictionaries.load();
    }

  });
});
