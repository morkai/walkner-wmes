// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/broker',
  'app/router',
  'app/viewport',
  'app/user',
  'app/core/pages/ListPage',
  'app/core/pages/DetailsPage',
  'app/core/pages/AddFormPage',
  'app/core/pages/EditFormPage',
  'app/core/util/showDeleteFormPage',
  'app/wmes-osh-common/dictionaries',
  './Kind',
  './KindCollection',
  'i18n!app/nls/wmes-osh-kinds'
], function(
  _,
  broker,
  router,
  viewport,
  user,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  showDeleteFormPage,
  dictionaries,
  Kind
) {
  'use strict';

  var canView = user.auth('OSH:DICTIONARIES:VIEW');
  var canManage = user.auth('OSH:DICTIONARIES:MANAGE');

  router.map('/osh/kinds', canView, () =>
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      load: null,
      collection: dictionaries.kinds,
      columns: [
        {id: 'type', className: 'is-min'},
        {id: 'shortName', className: 'is-min'},
        {id: 'longName'},
        {id: 'active', className: 'is-min'}
      ]
    })));
  });

  router.map('/osh/kinds/:id', canView, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-kinds/templates/details'
      ],
      function(detailsTemplate)
      {
        const model = dictionaries.kinds.get(req.params.id);

        return dictionaries.bind(new DetailsPage({
          detailsTemplate,
          model: model || new Kind({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/kinds;add', canManage, () =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-kinds/views/FormView'
      ],
      function(FormView)
      {
        return dictionaries.bind(new AddFormPage({
          FormView,
          model: new Kind()
        }));
      }
    );
  });

  router.map('/osh/kinds/:id;edit', canManage, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-kinds/views/FormView'
      ],
      function(FormView)
      {
        const model = dictionaries.kinds.get(req.params.id);

        return dictionaries.bind(new EditFormPage({
          FormView,
          model: model || new Kind({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/kinds/:id;delete', canManage, _.partial(showDeleteFormPage, Kind, _, _, {

  }));
});
