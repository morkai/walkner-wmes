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

  var nls = 'i18n!app/nls/behaviorObsCards';
  var canAccess = user.auth();

  router.map('/behaviorObsCardCountReport', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/behaviorObsCards/BehaviorObsCardCountReport',
        'app/behaviorObsCards/pages/BehaviorObsCardCountReportPage',
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
        nls
      ],
      function(BehaviorObsCard, BehaviorObsCardDetailsPage)
      {
        return new BehaviorObsCardDetailsPage({
          model: new BehaviorObsCard({_id: req.params.id})
        });
      }
    );
  });

  router.map('/behaviorObsCards;add', canAccess, function()
  {
    viewport.loadPage(
      [
        'app/behaviorObsCards/BehaviorObsCard',
        'app/behaviorObsCards/pages/BehaviorObsCardAddFormPage',
        nls
      ],
      function(BehaviorObsCard, BehaviorObsCardAddFormPage)
      {
        return new BehaviorObsCardAddFormPage({
          model: new BehaviorObsCard({
            observer: user.getInfo()
          })
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
        nls
      ],
      function(BehaviorObsCard, BehaviorObsCardEditFormPage)
      {
        return new BehaviorObsCardEditFormPage({
          model: new BehaviorObsCard({_id: req.params.id})
        });
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
