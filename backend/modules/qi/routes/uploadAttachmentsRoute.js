// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const _ = require('lodash');

module.exports = function uploadAttachmentsRoute(app, qiModule, req, res)
{
  const attachments = {};

  _.forEach(req.files, function(file)
  {
    var id = file.filename.replace(/\..*?$/, '');

    qiModule.tmpAttachments[id] = {
      data: {
        _id: id,
        type: file.mimetype,
        path: file.filename,
        name: file.originalname,
        size: file.size,
        description: file.fieldname
      },
      timer: setTimeout(removeAttachmentFile, 30000, file.path)
    };

    attachments[file.fieldname] = id;
  });

  res.json(attachments);

  function removeAttachmentFile(filePath)
  {
    fs.unlink(filePath + '.min.jpg', () => {});
    fs.unlink(filePath, function(err)
    {
      if (err && err.code !== 'ENOENT')
      {
        qiModule.error("Failed to remove an unused attachment [%s]: %s", filePath, err.message);
      }
      else
      {
        qiModule.debug("Removed an unused attachment: %s", filePath);
      }
    });
  }
};
