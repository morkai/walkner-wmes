// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function prepareAttachments(tmpAttachments, body)
{
  const attachments = body.attachments;

  delete body.attachments;
  delete body.okFile;
  delete body.nokFile;

  if (!_.isObject(attachments))
  {
    return;
  }

  _.forEach(['okFile', 'nokFile'], function(fileProp)
  {
    const id = attachments[fileProp];

    // id is NULL when the existing attachment is checked for removal
    if (id === null)
    {
      body[fileProp] = null;

      return;
    }

    const attachment = tmpAttachments[id];

    if (!attachment)
    {
      return;
    }

    body[fileProp] = attachment.data;

    clearTimeout(attachment.timer);

    delete tmpAttachments[id];
  });
};
