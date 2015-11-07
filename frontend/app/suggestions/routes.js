// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './SuggestionCollection',
  './Suggestion',
  './SuggestionCountReport',
  './pages/SuggestionListPage',
  './pages/SuggestionDetailsPage',
  './pages/SuggestionAddFormPage',
  './pages/SuggestionEditFormPage',
  './pages/SuggestionCountReportPage',
  './views/SuggestionThankYouView',
  'i18n!app/nls/reports',
  'i18n!app/nls/kaizenOrders',
  'i18n!app/nls/suggestions'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  SuggestionCollection,
  Suggestion,
  SuggestionCountReport,
  SuggestionListPage,
  SuggestionDetailsPage,
  SuggestionAddFormPage,
  SuggestionEditFormPage,
  SuggestionCountReportPage,
  SuggestionThankYouView
) {
  'use strict';

  var canAccess = user.auth();

  router.map('/suggestionCountReport', canAccess, function(req)
  {
    viewport.showPage(new SuggestionCountReportPage({
      model: new SuggestionCountReport({
        from: +req.query.from || undefined,
        to: +req.query.to || undefined,
        interval: req.query.interval
      })
    }));
  });

  router.map('/suggestionHelp', function()
  {
    viewport.loadPage(['app/core/View', 'app/suggestions/templates/help'], function(View, helpTemplate)
    {
      return new View({
        layoutName: 'page',
        template: helpTemplate
      });
    });
  });

  router.map('/suggestions', canAccess, function(req)
  {
    viewport.showPage(new SuggestionListPage({
      collection: new SuggestionCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map('/suggestions/:id', canAccess, function(req)
  {
    var page = new SuggestionDetailsPage({
      model: new Suggestion({_id: req.params.id})
    });

    viewport.showPage(page);

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
  });

  router.map('/suggestions;add', canAccess, function()
  {
    viewport.showPage(new SuggestionAddFormPage({
      model: new Suggestion()
    }));
  });

  router.map('/suggestions/:id;edit', canAccess, function(req)
  {
    viewport.showPage(new SuggestionEditFormPage({
      model: new Suggestion({_id: req.params.id})
    }));
  });

  router.map('/suggestions/:id;delete', canAccess, _.partial(showDeleteFormPage, Suggestion, _, _, {
    baseBreadcrumb: true
  }));

});
