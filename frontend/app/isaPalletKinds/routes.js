// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../i18n',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/isaPalletKinds',
  './IsaPalletKind'
], function(
  router,
  viewport,
  t,
  user,
  showDeleteFormPage,
  isaPalletKinds,
  IsaPalletKind
) {
  'use strict';

  var nls = 'i18n!app/nls/isaPalletKinds';
  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/isaPalletKinds', canView, function()
  {
    viewport.loadPage(['app/core/pages/ListPage', nls], function(ListPage)
    {
      return new ListPage({
        collection: isaPalletKinds,
        columns: [
          {id: 'shortName', className: 'is-min'},
          'fullName'
        ]
      });
    });
  });

  router.map('/isaPalletKinds/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/isaPalletKinds/templates/details', nls],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          model: new IsaPalletKind({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/isaPalletKinds;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/isaPalletKinds/templates/form', nls],
      function(AddFormPage, template)
      {
        return new AddFormPage({
          model: new IsaPalletKind(),
          formTemplate: template
        });
      }
    );
  });

  router.map('/isaPalletKinds/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/isaPalletKinds/templates/form', nls],
      function(EditFormPage, template)
      {
        return new EditFormPage({
          model: new IsaPalletKind({_id: req.params.id}),
          formTemplate: template
        });
      }
    );
  });

  router.map('/isaPalletKinds/:id;delete', canManage, showDeleteFormPage.bind(null, IsaPalletKind));
});
