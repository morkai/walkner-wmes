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
  './Division',
  './DivisionCollection',
  'i18n!app/nls/wmes-osh-divisions'
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
  Division
) {
  'use strict';

  var canView = user.auth('OSH:DICTIONARIES:VIEW');
  var canManage = user.auth('OSH:DICTIONARIES:MANAGE');

  router.map('/osh/divisions', canView, () =>
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      load: null,
      collection: dictionaries.divisions,
      columns: [
        {id: 'shortName', className: 'is-min'},
        {id: 'longName'},
        {id: 'active', className: 'is-min'}
      ]
    })));
  });

  router.map('/osh/divisions/:id', canView, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-divisions/templates/details'
      ],
      (detailsTemplate) =>
      {
        const model = dictionaries.divisions.get(req.params.id);

        return dictionaries.bind(new DetailsPage({
          detailsTemplate: detailsTemplate,
          model: model || new Division({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/divisions;add', canManage, () =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-divisions/views/FormView'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new AddFormPage({
          FormView,
          model: new Division()
        }));
      }
    );
  });

  router.map('/osh/divisions/:id;edit', canManage, (req) =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-divisions/views/FormView'
      ],
      (FormView) =>
      {
        const model = dictionaries.divisions.get(req.params.id);

        return dictionaries.bind(new EditFormPage({
          FormView,
          model: model || new Division({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/divisions/:id;delete', canManage, _.partial(showDeleteFormPage, Division, _, _, {

  }));
});
