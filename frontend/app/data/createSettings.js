// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
      acquire: function()
      {
        if (releaseTimer !== null)
        {
          clearTimeout(releaseTimer);
          releaseTimer = null;
        }

        if (settingsCollection === null)
        {
          pubsubSandbox = pubsub.sandbox();
          settingsCollection = new SettingsCollection(null, {pubsub: pubsubSandbox});
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
