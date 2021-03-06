// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../i18n',
  '../user',
  '../core/View',
  '../core/util/showDeleteFormPage'
], function(
  _,
  router,
  viewport,
  t,
  user,
  View,
  showDeleteFormPage
) {
  'use strict';

  var nls = 'i18n!app/nls/orderBomMatchers';
  var canView = user.auth('PROD_DATA:VIEW', ' FN:process-engineer');
  var canManage = user.auth('PROD_DATA:MANAGE', ' FN:process-engineer');

  router.map('/orderBomMatchers', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/orderBomMatchers/OrderBomMatcherCollection',
        'app/orderBomMatchers/views/OrderBomMatcherFilterView',
        'app/orderBomMatchers/views/OrderBomMatcherListView',
        nls
      ],
      function(FilteredListPage, OrderBomMatcherCollection, FilterView, ListView)
      {
        return new FilteredListPage({
          navbarModuleName: 'production',
          baseBreadcrumb: [
            t('orderBomMatchers', 'BREADCRUMB:operator'),
            {href: '#production;settings', label: t('orderBomMatchers', 'BREADCRUMB:settings')}
          ],
          actions: function()
          {
            return [{
              label: this.t('PAGE_ACTION:componentLabels'),
              href: '#componentLabels'
            }].concat(FilteredListPage.prototype.actions.apply(this, arguments));
          },
          FilterView: FilterView,
          ListView: ListView,
          collection: new OrderBomMatcherCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/orderBomMatchers/:id', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/orderBomMatchers/OrderBomMatcher',
        'app/orderBomMatchers/templates/details',
        nls,
        'css!app/orderBomMatchers/assets/details.css'
      ],
      function(DetailsPage, OrderBomMatcher, template)
      {
        return new DetailsPage({
          navbarModuleName: 'production',
          baseBreadcrumb: [
            t('orderBomMatchers', 'BREADCRUMB:operator'),
            {href: '#production;settings', label: t('orderBomMatchers', 'BREADCRUMB:settings')}
          ],
          detailsTemplate: template,
          model: new OrderBomMatcher({_id: req.params.id})
        });
      }
    );
  });

  router.map('/orderBomMatchers;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/orderBomMatchers/OrderBomMatcher',
        'app/orderBomMatchers/views/OrderBomMatcherFormView',
        nls
      ],
      function(AddFormPage, OrderBomMatcher, FormView)
      {
        return new AddFormPage({
          navbarModuleName: 'production',
          baseBreadcrumb: [
            t('orderBomMatchers', 'BREADCRUMB:operator'),
            {href: '#production;settings', label: t('orderBomMatchers', 'BREADCRUMB:settings')}
          ],
          FormView: FormView,
          model: new OrderBomMatcher()
        });
      }
    );
  });

  router.map('/orderBomMatchers/:id;edit', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/orderBomMatchers/OrderBomMatcher',
        'app/orderBomMatchers/views/OrderBomMatcherFormView',
        nls
      ],
      function(EditFormPage, OrderBomMatcher, FormView)
      {
        return new EditFormPage({
          navbarModuleName: 'production',
          baseBreadcrumb: [
            t('orderBomMatchers', 'BREADCRUMB:operator'),
            {href: '#production;settings', label: t('orderBomMatchers', 'BREADCRUMB:settings')}
          ],
          FormView: FormView,
          model: new OrderBomMatcher({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/orderBomMatchers/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/orderBomMatchers/OrderBomMatcher', _, _, {
      navbarModuleName: 'production',
      baseBreadcrumb: [
        t.bound('orderBomMatchers', 'BREADCRUMB:operator'),
        {href: '#production;settings', label: t.bound('orderBomMatchers', 'BREADCRUMB:settings')}
      ]
    })
  );
});
