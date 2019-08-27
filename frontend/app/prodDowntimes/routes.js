// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../prodChangeRequests/util/createShowDeleteFormPage',
  './ProdDowntime',
  './ProdDowntimeCollection'
], function(
  broker,
  router,
  viewport,
  user,
  createShowDeleteFormPage,
  ProdDowntime,
  ProdDowntimeCollection
) {
  'use strict';

  var css = 'css!app/prodDowntimes/assets/main';
  var nls = 'i18n!app/nls/prodDowntimes';
  var canView = user.auth('PROD_DATA:VIEW', 'PROD_DOWNTIMES:VIEW');
  var canManage = user.auth('PROD_DATA:MANAGE', 'PROD_DATA:CHANGES:REQUEST');

  router.map('/prodDowntimes', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/prodDowntimes/pages/ProdDowntimeListPage',
        css,
        nls
      ],
      function(ProdDowntimeListPage)
      {
        return new ProdDowntimeListPage({
          collection: new ProdDowntimeCollection(null, {
            rqlQuery: req.rql
          })
        });
      }
    );
  });

  router.map('/prodDowntimes;alerts', function()
  {
    var collection = new ProdDowntimeCollection();

    collection.rqlQuery.selector.args.forEach(function(term)
    {
      if (term.name === 'in' && term.args[0] === 'status')
      {
        term.name = 'eq';
        term.args = ['alerts.active', true];
      }
    });

    broker.publish('router.navigate', {
      url: '#prodDowntimes?' + collection.rqlQuery,
      trigger: true,
      replace: true
    });
  });

  router.map('/prodDowntimes/:id', function(req)
  {
    viewport.loadPage(
      [
        'app/prodDowntimes/pages/ProdDowntimeDetailsPage',
        css,
        nls
      ],
      function(ProdDowntimeDetailsPage)
      {
        return new ProdDowntimeDetailsPage({
          model: new ProdDowntime({
            _id: req.params.id
          }),
          corroborate: req.query.corroborate === '1'
        });
      }
    );
  });

  router.map('/prodDowntimes/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/prodDowntimes/pages/ProdDowntimeEditFormPage',
        nls
      ],
      function(ProdDowntimeEditFormPage)
      {
        return new ProdDowntimeEditFormPage({
          model: new ProdDowntime({_id: req.params.id})
        });
      }
    );
  });

  router.map('/prodDowntimes/:id;delete', canManage, createShowDeleteFormPage(ProdDowntime));

  router.map('/prodDowntimes;settings', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/prodDowntimes/pages/ProdDowntimeSettingsPage',
        nls
      ],
      function(ProdDowntimeSettingsPage)
      {
        return new ProdDowntimeSettingsPage({
          initialTab: req.query.tab
        });
      }
    );
  });
});
