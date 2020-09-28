// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage
) {
  'use strict';

  var css = 'css!app/suggestions/assets/main';
  var nls = 'i18n!app/nls/suggestions';
  var canAccess = user.auth();
  var canAccessLocal = user.auth('LOCAL', 'USER');

  router.map('/suggestionCountReport', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/suggestions/SuggestionCountReport',
        'app/suggestions/pages/SuggestionCountReportPage',
        css,
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
        css,
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
        css,
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

  router.map('/suggestionRewardReport', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/kaizenOrders/dictionaries',
        'app/suggestions/RewardReport',
        'app/suggestions/pages/RewardReportPage',
        css,
        'i18n!app/nls/reports',
        nls
      ],
      function(dictionaries, RewardReport, RewardReportPage)
      {
        return dictionaries.bind(new RewardReportPage({
          model: RewardReport.fromQuery(req.query)
        }));
      }
    );
  });

  router.map('/suggestionHelp', function()
  {
    viewport.loadPage(['app/core/View', 'app/suggestions/templates/help', css, nls], function(View, helpTemplate)
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
        css,
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
        'app/suggestions/Suggestion',
        'app/suggestions/pages/SuggestionDetailsPage',
        'app/suggestions/views/SuggestionThankYouView',
        css,
        nls
      ],
      function(Suggestion, SuggestionDetailsPage, SuggestionThankYouView)
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
        'app/suggestions/Suggestion',
        'app/suggestions/pages/SuggestionAddFormPage',
        css,
        nls
      ],
      function(Suggestion, SuggestionAddFormPage)
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
        'app/suggestions/Suggestion',
        'app/suggestions/pages/SuggestionEditFormPage',
        css,
        nls
      ],
      function(Suggestion, SuggestionEditFormPage)
      {
        return new SuggestionEditFormPage({
          model: new Suggestion({_id: req.params.id}),
          standalone: !!req.query.standalone
        });
      }
    );
  });

  router.map('/suggestions/:id;delete', canAccess, _.partial(showDeleteFormPage, 'app/suggestions/Suggestion', _, _, {
    baseBreadcrumb: true
  }));
});
