// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
    context.listenTo(modelOrCollection, 'request', function(modelOrCollection, jqXhr, options)
    {
      if (options.syncMethod === 'read')
      {
        if (options.showLoadingMessage !== false)
        {
          viewport.msg.loading();
        }

        jqXhr.done(onSync.bind(null, options));
        jqXhr.fail(onError.bind(null, options));
      }
    });

    function onSync(options)
    {
      if (options.showLoadingMessage !== false)
      {
        viewport.msg.loaded();
      }
    }

    function onError(options, jqXhr)
    {
      var code = jqXhr.statusText;

      if (code === 'abort')
      {
        if (options.showLoadingMessage !== false)
        {
          viewport.msg.loaded();
        }

        return;
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

      if (options.showLoadingMessage !== false)
      {
        viewport.msg.loadingFailed(t(domain || 'core', key || 'MSG:LOADING_FAILURE', {code: code}));
      }
    }

    return modelOrCollection;
  };
});
