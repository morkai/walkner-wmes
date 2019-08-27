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

  var css = 'css!app/opinionSurveyScanTemplates/assets/main';
  var nls = 'i18n!app/nls/opinionSurveyScanTemplates';
  var canView = user.auth();
  var canManage = user.auth('OPINION_SURVEYS:MANAGE');

  router.map('/opinionSurveyScanTemplates', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/opinionSurveyScanTemplates/OpinionSurveyScanTemplateCollection',
        'app/opinionSurveyScanTemplates/pages/OpinionSurveyScanTemplateListPage',
        nls
      ],
      function(OpinionSurveyScanTemplateCollection, OpinionSurveyScanTemplateListPage)
      {
        return new OpinionSurveyScanTemplateListPage({
          collection: new OpinionSurveyScanTemplateCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/opinionSurveyScanTemplates/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/opinionSurveyScanTemplates/OpinionSurveyScanTemplate',
        'app/opinionSurveyScanTemplates/pages/OpinionSurveyScanTemplateDetailsPage',
        css,
        nls
      ],
      function(OpinionSurveyScanTemplate, OpinionSurveyScanTemplateDetailsPage)
      {
        return new OpinionSurveyScanTemplateDetailsPage({
          model: new OpinionSurveyScanTemplate({_id: req.params.id})
        });
      }
    );
  });

  router.map('/opinionSurveyScanTemplates;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/opinionSurveyScanTemplates/OpinionSurveyScanTemplate',
        'app/opinionSurveyScanTemplates/pages/OpinionSurveyScanTemplateAddFormPage',
        css,
        nls
      ],
      function(OpinionSurveyScanTemplate, OpinionSurveyScanTemplateAddFormPage)
      {
        return new OpinionSurveyScanTemplateAddFormPage({
          model: new OpinionSurveyScanTemplate()
        });
      }
    );
  });

  router.map('/opinionSurveyScanTemplates/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/opinionSurveyScanTemplates/OpinionSurveyScanTemplate',
        'app/opinionSurveyScanTemplates/pages/OpinionSurveyScanTemplateEditFormPage',
        css,
        nls
      ],
      function(OpinionSurveyScanTemplate, OpinionSurveyScanTemplateEditFormPage)
      {
        return new OpinionSurveyScanTemplateEditFormPage({
          model: new OpinionSurveyScanTemplate({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/opinionSurveyScanTemplates/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/opinionSurveyScanTemplates/OpinionSurveyScanTemplate', _, _, {
      baseBreadcrumb: true
    })
  );
});
