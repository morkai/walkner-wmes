define([
  '../router',
  '../viewport',
  '../user',
  '../i18n',
  '../data/downtimeReasons',
  './DowntimeReason',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/DowntimeReasonFormView',
  'app/downtimeReasons/templates/details',
  'i18n!app/nls/downtimeReasons'
], function(
  router,
  viewport,
  user,
  t,
  downtimeReasons,
  DowntimeReason,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  DowntimeReasonFormView,
  detailsTemplate
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/downtimeReasons', canView, function()
  {
    viewport.showPage(new ListPage({
      collection: downtimeReasons,
      columns: ['_id', 'label', 'opticsPosition', 'pressPosition', 'report1', 'auto'],
      serializeRow: function(model)
      {
        var row = model.toJSON();

        row.report1 = t('core', 'BOOL:' + row.report1);
        row.auto = t('core', 'BOOL:' + row.auto);

        return row;
      }
    }));
  });

  router.map('/downtimeReasons/:id', function(req)
  {
    viewport.showPage(new DetailsPage({
      model: new DowntimeReason({_id: req.params.id}),
      detailsTemplate: detailsTemplate
    }));
  });

  router.map('/downtimeReasons;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      FormView: DowntimeReasonFormView,
      model: new DowntimeReason()
    }));
  });

  router.map('/downtimeReasons/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      FormView: DowntimeReasonFormView,
      model: new DowntimeReason({_id: req.params.id})
    }));
  });

  router.map('/downtimeReasons/:id;delete', canManage, function(req, referer)
  {
    var model = new DowntimeReason({_id: req.params.id});

    viewport.showPage(new ActionFormPage({
      model: model,
      actionKey: 'delete',
      successUrl: model.genClientUrl('base'),
      cancelUrl: referer || model.genClientUrl('base'),
      formMethod: 'DELETE',
      formAction: model.url(),
      formActionSeverity: 'danger'
    }));
  });

});
