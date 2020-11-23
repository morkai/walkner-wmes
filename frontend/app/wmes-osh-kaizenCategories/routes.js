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
  './KaizenCategory',
  './KaizenCategoryCollection',
  'i18n!app/nls/wmes-osh-kaizenCategories'
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
  KaizenCategory
) {
  'use strict';

  var canView = user.auth('OSH:DICTIONARIES:VIEW');
  var canManage = user.auth('OSH:DICTIONARIES:MANAGE');

  router.map('/osh/kaizenCategories', canView, () =>
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      load: null,
      collection: dictionaries.kaizenCategories,
      columns: [
        {id: 'shortName', className: 'is-min'},
        {id: 'longName'},
        {id: 'kinds', className: 'is-min'},
        {id: 'active', className: 'is-min'}
      ]
    })));
  });

  router.map('/osh/kaizenCategories/:id', canView, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-kaizenCategories/templates/details'
      ],
      (detailsTemplate) =>
      {
        const model = dictionaries.kaizenCategories.get(req.params.id);

        return dictionaries.bind(new DetailsPage({
          detailsTemplate,
          model: model || new KaizenCategory({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/kaizenCategories;add', canManage, () =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-kaizenCategories/views/FormView'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new AddFormPage({
          FormView,
          model: new KaizenCategory()
        }));
      }
    );
  });

  router.map('/osh/kaizenCategories/:id;edit', canManage, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-kaizenCategories/views/FormView'
      ],
      (FormView) =>
      {
        const model = dictionaries.kaizenCategories.get(req.params.id);

        return dictionaries.bind(new EditFormPage({
          FormView,
          model: model || new KaizenCategory({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/kaizenCategories/:id;delete', canManage, _.partial(showDeleteFormPage, KaizenCategory, _, _, {

  }));
});
