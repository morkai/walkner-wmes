// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../time',
  '../core/Collection',
  './OrderDocumentUpload'
], function(
  _,
  $,
  time,
  Collection,
  OrderDocumentUpload
) {
  'use strict';

  return Collection.extend({

    model: OrderDocumentUpload,

    initialize: function()
    {
      this.upload = {
        active: false,
        current: null
      };

      this.on('remove', function(upload) { upload.stop(); });
    },

    addFromFile: function(file, folder)
    {
      this.add(OrderDocumentUpload.fromFile(file, folder));
    },

    serializeFiles: function()
    {
      return this
        .filter(function(upload) { return upload.isUploaded(); })
        .map(function(upload) { return upload.serializeFile(); });
    },

    setDate: function(newDate)
    {
      var moment = time.getMoment(newDate, 'YYYY-MM-DD');

      if (!moment.isValid())
      {
        return;
      }

      var date = moment.format('YYYY-MM-DD');

      this.forEach(function(upload)
      {
        upload.set('date', date);
      });
    },

    startUploading: function()
    {
      var uploads = this;
      var upload = uploads.upload;

      if (upload.active)
      {
        return;
      }

      upload.current = this.find(function(upload) { return upload.isUploadable(); });

      if (!upload.current)
      {
        return;
      }

      upload.active = true;

      upload.current.once('upload:done', function()
      {
        upload.current = null;

        if (upload.active)
        {
          upload.active = false;

          uploads.startUploading();
        }
      });

      upload.current.start();
    },

    stopUploading: function()
    {
      var upload = this.upload;

      if (upload.current)
      {
        upload.current.stop();
      }

      upload.active = false;
    },

    fillNames: function()
    {
      var uploads = this;
      var ids = uploads
        .filter(function(upload) { return upload.needsRealName(); })
        .map(function(upload) { return upload.get('nc15'); });

      if (!ids.length)
      {
        return null;
      }

      return $.ajax({url: '/orderDocuments/names?_id=in=(' + ids + ')'}).done(function(res)
      {
        var names = {};

        _.forEach(res.collection, function(doc)
        {
          names[doc._id] = doc.name;
        });

        uploads.forEach(function(upload)
        {
          var name = names[upload.get('nc15')];

          if (upload.needsRealName() && name)
          {
            upload.set('name', name);
          }
        });
      });
    }

  });
});
