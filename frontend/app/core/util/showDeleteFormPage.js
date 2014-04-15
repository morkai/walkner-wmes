// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/viewport'
], function(
  viewport
) {
  'use strict';

  return function(Model, req, referer)
  {
    var model = new Model({_id: req.params.id});

    viewport.loadPage('app/core/pages/ActionFormPage', function(ActionFormPage)
    {
      return new ActionFormPage({
        model: model,
        actionKey: 'delete',
        successUrl: model.genClientUrl('base'),
        cancelUrl: referer || model.genClientUrl('base'),
        formMethod: 'DELETE',
        formAction: model.url(),
        formActionSeverity: 'danger'
      });
    });
  };
});
