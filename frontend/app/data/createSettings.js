// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../pubsub'
], function(
  pubsub
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
