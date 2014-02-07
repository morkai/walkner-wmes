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
