// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage
) {
  'use strict';

  var nls = 'i18n!app/nls/kaizenTopics';
  var canView = user.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');

  router.map('/kaizenTopics', canView, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/kaizenOrders/dictionaries',
        nls
      ],
      function(ListPage, dictionaries)
      {
        return dictionaries.bind(new ListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          load: null,
          collection: dictionaries.topics,
          columns: [
            {id: 'shortName', className: 'is-min'},
            {id: 'fullName'},
            {id: 'active', className: 'is-min'},
            {id: 'position', className: 'is-min', tdClassName: 'is-number'}
          ]
        }));
      }
    );
  });

  router.map('/kaizenTopics/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenTopics/KaizenTopic',
        'app/kaizenTopics/templates/details',
        nls
      ],
      function(DetailsPage, dictionaries, KaizenTopic, detailsTemplate)
      {
        var model = dictionaries.topics.get(req.params.id) || new KaizenTopic({_id: req.params.id});

        return dictionaries.bind(new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          model: model,
          detailsTemplate: detailsTemplate
        }));
      }
    );
  });

  router.map('/kaizenTopics;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenTopics/KaizenTopic',
        'app/kaizenTopics/views/FormView',
        nls
      ],
      function(AddFormPage, dictionaries, KaizenTopic, KaizenTopicFormViewFormView)
      {
        return dictionaries.bind(new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: KaizenTopicFormViewFormView,
          model: new KaizenTopic()
        }));
      }
    );
  });

  router.map('/kaizenTopics/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenTopics/KaizenTopic',
        'app/kaizenTopics/views/FormView',
        nls
      ],
      function(EditFormPage, dictionaries, KaizenTopic, FormView)
      {
        var model = dictionaries.topics.get(req.params.id) || new KaizenTopic({_id: req.params.id});

        return dictionaries.bind(new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: FormView,
          model: model
        }));
      }
    );
  });

  router.map(
    '/kaizenTopics/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/kaizenTopics/KaizenTopic', _, _, {baseBreadcrumb: true})
  );
});
