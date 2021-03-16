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
  './Target',
  './TargetCollection',
  'i18n!app/nls/wmes-osh-targets'
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
  Target,
  TargetCollection
) {
  'use strict';

  const canView = user.auth('OSH:HR:VIEW');
  const canManage = user.auth('OSH:HR:MANAGE');

  router.map('/osh/targets', canView, (req) =>
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      collection: new TargetCollection(null, {rqlQuery: req.rql}),
      columns: [
        {id: 'month', className: 'is-min'},
        '-'
      ]
    })));
  });

  router.map('/osh/targets/:id', canView, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-targets/views/DetailsView',
        'css!app/wmes-osh-targets/assets/main'
      ],
      (DetailsView) =>
      {
        return dictionaries.bind(new DetailsPage({
          DetailsView,
          model: new Target({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/targets;add', canManage, () =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-targets/views/FormView',
        'css!app/wmes-osh-targets/assets/main'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new AddFormPage({
          FormView,
          model: new Target()
        }));
      }
    );
  });

  router.map('/osh/targets/:id;edit', canManage, (req) =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-targets/views/FormView',
        'css!app/wmes-osh-targets/assets/main'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new EditFormPage({
          FormView,
          model: new Target({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/targets/:id;delete', canManage, _.partial(showDeleteFormPage, Target, _, _, {

  }));
});
