// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const {google} = require('googleapis');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  key: {
    client_email: 'wmes@gserviceaccount.com',
    private_key: ''
  }
};

exports.start = function startGdriveModule(app, module)
{
  let authQueue = null;

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
        console.inspect(res.data);

        listRevisions(res.id);
      });
    });
  }
};
