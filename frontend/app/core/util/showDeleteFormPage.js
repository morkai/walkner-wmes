// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/viewport'
], function(
  _,
  viewport
) {
  'use strict';

  return function(Model, req, referer, options)
  {
    var model = new Model({_id: req.params.id});
    var deps = [
      'app/core/pages/ActionFormPage',
      'i18n!app/nls/' + model.getNlsDomain()
    ];

    viewport.loadPage(deps, function(ActionFormPage)
    {
      return new ActionFormPage(_.extend({
        model: model,
        actionKey: 'delete',
        successUrl: model.genClientUrl('base'),
        cancelUrl: referer || model.genClientUrl('base'),
        formMethod: 'DELETE',
        formAction: model.url(),
        formActionSeverity: 'danger'
      }, options));
    });
  };
});
