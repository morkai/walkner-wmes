// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user'
], function(
  router,
  viewport,
  user
) {
  'use strict';

  var css = 'css!app/sapLaborTimeFixer/assets/main';
  var nls = 'i18n!app/nls/sapLaborTimeFixer';
  var canView = user.auth('ORDERS:VIEW');

  router.map('/sapLaborTimeFixer/xData', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/sapLaborTimeFixer/pages/XDataListPage',
        'app/sapLaborTimeFixer/XDataCollection',
        css,
        nls
      ],
      function(XDataListPage, XDataCollection)
      {
        return new XDataListPage({
          collection: new XDataCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/sapLaborTimeFixer/xData/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/sapLaborTimeFixer/pages/XDataDetailsPage',
        'app/sapLaborTimeFixer/XData',
        css,
        nls
      ],
      function(XDataDetailsPage, XData)
      {
        return new XDataDetailsPage({
          model: new XData({_id: req.params.id}, {
            workCenter: req.query.workCenter || null,
            deps: (req.query.deps || '').split(',').filter(function(word) { return word.length > 0; })
          })
        });
      }
    );
  });
});
