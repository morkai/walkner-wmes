// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage'
], function(
  _,
  broker,
  router,
  viewport,
  user,
  showDeleteFormPage
) {
  'use strict';

  var css = 'css!app/wmes-oshTalks/assets/main';
  var nls = 'i18n!app/nls/wmes-oshTalks';
  var canAccess = user.auth('USER');

  router.map('/oshTalkCountReport', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-oshTalks/CountReport',
        'app/wmes-oshTalks/pages/CountReportPage',
        css,
        'i18n!app/nls/reports',
        nls
      ],
      function(CountReport, CountReportPage)
      {
        return new CountReportPage({
          model: CountReport.fromQuery(req.query)
        });
      }
    );
  });

  router.map('/oshTalks', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/core/util/pageActions',
        'app/kaizenOrders/dictionaries',
        'app/wmes-oshTalks/OshTalkCollection',
        'app/wmes-oshTalks/views/ListFilterView',
        'app/wmes-oshTalks/views/ListView',
        css,
        nls
      ],
      function(FilteredListPage, pageActions, dictionaries, OshTalkCollection, FilterView, ListView)
      {
        return dictionaries.bind(new FilteredListPage({
          FilterView: FilterView,
          ListView: ListView,
          collection: new OshTalkCollection(null, {rqlQuery: req.rql}),
          actions: function(layout)
          {
            return [
              pageActions.jump(this, this.collection),
              pageActions.export(layout, this, this.collection),
              pageActions.add(this.collection, false)
            ];
          }
        }));
      }
    );
  });

  router.map('/oshTalks/:id', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kaizenOrders/dictionaries',
        'app/wmes-oshTalks/OshTalk',
        'app/wmes-oshTalks/templates/details',
        css,
        nls
      ],
      function(DetailsPage, dictionaries, OshTalk, detailsTemplate)
      {
        return dictionaries.bind(new DetailsPage({
          pageClassName: 'page-max-flex',
          detailsTemplate: detailsTemplate,
          model: new OshTalk({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/oshTalks;add', canAccess, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/kaizenOrders/dictionaries',
        'app/wmes-oshTalks/OshTalk',
        'app/wmes-oshTalks/views/FormView',
        css,
        nls
      ],
      function(AddFormPage, dictionaries, OshTalk, FormView)
      {
        return dictionaries.bind(new AddFormPage({
          pageClassName: 'page-max-flex',
          FormView: FormView,
          model: new OshTalk()
        }));
      }
    );
  });

  router.map('/oshTalks/:id;edit', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/kaizenOrders/dictionaries',
        'app/wmes-oshTalks/OshTalk',
        'app/wmes-oshTalks/views/FormView',
        css,
        nls
      ],
      function(EditFormPage, dictionaries, OshTalk, FormView)
      {
        return dictionaries.bind(new EditFormPage({
          pageClassName: 'page-max-flex',
          FormView: FormView,
          model: new OshTalk({_id: req.params.id})
        }));
      }
    );
  });

  router.map(
    '/oshTalks/:id;delete',
    canAccess,
    _.partial(showDeleteFormPage, 'app/wmes-oshTalks/OshTalk', _, _, {
      baseBreadcrumb: true
    })
  );
});
