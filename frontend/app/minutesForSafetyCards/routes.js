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

  var css = 'css!app/minutesForSafetyCards/assets/main';
  var nls = 'i18n!app/nls/minutesForSafetyCards';
  var canAccess = user.auth();

  router.map('/minutesForSafetyCardCountReport', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/minutesForSafetyCards/MinutesForSafetyCardCountReport',
        'app/minutesForSafetyCards/pages/MinutesForSafetyCardCountReportPage',
        css,
        'i18n!app/nls/reports',
        nls
      ],
      function(MinutesForSafetyCardCountReport, MinutesForSafetyCardCountReportPage)
      {
        return new MinutesForSafetyCardCountReportPage({
          model: MinutesForSafetyCardCountReport.fromQuery(req.query)
        });
      }
    );
  });

  router.map('/minutesForSafetyCards', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/minutesForSafetyCards/MinutesForSafetyCardCollection',
        'app/minutesForSafetyCards/pages/MinutesForSafetyCardListPage',
        css,
        nls
      ],
      function(MinutesForSafetyCardCollection, MinutesForSafetyCardListPage)
      {
        return new MinutesForSafetyCardListPage({
          collection: new MinutesForSafetyCardCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/minutesForSafetyCards/:id', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/minutesForSafetyCards/MinutesForSafetyCard',
        'app/minutesForSafetyCards/pages/MinutesForSafetyCardDetailsPage',
        css,
        nls
      ],
      function(MinutesForSafetyCard, MinutesForSafetyCardDetailsPage)
      {
        return new MinutesForSafetyCardDetailsPage({
          model: new MinutesForSafetyCard({_id: req.params.id})
        });
      }
    );
  });

  router.map('/minutesForSafetyCards;add', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/minutesForSafetyCards/MinutesForSafetyCard',
        'app/minutesForSafetyCards/pages/MinutesForSafetyCardAddFormPage',
        css,
        nls
      ],
      function(MinutesForSafetyCard, MinutesForSafetyCardAddFormPage)
      {
        var lastCard = {
          owner: user.getInfo()
        };

        try { _.assign(lastCard, JSON.parse(sessionStorage.getItem('MFS_LAST'))); }
        catch (err) {} // eslint-disable-line no-empty
        finally { sessionStorage.removeItem('MFS_LAST'); }

        if (req.query.nearMiss)
        {
          lastCard.nearMiss = +req.query.nearMiss;

          broker.publish('router.navigate', {
            url: '/minutesForSafetyCards;add',
            trigger: false,
            replace: true
          });
        }
        else if (req.query.suggestion)
        {
          lastCard.suggestion = +req.query.suggestion;

          broker.publish('router.navigate', {
            url: '/minutesForSafetyCards;add',
            trigger: false,
            replace: true
          });
        }

        return new MinutesForSafetyCardAddFormPage({
          model: new MinutesForSafetyCard(lastCard)
        });
      }
    );
  });

  router.map('/minutesForSafetyCards/:id;edit', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/minutesForSafetyCards/MinutesForSafetyCard',
        'app/minutesForSafetyCards/pages/MinutesForSafetyCardEditFormPage',
        css,
        nls
      ],
      function(MinutesForSafetyCard, MinutesForSafetyCardEditFormPage)
      {
        var model = new MinutesForSafetyCard({_id: req.params.id});
        var lastCard = {};

        try { _.assign(lastCard, JSON.parse(sessionStorage.getItem('MFS_LAST'))); }
        catch (err) {} // eslint-disable-line no-empty
        finally { sessionStorage.removeItem('MFS_LAST'); }

        if (req.query.nearMiss)
        {
          lastCard.nearMiss = +req.query.nearMiss;

          broker.publish('router.navigate', {
            url: '/minutesForSafetyCards/' + req.params.id + ';edit',
            trigger: false,
            replace: true
          });
        }
        else if (req.query.suggestion)
        {
          lastCard.suggestion = +req.query.suggestion;

          broker.publish('router.navigate', {
            url: '/minutesForSafetyCards/' + req.params.id + ';edit',
            trigger: false,
            replace: true
          });
        }

        var page = new MinutesForSafetyCardEditFormPage({
          model: model
        });

        if (lastCard._id === req.params.id)
        {
          page.listenToOnce(model, 'sync', function()
          {
            _.assign(model.attributes, lastCard);
          });
        }

        return page;
      }
    );
  });

  router.map(
    '/minutesForSafetyCards/:id;delete',
    canAccess,
    _.partial(showDeleteFormPage, 'app/minutesForSafetyCards/MinutesForSafetyCard', _, _, {
      baseBreadcrumb: true
    })
  );
});
