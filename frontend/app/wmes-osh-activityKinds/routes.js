// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/router',
  'app/viewport',
  'app/user',
  'app/core/pages/ListPage',
  'app/core/pages/DetailsPage',
  'app/core/pages/AddFormPage',
  'app/core/pages/EditFormPage',
  'app/core/util/showDeleteFormPage',
  'app/wmes-osh-common/dictionaries',
  './ActivityKind',
  './ActivityKindCollection',
  'i18n!app/nls/wmes-osh-activityKinds'
], function(
  _,
  router,
  viewport,
  user,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  showDeleteFormPage,
  dictionaries,
  ActivityKind
) {
  'use strict';

  var canView = user.auth('OSH:DICTIONARIES:VIEW');
  var canManage = user.auth('OSH:DICTIONARIES:MANAGE');

  router.map('/osh/activityKinds', canView, () =>
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      load: null,
      collection: dictionaries.activityKinds,
      columns: [
        {id: 'shortName', className: 'is-min'},
        {id: 'longName'},
        {id: 'kinds', className: 'is-min'},
        {id: 'allowedTypes', className: 'is-min'},
        {id: 'resolution', className: 'is-min'},
        {id: 'participants', className: 'is-min'},
        {id: 'rootCauses', className: 'is-min'},
        {id: 'active', className: 'is-min'}
      ]
    })));
  });

  router.map('/osh/activityKinds/:id', canView, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-activityKinds/templates/details'
      ],
      (detailsTemplate) =>
      {
        const model = dictionaries.activityKinds.get(req.params.id);

        return dictionaries.bind(new DetailsPage({
          detailsTemplate,
          model: model || new ActivityKind({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/activityKinds;add', canManage, () =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-activityKinds/views/FormView'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new AddFormPage({
          FormView,
          model: new ActivityKind()
        }));
      }
    );
  });

  router.map('/osh/activityKinds/:id;edit', canManage, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-activityKinds/views/FormView'
      ],
      (FormView) =>
      {
        const model = dictionaries.activityKinds.get(req.params.id);

        return dictionaries.bind(new EditFormPage({
          FormView,
          model: model || new ActivityKind({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/activityKinds/:id;delete', canManage, _.partial(showDeleteFormPage, ActivityKind, _, _, {

  }));
});
