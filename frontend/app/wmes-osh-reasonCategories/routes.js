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
  './ReasonCategory',
  './ReasonCategoryCollection',
  'i18n!app/nls/wmes-osh-reasonCategories'
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
  ReasonCategory
) {
  'use strict';

  var canView = user.auth('OSH:DICTIONARIES:VIEW');
  var canManage = user.auth('OSH:DICTIONARIES:MANAGE');

  router.map('/osh/reasonCategories', canView, () =>
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      load: null,
      collection: dictionaries.reasonCategories,
      columns: [
        {id: 'shortName', className: 'is-min'},
        {id: 'longName'},
        {id: 'eventCategories', className: 'is-overflow w300'},
        {id: 'active', className: 'is-min'}
      ]
    })));
  });

  router.map('/osh/reasonCategories/:id', canView, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-reasonCategories/templates/details'
      ],
      (detailsTemplate) =>
      {
        const model = dictionaries.reasonCategories.get(req.params.id);

        return dictionaries.bind(new DetailsPage({
          detailsTemplate,
          model: model || new ReasonCategory({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/reasonCategories;add', canManage, () =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-reasonCategories/views/FormView'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new AddFormPage({
          FormView,
          model: new ReasonCategory()
        }));
      }
    );
  });

  router.map('/osh/reasonCategories/:id;edit', canManage, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-reasonCategories/views/FormView'
      ],
      (FormView) =>
      {
        const model = dictionaries.reasonCategories.get(req.params.id);

        return dictionaries.bind(new EditFormPage({
          FormView,
          model: model || new ReasonCategory({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/reasonCategories/:id;delete', canManage, _.partial(showDeleteFormPage, ReasonCategory, _, _, {

  }));
});
