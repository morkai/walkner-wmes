// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var fs = require('fs');
var semver = require('semver');
var step = require('h5.step');

module.exports = function sendUpdateRoute(app, xiconfModule, req, res, next)
{
  step(
    function findAllUpdatesStep()
    {
      fs.readdir(xiconfModule.config.updatesPath, this.next());
    },
    function filterUpdatesStep(err, allUpdateFiles)
    {
      if (err)
      {
        return this.skip(err);
      }

      var updates = [];
      var inputVersion = req.params.version;

      for (var i = 0; i < allUpdateFiles.length; ++i)
      {
        var updateFile = allUpdateFiles[i];
        var matches = updateFile.match(/^([0-9a-z.-]+)-([0-9a-z.-]+)\.zip$/);

        if (!matches)
        {
          continue;
        }

        var fromVersion = matches[1];
        var toVersion = matches[2];

        try
        {
          if (semver.satisfies(inputVersion, fromVersion))
          {
            updates.push({
              from: fromVersion,
              to: toVersion,
              fileName: updateFile
            });
          }
        }
        catch (err) {}
      }

      updates.sort(function(a, b)
      {
        return a.to === b.to ? 0 : semver.lt(a.to, b.to) ? -1 : 1;
      });

      var update = updates.length ? updates[updates.length - 1] : null;

      this.updateFile = update && semver.gt(update.to, inputVersion) ? update.fileName : null;
    },
    function respondStep(err)
    {
      if (err)
      {
        return next(err);
      }

      if (this.updateFile === null)
      {
        return res.sendStatus(204);
      }

      res.attachment(this.updateFile);
      res.sendFile(this.updateFile, {
        root: xiconfModule.config.updatesPath,
        lastModified: false,
        dotfiles: 'deny'
      });
    }
  );
};
