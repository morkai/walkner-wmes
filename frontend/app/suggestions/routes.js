// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './Suggestion'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  Suggestion
) {
  'use strict';

  var nls = 'i18n!app/nls/suggestions';
  var canAccess = user.auth();
  var canAccessLocal = user.auth('LOCAL', 'USER');

  router.map('/suggestionCountReport', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/suggestions/SuggestionCountReport',
        'app/suggestions/pages/SuggestionCountReportPage',
        'i18n!app/nls/reports',
        nls
      ],
      function(SuggestionCountReport, SuggestionCountReportPage)
      {
        return new SuggestionCountReportPage({
          model: SuggestionCountReport.fromQuery(req.query)
        });
      }
    );
  });

  router.map('/suggestionSummaryReport', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/suggestions/SuggestionSummaryReport',
        'app/suggestions/pages/SuggestionSummaryReportPage',
        'i18n!app/nls/reports',
        nls
      ],
      function(SuggestionSummaryReport, SuggestionSummaryReportPage)
      {
        return new SuggestionSummaryReportPage({
          model: SuggestionSummaryReport.fromQuery(req.query)
        });
      }
    );
  });

  router.map('/suggestionEngagementReport', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/suggestions/SuggestionEngagementReport',
        'app/suggestions/pages/SuggestionEngagementReportPage',
        'i18n!app/nls/reports',
        nls
      ],
      function(SuggestionEngagementReport, SuggestionEngagementReportPage)
      {
        return new SuggestionEngagementReportPage({
          baseBreadcrumbNls: 'suggestions',
          model: SuggestionEngagementReport.fromQuery(req.query)
        });
      }
    );
  });

  router.map('/suggestionHelp', function()
  {
    viewport.loadPage(['app/core/View', 'app/suggestions/templates/help', nls], function(View, helpTemplate)
    {
      return new View({
        layoutName: 'page',
        template: helpTemplate
      });
    });
  });

  router.map('/suggestions', canAccessLocal, function(req)
  {
    viewport.loadPage(
      [
        'app/suggestions/SuggestionCollection',
        'app/suggestions/pages/SuggestionListPage',
        nls
      ],
      function(SuggestionCollection, SuggestionListPage)
      {
        return new SuggestionListPage({
          collection: new SuggestionCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/suggestions/:id', canAccessLocal, function(req)
  {
    viewport.loadPage(
      [
        'app/suggestions/pages/SuggestionDetailsPage',
        'app/suggestions/views/SuggestionThankYouView',
        nls
      ],
      function(SuggestionDetailsPage, SuggestionThankYouView)
      {
        var page = new SuggestionDetailsPage({
          model: new Suggestion({_id: req.params.id}),
          standalone: !!req.query.standalone
        });

        if (req.query.thank === 'you')
        {
          page.once('afterRender', function()
          {
            page.broker.publish('router.navigate', {
              url: '/suggestions/' + page.model.id,
              trigger: false,
              replace: true
            });

            viewport.showDialog(new SuggestionThankYouView({
              model: page.model
            }));
          });
        }

        return page;
      }
    );
  });

  router.map('/suggestions;add', canAccessLocal, function(req)
  {
    viewport.loadPage(
      [
        'app/suggestions/pages/SuggestionAddFormPage',
        nls
      ],
      function(SuggestionAddFormPage)
      {
        var operator = null;

        try
        {
          operator = JSON.parse(decodeURIComponent(atob(req.query.operator)));
        }
        catch (err) {} // eslint-disable-line no-empty

        var standalone = !!req.query.standalone;
        var p = 'WMES_STANDALONE_CLOSE_TIMER';

        if (standalone && typeof window[p] === 'undefined')
        {
          clearTimeout(window[p]);

          window.onblur = function()
          {
            clearTimeout(window[p]);
            window[p] = setTimeout(function() { window.close(); }, 60000);
          };
          window.onfocus = function()
          {
            clearTimeout(window[p]);
          };
        }

        return new SuggestionAddFormPage({
          model: new Suggestion(),
          standalone: standalone,
          operator: operator
        });
      }
    );
  });

  router.map('/suggestions/:id;edit', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/suggestions/pages/SuggestionEditFormPage',
        nls
      ],
      function(SuggestionEditFormPage)
      {
        return new SuggestionEditFormPage({
          model: new Suggestion({_id: req.params.id}),
          standalone: !!req.query.standalone
        });
      }
    );
  });

  router.map('/suggestions/:id;delete', canAccess, _.partial(showDeleteFormPage, Suggestion, _, _, {
    baseBreadcrumb: true
  }));
});
