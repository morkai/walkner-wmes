// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../router',
  '../viewport',
  '../user',
  '../core/pages/DetailsPage',
  '../core/util/showDeleteFormPage'
], function(
  _,
  t,
  router,
  viewport,
  user,
  DetailsPage,
  showDeleteFormPage
) {
  'use strict';

  var nls = 'i18n!app/nls/xiconfComponentWeights';
  var canView = user.auth('XICONF:VIEW');
  var canManage = user.auth('XICONF:MANAGE');

  router.map('/xiconf/componentWeights', canView, function(req)
  {
    viewport.loadPage([
      'app/xiconfComponentWeights/XiconfComponentWeightCollection',
      'app/xiconfComponentWeights/pages/XiconfComponentWeightListPage',
      nls
    ], function(XiconfComponentWeightCollection, XiconfComponentWeightListPage)
    {
      return new XiconfComponentWeightListPage({
        collection: new XiconfComponentWeightCollection(null, {
          rqlQuery: req.rql
        })
      });
    });
  });

  router.map('/xiconf/componentWeights/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/xiconfComponentWeights/XiconfComponentWeight',
        'app/xiconfComponentWeights/templates/details',
        nls
      ],
      function(XiconfComponentWeight, detailsTemplate)
      {
        return new DetailsPage({
          detailsTemplate: detailsTemplate,
          model: new XiconfComponentWeight({_id: req.params.id}),
          baseBreadcrumb: true
        });
      }
    );
  });

  router.map('/xiconf/componentWeights;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/xiconfComponentWeights/XiconfComponentWeight',
        'app/xiconfComponentWeights/views/XiconfComponentWeightFormView',
        nls
      ],
      function(AddFormPage, XiconfComponentWeight, XiconfComponentWeightFormView)
      {
        return new AddFormPage({
          FormView: XiconfComponentWeightFormView,
          model: new XiconfComponentWeight(),
          baseBreadcrumb: true
        });
      }
    );
  });

  router.map('/xiconf/componentWeights/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/xiconfComponentWeights/XiconfComponentWeight',
        'app/xiconfComponentWeights/views/XiconfComponentWeightFormView',
        nls
      ],
      function(EditFormPage, XiconfComponentWeight, XiconfComponentWeightFormView)
      {
        return new EditFormPage({
          FormView: XiconfComponentWeightFormView,
          model: new XiconfComponentWeight({_id: req.params.id}),
          baseBreadcrumb: true
        });
      }
    );
  });

  router.map(
    '/xiconf/componentWeights/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/xiconfComponentWeights/XiconfComponentWeight', _, _, {
      baseBreadcrumb: true
    })
  );

});
