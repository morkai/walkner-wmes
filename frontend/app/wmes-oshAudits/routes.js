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

  var css = 'css!app/wmes-oshAudits/assets/main';
  var nls = 'i18n!app/nls/wmes-oshAudits';
  var canAccess = user.auth('USER');

  router.map('/oshAudits/reports/count', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-oshAudits/CountReport',
        'app/wmes-oshAudits/pages/CountReportPage',
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

  router.map('/oshAudits', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/core/util/pageActions',
        'app/kaizenOrders/dictionaries',
        'app/wmes-oshAudits/OshAuditCollection',
        'app/wmes-oshAudits/views/ListFilterView',
        'app/wmes-oshAudits/views/ListView',
        css,
        nls
      ],
      function(FilteredListPage, pageActions, dictionaries, OshAuditCollection, FilterView, ListView)
      {
        return dictionaries.bind(new FilteredListPage({
          FilterView: FilterView,
          ListView: ListView,
          collection: new OshAuditCollection(null, {rqlQuery: req.rql}),
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

  router.map('/oshAudits/:id', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kaizenOrders/dictionaries',
        'app/wmes-oshAudits/OshAudit',
        'app/wmes-oshAudits/templates/details',
        css,
        nls
      ],
      function(DetailsPage, dictionaries, OshAudit, detailsTemplate)
      {
        return dictionaries.bind(new DetailsPage({
          pageClassName: 'page-max-flex',
          detailsTemplate: detailsTemplate,
          model: new OshAudit({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/oshAudits;add', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/kaizenOrders/dictionaries',
        'app/wmes-oshAudits/OshAudit',
        'app/wmes-oshAudits/views/FormView',
        css,
        nls
      ],
      function(AddFormPage, dictionaries, OshAudit, FormView)
      {
        var data = {};

        try { _.assign(data, JSON.parse(sessionStorage.getItem('AUD_LAST'))); }
        catch (err) {} // eslint-disable-line no-empty
        finally { sessionStorage.removeItem('AUD_LAST'); }

        if (req.query.nearMiss)
        {
          data.nearMiss = +req.query.nearMiss;

          broker.publish('router.navigate', {
            url: '/oshAudits;add',
            trigger: false,
            replace: true
          });
        }

        return dictionaries.bind(new AddFormPage({
          pageClassName: 'page-max-flex',
          FormView: FormView,
          model: new OshAudit(data)
        }));
      }
    );
  });

  router.map('/oshAudits/:id;edit', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/kaizenOrders/dictionaries',
        'app/wmes-oshAudits/OshAudit',
        'app/wmes-oshAudits/views/FormView',
        css,
        nls
      ],
      function(EditFormPage, dictionaries, OshAudit, FormView)
      {
        var model = new OshAudit({_id: req.params.id});
        var data = {};

        try { _.assign(data, JSON.parse(sessionStorage.getItem('AUD_LAST'))); }
        catch (err) {} // eslint-disable-line no-empty
        finally { sessionStorage.removeItem('AUD_LAST'); }

        if (req.query.nearMiss)
        {
          data.nearMiss = +req.query.nearMiss;

          broker.publish('router.navigate', {
            url: '/oshAudits/' + req.params.id + ';edit',
            trigger: false,
            replace: true
          });
        }

        var page = dictionaries.bind(new EditFormPage({
          pageClassName: 'page-max-flex',
          FormView: FormView,
          model: model
        }));

        if (data._id === req.params.id)
        {
          page.listenToOnce(model, 'sync', function()
          {
            _.assign(model.attributes, data);
          });
        }

        return page;
      }
    );
  });

  router.map(
    '/oshAudits/:id;delete',
    canAccess,
    _.partial(showDeleteFormPage, 'app/wmes-oshAudits/OshAudit', _, _, {
      baseBreadcrumb: true
    })
  );
});
