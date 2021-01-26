// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

  var nls = 'i18n!app/nls/wmes-gft-pcbs';
  var canView = user.auth('GFT:VIEW');
  var canManage = user.auth('GFT:MANAGE');

  router.map('/gft/pcbs', canView, function(req)
  {
    viewport.loadPage([
      'app/wmes-gft-pcbs/GftPcbCollection',
      'app/wmes-gft-pcbs/pages/ListPage',
      nls
    ], function(GftPcbCollection, ListPage)
    {
      return new ListPage({
        collection: new GftPcbCollection(null, {
          rqlQuery: req.rql
        })
      });
    });
  });

  router.map('/gft/pcbs/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-gft-pcbs/GftPcb',
        'app/wmes-gft-pcbs/templates/details',
        nls
      ],
      function(GftPcb, detailsTemplate)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          detailsTemplate: detailsTemplate,
          model: new GftPcb({_id: req.params.id}),
          baseBreadcrumb: true,
          remoteTopics: {
            'gft.pcbs.imported': function() { this.promised(this.model.fetch()); }
          }
        });
      }
    );
  });

  router.map('/gft/pcbs;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/wmes-gft-pcbs/GftPcb',
        'app/wmes-gft-pcbs/views/FormView',
        nls
      ],
      function(AddFormPage, GftPcb, FormView)
      {
        return new AddFormPage({
          pageClassName: 'page-max-flex',
          FormView,
          model: new GftPcb(),
          baseBreadcrumb: true
        });
      }
    );
  });

  router.map('/gft/pcbs/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/wmes-gft-pcbs/GftPcb',
        'app/wmes-gft-pcbs/views/FormView',
        nls
      ],
      function(EditFormPage, GftPcb, FormView)
      {
        return new EditFormPage({
          pageClassName: 'page-max-flex',
          FormView,
          model: new GftPcb({_id: req.params.id}),
          baseBreadcrumb: true
        });
      }
    );
  });

  router.map(
    '/gft/pcbs/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/wmes-gft-pcbs/GftPcb', _, _, {
      baseBreadcrumb: true
    })
  );
});
