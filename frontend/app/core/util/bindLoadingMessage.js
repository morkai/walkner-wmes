define([
  'app/i18n',
  'app/viewport'
], function(
  t,
  viewport
) {
  'use strict';

  return function bindLoadingMessage(modelOrCollection, context, key, domain)
  {
    if (!domain)
    {
      if (modelOrCollection.nlsDomain)
      {
        domain = modelOrCollection.nlsDomain;
      }
      else if (modelOrCollection.model.prototype.nlsDomain)
      {
        domain = modelOrCollection.model.prototype.nlsDomain;
      }
      else
      {
        domain = 'core';
      }
    }

    if (!key)
    {
      if (modelOrCollection.model)
      {
        key = 'MSG_LOADING_FAILURE';
      }
      else
      {
        key = 'MSG_LOADING_SINGLE_FAILURE';
      }
    }

    context.listenTo(modelOrCollection, 'request', viewport.msg.loading);
    context.listenTo(modelOrCollection, 'sync', viewport.msg.loaded);
    context.listenTo(modelOrCollection, 'error', function(modelOrCollection, jqXhr)
    {
      var code = jqXhr.statusText;

      if (code === 'abort')
      {
        return viewport.msg.loaded();
      }

      var json = jqXhr.responseJSON;

      if (json && json.error)
      {
        if (json.error.code)
        {
          code = json.error.code;
        }
        else if (json.error.message)
        {
          code = json.error.message;
        }
      }

      viewport.msg.loadingFailed(t(domain, key, {code: code}));
    });

    return modelOrCollection;
  };
});
