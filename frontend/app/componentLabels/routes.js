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

  var nls = 'i18n!app/nls/componentLabels';
  var canView = user.auth('PROD_DATA:VIEW');
  var canManage = user.auth('PROD_DATA:MANAGE');

  router.map('/componentLabels', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/componentLabels/ComponentLabelCollection',
        'app/componentLabels/views/FilterView',
        nls
      ],
      function(FilteredListPage, ComponentLabelCollection, FilterView)
      {
        return new FilteredListPage({
          pageClassName: 'page-max-flex',
          navbarModuleName: 'production',
          baseBreadcrumb: [
            t('componentLabels', 'BREADCRUMB:operator'),
            {href: '#production;settings', label: t('componentLabels', 'BREADCRUMB:settings')}
          ],
          actions: function()
          {
            return [{
              label: this.t('PAGE_ACTION:orderBomMatchers'),
              href: '#orderBomMatchers'
            }].concat(FilteredListPage.prototype.actions.apply(this, arguments));
          },
          FilterView: FilterView,
          columns: [
            {id: 'componentCode', className: 'is-min', tdClassName: 'text-mono'},
            {id: 'operationNo', className: 'is-min', tdClassName: 'text-mono'},
            'description'
          ],
          collection: new ComponentLabelCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/componentLabels/:id', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/componentLabels/ComponentLabel',
        'app/componentLabels/templates/details',
        nls
      ],
      function(DetailsPage, ComponentLabel, template)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          navbarModuleName: 'production',
          baseBreadcrumb: [
            t('componentLabels', 'BREADCRUMB:operator'),
            {href: '#production;settings', label: t('componentLabels', 'BREADCRUMB:settings')}
          ],
          detailsTemplate: template,
          model: new ComponentLabel({_id: req.params.id})
        });
      }
    );
  });

  router.map('/componentLabels;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/componentLabels/ComponentLabel',
        'app/componentLabels/views/FormView',
        nls
      ],
      function(AddFormPage, ComponentLabel, FormView)
      {
        return new AddFormPage({
          pageClassName: 'page-max-flex',
          navbarModuleName: 'production',
          baseBreadcrumb: [
            t('componentLabels', 'BREADCRUMB:operator'),
            {href: '#production;settings', label: t('componentLabels', 'BREADCRUMB:settings')}
          ],
          FormView: FormView,
          model: new ComponentLabel()
        });
      }
    );
  });

  router.map('/componentLabels/:id;edit', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/componentLabels/ComponentLabel',
        'app/componentLabels/views/FormView',
        nls
      ],
      function(EditFormPage, ComponentLabel, FormView)
      {
        return new EditFormPage({
          pageClassName: 'page-max-flex',
          navbarModuleName: 'production',
          baseBreadcrumb: [
            t('componentLabels', 'BREADCRUMB:operator'),
            {href: '#production;settings', label: t('componentLabels', 'BREADCRUMB:settings')}
          ],
          FormView: FormView,
          model: new ComponentLabel({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/componentLabels/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/componentLabels/ComponentLabel', _, _, {
      pageClassName: 'page-max-flex',
      navbarModuleName: 'production',
      baseBreadcrumb: [
        t.bound('componentLabels', 'BREADCRUMB:operator'),
        {href: '#production;settings', label: t.bound('componentLabels', 'BREADCRUMB:settings')}
      ]
    })
  );
});
