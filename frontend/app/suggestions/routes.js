// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

  router.map('/suggestions', canAccess, function(req)
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

  router.map('/suggestions/:id', canAccess, function(req)
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
          model: new Suggestion({_id: req.params.id})
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

            viewport.showDialog(new SuggestionThankYouView());
          });
        }

        return page;
      }
    );
  });

  router.map('/suggestions;add', canAccess, function()
  {
    viewport.loadPage(
      [
        'app/suggestions/pages/SuggestionAddFormPage',
        nls
      ],
      function(SuggestionAddFormPage)
      {
        return new SuggestionAddFormPage({
          model: new Suggestion()
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
          model: new Suggestion({_id: req.params.id})
        });
      }
    );
  });

  router.map('/suggestions/:id;delete', canAccess, _.partial(showDeleteFormPage, Suggestion, _, _, {
    baseBreadcrumb: true
  }));

});
