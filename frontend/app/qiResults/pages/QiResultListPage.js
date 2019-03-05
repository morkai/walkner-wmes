// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/user',
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  '../dictionaries',
  '../views/QiResultFilterView',
  '../views/QiResultListView',
  'app/qiResults/templates/addPageActions'
], function(
  $,
  t,
  user,
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
      var page = this;

      return [
        pageActions.jump(page, page.collection),
        pageActions.export(layout, page, page.collection, false),
        {
          template: function() { return page.renderPartialHtml(addPageActionsTemplate); },
          privileges: function() { return user.isAllowedTo('QI:INSPECTOR', 'QI:RESULTS:MANAGE'); }
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

    defineViews: function()
    {
      FilteredListPage.prototype.defineViews.apply(this, arguments);

      this.listenTo(this.listView, 'showFilter', function(filter)
      {
        if (filter === 'rid')
        {
          $('.page-actions-jump').find('input[name="rid"]').focus();
        }
        else
        {
          this.filterView.showFilter(filter);
        }
      });
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
