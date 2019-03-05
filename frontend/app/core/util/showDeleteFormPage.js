// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
    var model;
    var deps = ['app/core/pages/ActionFormPage'];

    if (typeof Model === 'string')
    {
      deps.push('i18n!app/nls/' + Model.split('/')[1], Model);
    }
    else
    {
      model = new Model({_id: req.params.id});

      deps.push('i18n!app/nls/' + model.getNlsDomain());
    }

    viewport.loadPage(deps, function(ActionFormPage, nls, LoadedModel)
    {
      if (LoadedModel)
      {
        model = new LoadedModel({_id: req.params.id});
      }

      return new ActionFormPage(_.assign({
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
