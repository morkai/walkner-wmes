// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../i18n',
  '../time',
  '../core/Model',
  '../core/util/uuid',
  './allowedTypes'
], function(
  _,
  $,
  t,
  time,
  Model,
  uuid,
  allowedTypes
) {
  'use strict';

  return Model.extend({

    defaults: {
      folder: null,
      nc15: '',
      date: '',
      name: '',
      file: null,
      hash: '',
      retries: 0,
      progress: -1,
      error: null
    },

    initialize: function(attrs, options)
    {
      this.xhr = null;
      this.nameChanged = !!(options && options.nameChanged);

      this.once('change:name', function() { this.nameChanged = true; }, this);
    },

    needsRealName: function()
    {
      return !this.nameChanged && this.get('nc15').length === 15;
    },

    isUploadable: function()
    {
      return !this.xhr
        && !this.isUploaded()
        && !!this.get('file')
        && this.get('retries') < 5
        && !!allowedTypes[this.get('file').type];
    },

    isReuploadable: function()
    {
      return this.isUploadable() && this.get('error') !== null;
    },

    isUploaded: function()
    {
      return this.get('hash').length === 32;
    },

    isError: function()
    {
      return !!this.get('error');
    },

    getStatusClassName: function()
    {
      if (this.get('error'))
      {
        return 'danger';
      }

      var progress = this.get('progress');

      if (progress === 100)
      {
        return 'success';
      }

      if (progress === -1)
      {
        return 'primary';
      }

      return 'warning';
    },

    getProgress: function()
    {
      return this.get('error') ? 100 : Math.floor(Math.max(0, this.get('progress')));
    },

    getMessage: function()
    {
      var error = this.get('error');

      if (!error)
      {
        return '';
      }

      if (t.has('orderDocumentTree', 'uploads:error:' + error))
      {
        return t('orderDocumentTree', 'uploads:error:' + error);
      }

      return error;
    },

    serializeDetails: function()
    {
      return {
        id: this.id,
        nc15: this.get('nc15'),
        date: this.get('date'),
        name: this.get('name'),
        statusClassName: this.getStatusClassName(),
        virtual: !this.get('file'),
        progress: this.getProgress(),
        message: this.getMessage()
      };
    },

    serializeFile: function()
    {
      return {
        upload: this.id,
        folder: this.get('folder').id,
        nc15: this.get('nc15'),
        hash: this.get('hash'),
        date: this.get('date'),
        name: this.get('name'),
        type: this.get('type')
      };
    },

    start: function()
    {
      var upload = this;

      if (upload.xhr)
      {
        return;
      }

      var onProgress = function(e)
      {
        if (e.lengthComputable)
        {
          upload.set('progress', Math.min(Math.floor(e.loaded / e.total * 100), 99));
        }
      };
      var formData = new FormData();

      formData.append('file', this.get('file'));

      upload.xhr = $.ajax({
        type: 'POST',
        url: '/orderDocuments/uploads',
        data: formData,
        dataType: 'text',
        processData: false,
        contentType: false,
        xhr: function()
        {
          var xhr = new XMLHttpRequest();

          if (xhr.upload)
          {
            xhr.upload.addEventListener('progress', onProgress);
          }

          return xhr;
        }
      });

      upload.xhr.done(function()
      {
        if (/^[a-f0-9]{32}$/.test(upload.xhr.responseText))
        {
          upload.set({
            hash: upload.xhr.responseText,
            progress: 100
          });
        }
        else
        {
          upload.set('error', 'INVALID_RESPONSE');
        }
      });

      upload.xhr.fail(function()
      {
        upload.set('error', upload.xhr.responseText || 'UNKNOWN_ERROR');
      });

      upload.xhr.always(function()
      {
        upload.xhr = null;

        upload.trigger('upload:done');
      });

      upload.set({
        progress: 0,
        retries: upload.get('retries') + 1
      });
      upload.trigger('upload:start', upload, upload.xhr);
    },

    stop: function()
    {
      if (this.xhr)
      {
        this.xhr.abort();
      }
    }

  }, {

    fromDocument: function(document, folder, hash)
    {
      var files = document.get('files');
      var file = !hash ? files[0] : _.find(files, function(file) { return file.hash === hash; });

      return new this({
        _id: uuid(),
        folder: folder,
        nc15: document.id,
        date: time.utc.format(file.date, 'YYYY-MM-DD'),
        name: document.get('name'),
        type: file.type,
        hash: file.hash,
        progress: 100
      }, {
        nameChanged: true
      });
    },

    fromFile: function(file, folder)
    {
      var nc15 = this.resolveNc15(file.name);
      var date = time.format(Date.now(), 'YYYY-MM-DD');
      var name = this.resolveName(file.name, nc15);
      var requiredExt = allowedTypes[file.type];
      var actualExt = file.name.split('.').pop().toLowerCase();
      var error = null;

      if (!requiredExt)
      {
        error = 'INVALID_TYPE';
      }
      else if (actualExt !== requiredExt)
      {
        error = 'INVALID_EXT';
      }

      return new this({
        _id: uuid(),
        folder: folder,
        nc15: nc15,
        date: date,
        name: name,
        type: file.type,
        file: file,
        error: error
      });
    },

    resolveNc15: function(fileName)
    {
      var matches = fileName.match(/([0-9]{15})/);

      return matches ? matches[1] : '';
    },

    resolveName: function(fileName, nc15)
    {
      var name = fileName.replace(/\.pdf/i, '');

      if (nc15)
      {
        name = name.replace(nc15, '');
      }

      name = name
        .replace(/^[^A-Za-z0-9ęóąśłżźćńĘÓĄŚŁŻŹĆŃ]+/, '')
        .replace(/[^A-Za-z0-9ęóąśłżźćńĘÓĄŚŁŻŹĆŃ]+$/, '');

      return name === '' ? nc15 : name;
    }

  });
});
