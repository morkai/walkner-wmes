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

  var css = 'css!app/behaviorObsCards/assets/main';
  var nls = 'i18n!app/nls/behaviorObsCards';
  var canAccess = user.auth('LOCAL', 'USER');

  router.map('/behaviorObsCardCountReport', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/behaviorObsCards/BehaviorObsCardCountReport',
        'app/behaviorObsCards/pages/BehaviorObsCardCountReportPage',
        css,
        'i18n!app/nls/reports',
        nls
      ],
      function(BehaviorObsCardCountReport, BehaviorObsCardCountReportPage)
      {
        return new BehaviorObsCardCountReportPage({
          model: BehaviorObsCardCountReport.fromQuery(req.query)
        });
      }
    );
  });

  router.map('/behaviorObsCards', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/behaviorObsCards/BehaviorObsCardCollection',
        'app/behaviorObsCards/pages/BehaviorObsCardListPage',
        css,
        nls
      ],
      function(BehaviorObsCardCollection, BehaviorObsCardListPage)
      {
        return new BehaviorObsCardListPage({
          collection: new BehaviorObsCardCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/behaviorObsCards/:id', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/behaviorObsCards/BehaviorObsCard',
        'app/behaviorObsCards/pages/BehaviorObsCardDetailsPage',
        css,
        nls
      ],
      function(BehaviorObsCard, BehaviorObsCardDetailsPage)
      {
        return new BehaviorObsCardDetailsPage({
          model: new BehaviorObsCard({_id: req.params.id}),
          standalone: !!req.query.standalone
        });
      }
    );
  });

  router.map('/behaviorObsCards;add', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/behaviorObsCards/BehaviorObsCard',
        'app/behaviorObsCards/pages/BehaviorObsCardAddFormPage',
        css,
        nls
      ],
      function(BehaviorObsCard, BehaviorObsCardAddFormPage)
      {
        var lastCard = {
          observer: user.getInfo()
        };

        try { _.assign(lastCard, JSON.parse(sessionStorage.getItem('BOC_LAST'))); }
        catch (err) {} // eslint-disable-line no-empty
        finally { sessionStorage.removeItem('BOC_LAST'); }

        if (req.query.nearMiss)
        {
          lastCard.nearMiss = +req.query.nearMiss;

          broker.publish('router.navigate', {
            url: '/behaviorObsCards;add',
            trigger: false,
            replace: true
          });
        }
        else if (req.query.suggestion)
        {
          lastCard.suggestion = +req.query.suggestion;

          broker.publish('router.navigate', {
            url: '/behaviorObsCards;add',
            trigger: false,
            replace: true
          });
        }

        var operator = null;

        try
        {
          operator = JSON.parse(decodeURIComponent(atob(req.query.operator)));
        }
        catch (err) {} // eslint-disable-line no-empty

        if (operator)
        {
          lastCard.observer.id = operator.id;
          lastCard.observer.label = operator.text;
        }

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

        return new BehaviorObsCardAddFormPage({
          model: new BehaviorObsCard(lastCard),
          standalone: standalone
        });
      }
    );
  });

  router.map('/behaviorObsCards/:id;edit', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/behaviorObsCards/BehaviorObsCard',
        'app/behaviorObsCards/pages/BehaviorObsCardEditFormPage',
        css,
        nls
      ],
      function(BehaviorObsCard, BehaviorObsCardEditFormPage)
      {
        var model = new BehaviorObsCard({_id: req.params.id});
        var lastCard = {};

        try { _.assign(lastCard, JSON.parse(sessionStorage.getItem('BOC_LAST'))); }
        catch (err) {} // eslint-disable-line no-empty
        finally { sessionStorage.removeItem('BOC_LAST'); }

        if (req.query.nearMiss)
        {
          lastCard.nearMiss = +req.query.nearMiss;

          broker.publish('router.navigate', {
            url: '/behaviorObsCards/' + req.params.id + ';edit',
            trigger: false,
            replace: true
          });
        }
        else if (req.query.suggestion)
        {
          lastCard.suggestion = +req.query.suggestion;

          broker.publish('router.navigate', {
            url: '/behaviorObsCards/' + req.params.id + ';edit',
            trigger: false,
            replace: true
          });
        }

        var page = new BehaviorObsCardEditFormPage({
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
    '/behaviorObsCards/:id;delete',
    canAccess,
    _.partial(showDeleteFormPage, 'app/behaviorObsCards/BehaviorObsCard', _, _, {
      baseBreadcrumb: true
    })
  );
});
