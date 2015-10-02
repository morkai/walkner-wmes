// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './OpinionSurveyScanTemplateCollection',
  './OpinionSurveyScanTemplate',
  './pages/OpinionSurveyScanTemplateListPage',
  './pages/OpinionSurveyScanTemplateDetailsPage',
  './pages/OpinionSurveyScanTemplateAddFormPage',
  './pages/OpinionSurveyScanTemplateEditFormPage',
  'i18n!app/nls/opinionSurveyScanTemplates'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  OpinionSurveyScanTemplateCollection,
  OpinionSurveyScanTemplate,
  OpinionSurveyScanTemplateListPage,
  OpinionSurveyScanTemplateDetailsPage,
  OpinionSurveyScanTemplateAddFormPage,
  OpinionSurveyScanTemplateEditFormPage
) {
  'use strict';

  var canView = user.auth();
  var canManage = user.auth('OPINION_SURVEYS:MANAGE');

  router.map('/opinionSurveyScanTemplates', canView, function(req)
  {
    viewport.showPage(new OpinionSurveyScanTemplateListPage({
      collection: new OpinionSurveyScanTemplateCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map('/opinionSurveyScanTemplates/:id', canView, function(req)
  {
    viewport.showPage(new OpinionSurveyScanTemplateDetailsPage({
      model: new OpinionSurveyScanTemplate({_id: req.params.id})
    }));
  });

  router.map('/opinionSurveyScanTemplates;add', canManage, function()
  {
    viewport.showPage(new OpinionSurveyScanTemplateAddFormPage({
      model: new OpinionSurveyScanTemplate()
    }));
  });

  router.map('/opinionSurveyScanTemplates/:id;edit', canManage, function(req)
  {
    viewport.showPage(new OpinionSurveyScanTemplateEditFormPage({
      model: new OpinionSurveyScanTemplate({_id: req.params.id})
    }));
  });

  router.map(
    '/opinionSurveyScanTemplates/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, OpinionSurveyScanTemplate, _, _, {
      baseBreadcrumb: true
    })
  );

});
