// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../router',
  '../viewport',
  '../user',
  '../core/pages/DetailsPage',
  '../core/util/showDeleteFormPage',
  '../core/util/pageActions'
], function(
  _,
  t,
  router,
  viewport,
  user,
  DetailsPage,
  showDeleteFormPage,
  pageActions
) {
  'use strict';

  var nls = 'i18n!app/nls/xiconfHidLamps';
  var canView = user.auth('XICONF:VIEW');
  var canManage = user.auth('XICONF:MANAGE', 'XICONF:MANAGE:HID_LAMPS');

  router.map('/xiconf/hidLamps', canView, function(req)
  {
    viewport.loadPage([
      'app/xiconfHidLamps/XiconfHidLampCollection',
      'app/xiconfHidLamps/pages/XiconfHidLampListPage',
      nls
    ], function(XiconfHidLampCollection, XiconfHidLampListPage)
    {
      return new XiconfHidLampListPage({
        collection: new XiconfHidLampCollection(null, {
          rqlQuery: req.rql
        })
      });
    });
  });

  router.map('/xiconf/hidLamps/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/xiconfHidLamps/XiconfHidLamp',
        'app/xiconfHidLamps/templates/details',
        nls
      ],
      function(XiconfHidLamp, detailsTemplate)
      {
        return new DetailsPage({
          detailsTemplate: detailsTemplate,
          model: new XiconfHidLamp({_id: req.params.id}),
          baseBreadcrumb: true,
          actions: function()
          {
            var privileges = ['XICONF:MANAGE', 'XICONF:MANAGE:HID_LAMPS'];

            return [
              pageActions.edit(this.model, privileges),
              pageActions.delete(this.model, privileges)
            ];
          }
        });
      }
    );
  });

  router.map('/xiconf/hidLamps;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/xiconfHidLamps/XiconfHidLamp',
        'app/xiconfHidLamps/views/XiconfHidLampFormView',
        nls
      ],
      function(AddFormPage, XiconfHidLamp, XiconfHidLampFormView)
      {
        return new AddFormPage({
          FormView: XiconfHidLampFormView,
          model: new XiconfHidLamp(),
          baseBreadcrumb: true
        });
      }
    );
  });

  router.map('/xiconf/hidLamps/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/xiconfHidLamps/XiconfHidLamp',
        'app/xiconfHidLamps/views/XiconfHidLampFormView',
        nls
      ],
      function(EditFormPage, XiconfHidLamp, XiconfHidLampFormView)
      {
        return new EditFormPage({
          FormView: XiconfHidLampFormView,
          model: new XiconfHidLamp({_id: req.params.id}),
          baseBreadcrumb: true
        });
      }
    );
  });

  router.map(
    '/xiconf/hidLamps/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/xiconfHidLamps/XiconfHidLamp', _, _, {
      baseBreadcrumb: true
    })
  );
});
