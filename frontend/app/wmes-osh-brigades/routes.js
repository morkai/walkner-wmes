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
  './Brigade',
  './BrigadeCollection',
  'i18n!app/nls/wmes-osh-brigades'
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
  Brigade,
  BrigadeCollection
) {
  'use strict';

  const canView = user.auth('OSH:HR:VIEW', 'OSH:LEADER');
  const canManage = user.auth('OSH:HR:MANAGE', 'OSH:LEADER');

  router.map('/osh/brigades', canView, (req) =>
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      collection: new BrigadeCollection(null, {rqlQuery: req.rql}),
      columns: [
        {id: 'date', className: 'is-min'},
        {id: 'leader', className: 'is-min'},
        {id: 'workplace', className: 'is-min'},
        {id: 'department', className: 'is-min'},
        {id: 'shift', className: 'is-min'},
        {id: 'members', className: 'is-min'},
        '-'
      ]
    })));
  });

  router.map('/osh/brigades/:id', canView, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-brigades/templates/details'
      ],
      (detailsTemplate) =>
      {
        return dictionaries.bind(new DetailsPage({
          detailsTemplate: detailsTemplate,
          model: new Brigade({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/brigades;add', canManage, () =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-brigades/views/FormView'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new AddFormPage({
          FormView,
          model: new Brigade()
        }));
      }
    );
  });

  router.map('/osh/brigades/:id;edit', canManage, (req) =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-brigades/views/FormView'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new EditFormPage({
          FormView,
          model: new Brigade({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/brigades/:id;delete', canManage, _.partial(showDeleteFormPage, Brigade, _, _, {

  }));
});
