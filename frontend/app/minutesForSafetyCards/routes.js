// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

  var nls = 'i18n!app/nls/minutesForSafetyCards';
  var canAccess = user.auth();

  router.map('/minutesForSafetyCards', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/minutesForSafetyCards/MinutesForSafetyCardCollection',
        'app/minutesForSafetyCards/pages/MinutesForSafetyCardListPage',
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

  router.map('/minutesForSafetyCards;add', canAccess, function()
  {
    viewport.loadPage(
      [
        'app/minutesForSafetyCards/MinutesForSafetyCard',
        'app/minutesForSafetyCards/pages/MinutesForSafetyCardAddFormPage',
        nls
      ],
      function(MinutesForSafetyCard, MinutesForSafetyCardAddFormPage)
      {
        return new MinutesForSafetyCardAddFormPage({
          model: new MinutesForSafetyCard()
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
        nls
      ],
      function(MinutesForSafetyCard, MinutesForSafetyCardEditFormPage)
      {
        return new MinutesForSafetyCardEditFormPage({
          model: new MinutesForSafetyCard({_id: req.params.id})
        });
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
