// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/pubsub',
  'app/core/util/bindLoadingMessage'
], function(
  pubsub,
  bindLoadingMessage
) {
  'use strict';

  return function createSettings(SettingsCollection)
  {
    var pubsubSandbox = null;
    var settingsCollection = null;
    var releaseTimer = null;

    function release()
    {
      releaseTimer = null;

      if (settingsCollection === null)
      {
        return;
      }

      pubsubSandbox.destroy();
      pubsubSandbox = null;
      settingsCollection = null;
    }

    return {
      bind: function(view, options)
      {
        view.settings = bindLoadingMessage(this.acquire(options), view);

        view.on('beforeLoad', function(page, requests)
        {
          requests.unshift(view.settings.fetchIfEmpty());
        });

        view.once('afterRender', this.acquire.bind(this, null));

        view.once('remove', this.release.bind(this));

        return view.settings;
      },
      acquire: function(options)
      {
        if (releaseTimer !== null)
        {
          clearTimeout(releaseTimer);
          releaseTimer = null;
        }

        if (settingsCollection === null)
        {
          if (!options)
          {
            options = {};
          }

          options.pubsub = pubsubSandbox = pubsub.sandbox();
          options.paginate = false;
          settingsCollection = new SettingsCollection(null, options);
        }

        return settingsCollection;
      },
      release: function()
      {
        if (releaseTimer !== null)
        {
          clearTimeout(releaseTimer);
        }

        releaseTimer = setTimeout(release, 30000);
      }
    };
  };
});
