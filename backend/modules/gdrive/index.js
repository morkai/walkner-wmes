// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const google = require('googleapis');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  key: {
    client_email: 'wmes@gserviceaccount.com',
    private_key: ''
  },
  rootId: '0B0WngVQEFzUVWEltMDR5TXppUE0'
};

exports.start = function startGdriveModule(app, module)
{
  let authQueue = null;
  let startPageToken = null;

  module.auth = new google.auth.JWT(
    module.config.key.client_email,
    null,
    module.config.key.private_key,
    ['https://www.googleapis.com/auth/drive']
  );

  module.drive = google.drive('v3');

  google.options({
    auth: module.auth
  });

  module.authorize = function(done)
  {
    if (authQueue !== null)
    {
      authQueue.push(done);
    }
    else
    {
      authQueue = [done];

      module.auth.authorize(function(err)
      {
        authQueue.forEach(callback => callback(err));
        authQueue = null;
      });
    }
  };

  app.broker.subscribe('app.started').setLimit(1).on('message', function()
  {
    module.authorize(function(err)
    {
      if (err)
      {
        module.error('Failed to authorize: %s', err.message);
      }
      else
      {
        module.debug('Authorized!');
      }

      // setTimeout(downloadFile, 100, '1mlHdH1FV9FcKeoJRzuHnbSrvLuQF_eI9P1faJTuuUfk');
      setTimeout(listFiles, 100);

      setTimeout(getStartPageToken, 1000);
    });
  });

  function createFile()
  {
    module.authorize(function(err)
    {
      if (err)
      {
        return module.error('Failed to create file: authorize failure: %s', err.message);
      }

      const req = {
        resource: {
          name: 'Testowy dokument',
          description: 'Opis testowego dokumentu :)',
          mimeType: 'application/vnd.google-apps.document',
          properties: {
            pageId: 'test'
          },
          createdTime: new Date().toISOString(),
          parents: [module.config.rootId],
          viewersCanCopyContent: true
        },
        media: {
          mimeType: 'application/vnd.oasis.opendocument.text',
          body: fs.createReadStream(__dirname + '/template.odt')
        }
      };

      module.drive.files.create(req, function(err, res)
      {
        if (err)
        {
          return module.error('Failed to create file:', err);
        }

        console.log('File create:');
        console.inspect(res);

        listRevisions(res.id);
      });
    });
  }

  function listRevisions(fileId)
  {
    module.authorize(function(err)
    {
      if (err)
      {
        return module.error('Failed to list revisions: authorize failure: %s', err.message);
      }

      const req = {
        fileId: fileId
      };

      module.drive.revisions.list(req, function(err, res)
      {
        if (err)
        {
          return module.error('Failed to list revisions: %s', err.message);
        }

        console.log('Revision list');
        console.inspect(res);

        publishRevision(fileId, res.revisions[res.revisions.length - 1].id);
      });
    });
  }

  function publishRevision(fileId, revisionId)
  {
    module.authorize(function(err)
    {
      if (err)
      {
        return module.error('Failed to publish revision: authorize failure: %s', err.message);
      }

      const req = {
        fileId: fileId,
        revisionId: revisionId,
        resource: {
          publishAuto: true,
          published: true,
          publishedOutsideDomain: true
        }
      };

      module.drive.revisions.update(req, function(err, res)
      {
        if (err)
        {
          return module.error('Failed to publish revision: %s', err.message);
        }

        console.log('Revision update');
        console.inspect(res);
      });
    });
  }

  function listFiles()
  {
    const t1 = Date.now();

    module.authorize(function(err)
    {
      if (err)
      {
        return module.error('Failed to list files: authorize failure: %s', err.message);
      }

      const t2 = Date.now();
      const req = {
        pageSize: 1000,
        fields: 'files(id,name,mimeType,parents,version,modifiedTime)',
        orderBy: 'folder, name'
      };

      module.drive.files.list(req, function(err, res)
      {
        if (err)
        {
          return module.error('Failed to list root folder: %s', err.message);
        }

        console.log('Listed files in %s (auth in %s ms, list in %s ms)', Date.now() - t1, t2 - t1, Date.now() - t2);
        console.inspect(res);
      });
    });
  }

  function downloadFile(fileId)
  {
    module.authorize(function(err)
    {
      if (err)
      {
        return module.error('Failed to download file: authorize failure: %s', err.message);
      }

      const req = {
        fileId: fileId,
        mimeType: 'application/zip'
      };
      const dest = fs.createWriteStream(__dirname + '/downloaded.zip');

      module.drive.files.export(req)
        .on('error', function(err)
        {
          module.error('Failed to download file: %s', err.message);
        })
        .on('end', function()
        {
          module.debug('Downloaded file: %s', fileId);
        })
        .pipe(dest);
    });
  }

  function getStartPageToken()
  {
    module.authorize(function(err)
    {
      if (err)
      {
        return module.error('Failed to get Start Page Token: authorize failure: %s', err.message);
      }

      module.drive.changes.getStartPageToken({}, function(err, res)
      {
        if (err)
        {
          return module.error('Failed to get Start Page Token: %s', err.message);
        }

        console.log('Start Page Token:', res);

        startPageToken = res.startPageToken;

        setImmediate(listChanges);
      });
    });
  }

  function listChanges()
  {
    module.authorize(function(err)
    {
      if (err)
      {
        return module.error('Failed to list changes: authorize failure: %s', err.message);
      }

      const req = {
        pageToken: startPageToken
      };

      module.drive.changes.list(req, function(err, res)
      {
        if (err)
        {
          return module.error('Failed to list changes: %s', err.message);
        }

        console.log('Changes:', res.changes);

        if (res.newStartPageToken)
        {
          startPageToken = res.newStartPageToken;

          console.log(`newStartPageToken=${startPageToken}`);

          setTimeout(listChanges, 10000);
        }

        if (res.nextPageToken)
        {
          startPageToken = res.nextPageToken;

          console.log(`nextPageToken=${startPageToken}`);

          setImmediate(listChanges);
        }
      });
    });
  }
};
