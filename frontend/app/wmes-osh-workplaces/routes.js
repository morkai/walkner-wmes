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
  './Workplace',
  './WorkplaceCollection',
  'i18n!app/nls/wmes-osh-workplaces'
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
  Workplace,
  WorkplaceCollection
) {
  'use strict';

  var canView = user.auth('OSH:DICTIONARIES:VIEW');
  var canManage = user.auth('OSH:DICTIONARIES:MANAGE');

  router.map('/osh/workplaces', canView, req =>
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      collection: new WorkplaceCollection(null, {rqlQuery: req.rql}),
      columns: [
        {id: 'shortName', className: 'is-min'},
        {id: 'longName'},
        {id: 'active', className: 'is-min'}
      ]
    })));
  });

  router.map('/osh/workplaces/:id', canView, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-workplaces/templates/details'
      ],
      (detailsTemplate) =>
      {
        return dictionaries.bind(new DetailsPage({
          detailsTemplate: detailsTemplate,
          model: new Workplace({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/workplaces;add', canManage, () =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-workplaces/views/FormView'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new AddFormPage({
          FormView,
          model: new Workplace()
        }));
      }
    );
  });

  router.map('/osh/workplaces/:id;edit', canManage, (req) =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-workplaces/views/FormView'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new EditFormPage({
          FormView,
          model: new Workplace({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/workplaces/:id;delete', canManage, _.partial(showDeleteFormPage, Workplace, _, _, {

  }));
});
