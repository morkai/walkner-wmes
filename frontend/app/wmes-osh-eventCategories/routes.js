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
  './EventCategory',
  './EventCategoryCollection',
  'i18n!app/nls/wmes-osh-eventCategories'
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
  EventCategory,
  EventCategoryCollection
) {
  'use strict';

  var canView = user.auth('OSH:DICTIONARIES:VIEW');
  var canManage = user.auth('OSH:DICTIONARIES:MANAGE');

  router.map('/osh/eventCategories', canView, req =>
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      collection: new EventCategoryCollection(null, {rqlQuery: req.rql}),
      columns: [
        {id: 'shortName', className: 'is-min'},
        {id: 'longName'},
        {id: 'active', className: 'is-min'}
      ]
    })));
  });

  router.map('/osh/eventCategories/:id', canView, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-eventCategories/templates/details'
      ],
      (detailsTemplate) =>
      {
        return dictionaries.bind(new DetailsPage({
          detailsTemplate,
          model: new EventCategory({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/eventCategories;add', canManage, () =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-eventCategories/views/FormView'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new AddFormPage({
          FormView,
          model: new EventCategory()
        }));
      }
    );
  });

  router.map('/osh/eventCategories/:id;edit', canManage, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-eventCategories/views/FormView'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new EditFormPage({
          FormView,
          model: new EventCategory({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/eventCategories/:id;delete', canManage, _.partial(showDeleteFormPage, EventCategory, _, _, {

  }));
});
