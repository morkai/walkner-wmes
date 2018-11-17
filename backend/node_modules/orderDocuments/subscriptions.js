// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs-extra');
const step = require('h5.step');
const ejs = require('ejs');
const moment = require('moment');

module.exports = function setUpSubscriptions(app, module)
{
  const mailSender = app[module.config.mailSenderId];
  const mongoose = app[module.config.mongooseId];
  const User = mongoose.model('User');
  const Subscription = mongoose.model('Subscription');
  const OrderDocumentFolder = mongoose.model('OrderDocumentFolder');

  const emailTemplateFile = `${__dirname}/templates/fileEdited.email.pl.ejs`;
  const renderEmail = ejs.compile(fs.readFileSync(emailTemplateFile, 'utf8'), {
    cache: true,
    filename: emailTemplateFile,
    compileDebug: false,
    rmWhitespace: true
  });

  app.broker.subscribe('orderDocuments.tree.filePurged', onFilePurged);
  app.broker.subscribe('orderDocuments.tree.fileEdited', onFileEdited);

  function onFilePurged({file})
  {
    Subscription.deleteMany({type: 'orderDocumentTree', target: file._id.toString()}, err =>
    {
      if (err)
      {
        module.error(`Failed to delete subscriptions for file [${file._id}]: ${err.message}`);
      }
    });
  }

  function onFileEdited({file, user})
  {
    step(
      function()
      {
        Subscription
          .find({type: 'orderDocumentTree', target: file._id.toString()}, {_id: 0, user: 1})
          .lean()
          .exec(this.next());
      },
      function(err, subscriptions)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!subscriptions.length)
        {
          return this.skip();
        }

        User
          .find({_id: {$in: subscriptions.map(s => s.user)}}, {email: 1})
          .lean()
          .exec(this.parallel());

        OrderDocumentFolder
          .find({_id: {$in: file.folders}}, {name: 1})
          .lean()
          .exec(this.parallel());
      },
      function(err, users, folders)
      {
        if (err)
        {
          return this.skip(err);
        }

        const userId = user.id.toString();
        const emails = users.filter(u => !!u.email && u._id.toString() !== userId).map(u => u.email);

        if (!emails.length)
        {
          return this.skip();
        }

        const folderMap = new Map();

        folders.forEach(f => folderMap.set(f._id, f.name));

        const templateData = {
          urlPrefix: app.options.emailUrlPrefix,
          file: {
            _id: file._id,
            name: file.name,
            folders: file.folders.map(folder =>
            {
              return {
                _id: folder,
                name: folder === '__TRASH__' ? 'Śmietnik' : (folderMap.get(folder) || folder)
              };
            }),
            files: file.files.map(file =>
            {
              return {
                hash: file.hash,
                date: moment.utc(file.date).format('LL')
              };
            })
          }
        };

        const mailOptions = {
          to: emails,
          replyTo: emails,
          subject: `[WMES] Zmiana dokumentu: ${file.name} (${file._id})`,
          html: renderEmail(templateData)
        };

        mailSender.send(mailOptions, this.next());
      },
      function(err)
      {
        if (err)
        {
          module.error(`Failed to notify users about file edit [${file._id}]: ${err.message}`);
        }
      }
    );
  }
};
