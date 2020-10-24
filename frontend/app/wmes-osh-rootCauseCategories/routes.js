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
  './RootCauseCategory',
  './RootCauseCategoryCollection',
  'i18n!app/nls/wmes-osh-rootCauseCategories'
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
  RootCauseCategory
) {
  'use strict';

  var canView = user.auth('OSH:DICTIONARIES:VIEW');
  var canManage = user.auth('OSH:DICTIONARIES:MANAGE');

  router.map('/osh/rootCauseCategories', canView, () =>
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      load: null,
      collection: dictionaries.rootCauseCategories,
      columns: [
        {id: 'shortName', className: 'is-min'},
        {id: 'longName'},
        {id: 'position', className: 'is-min'},
        {id: 'active', className: 'is-min'}
      ]
    })));
  });

  router.map('/osh/rootCauseCategories/:id', canView, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-rootCauseCategories/templates/details'
      ],
      (detailsTemplate) =>
      {
        const model = dictionaries.rootCauseCategories.get(req.params.id);

        return dictionaries.bind(new DetailsPage({
          detailsTemplate,
          model: model || new RootCauseCategory({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/rootCauseCategories;add', canManage, () =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-rootCauseCategories/views/FormView'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new AddFormPage({
          FormView,
          model: new RootCauseCategory()
        }));
      }
    );
  });

  router.map('/osh/rootCauseCategories/:id;edit', canManage, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-rootCauseCategories/views/FormView'
      ],
      (FormView) =>
      {
        const model = dictionaries.rootCauseCategories.get(req.params.id);

        return dictionaries.bind(new EditFormPage({
          FormView,
          model: model || new RootCauseCategory({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/rootCauseCategories/:id;delete', canManage, _.partial(showDeleteFormPage, RootCauseCategory, _, _, {

  }));
});
