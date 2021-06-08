// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  '../dictionaries',
  '../views/QiResultFilterView',
  '../views/QiResultListView',
  'app/qiResults/templates/addPageActions'
], function(
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
          privileges: function()
          {
            return user.isAllowedTo('QI:INSPECTOR', 'QI:RESULTS:MANAGE', 'FN:leader', 'FN:wh');
          }
        },
        {
          label: page.t('PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'QI:DICTIONARIES:MANAGE',
          href: '#qi/settings?tab=results'
        }
      ];
    },

    load: function(when)
    {
      return when(qiDictionaries.load(), this.collection.fetch({reset: true}));
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
