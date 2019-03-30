// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/views/DialogView',
  './ImageView',
  './ImageFormView',
  'app/snf-programs/templates/gallery',
  'app/snf-programs/templates/galleryThumbnail',
  'app/snf-programs/templates/yesNoDialog'
], function(
  _,
  t,
  viewport,
  View,
  DialogView,
  ImageView,
  ImageFormView,
  galleryTemplate,
  thumbnailTemplate,
  yesNoDialogTemplate
) {
  'use strict';

  return View.extend({

    template: galleryTemplate,

    events: {
      'click #-upload': function()
      {
        this.$id('files').click();
      },
      'change #-files': function(e)
      {
        this.handleFiles(e.target.files);
      },
      'dragenter': function()
      {
        if (this.enterCount <= 0)
        {
          this.enterCount = 1;
        }
        else
        {
          ++this.enterCount;
        }

        return false;
      },
      'dragleave': function()
      {
        --this.enterCount;

        if (this.enterCount <= 0)
        {
          this.$el.removeClass('is-valid is-invalid');
        }
      },
      'dragover': function(e)
      {
        this.$el.addClass(this.findImages(e.originalEvent.dataTransfer.items).length ? 'is-valid' : 'is-invalid');

        return false;
      },
      'drop': function(e)
      {
        this.enterCount = 0;

        this.$el.removeClass('is-valid is-invalid');

        this.handleFiles(e.originalEvent.dataTransfer.files);

        return false;
      },
      'click .snf-programs-image-edit': function(e)
      {
        var $thumbnail = this.$(e.target).closest('.thumbnail');
        var imageId = $thumbnail.attr('data-id');
        var programImageFormView = new ImageFormView({
          model: {
            programId: this.model.id,
            image: _.find(this.model.get('images'), function(image) { return image._id === imageId; })
          }
        });

        viewport.showDialog(programImageFormView, t('snf-programs', 'gallery:edit:title'));
      },
      'click .snf-programs-image-delete': function(e)
      {
        var $thumbnail = this.$(e.target).closest('.thumbnail');
        var view = this;
        var dialogView = new DialogView({
          template: yesNoDialogTemplate.bind(null, {
            severity: 'danger',
            message: view.t('gallery:delete:message'),
            yes: view.t('gallery:delete:yes'),
            no: view.t('gallery:delete:no')
          })
        });

        dialogView.on('answered', function(answer)
        {
          if (answer === 'yes')
          {
            view.deleteImage($thumbnail);
          }
        });

        viewport.showDialog(dialogView, view.t('gallery:delete:title'));
      },
      'click .thumbnail > a': function(e)
      {
        var imageId = this.$(e.target).closest('.thumbnail').attr('data-id');
        var image = _.find(this.model.get('images'), function(image) { return image._id === imageId; });

        if (!image)
        {
          return false;
        }

        var imageView = new ImageView({
          model: {
            programId: this.model.id,
            image: image
          }
        });

        viewport.showDialog(imageView);

        return false;
      }
    },

    remoteTopics: {

      'snf.programs.*.images.*': function(message, topic)
      {
        var program = this.model;

        if (message.program !== program.id)
        {
          return;
        }

        var images = program.get('images');
        var event = topic.split('.').pop();

        switch (event)
        {
          case 'added':
            images = [].concat(images, message.images);
            break;

          case 'deleted':
            images = images.filter(function(image) { return image._id !== message.image; });
            break;

          case 'edited':
            for (var i = 0; i < images.length; ++i)
            {
              var image = images[i];

              if (image._id === message.image._id)
              {
                images = [].concat(images);
                images[i] = message.image;

                break;
              }
            }
            break;
        }

        program.set('images', images, {action: event, message: message});
      }

    },

    initialize: function()
    {
      this.enterCount = 0;

      this.listenTo(this.model, 'change:images', this.onImagesChanged);
    },

    getTemplateData: function()
    {
      return {
        program: this.model.toJSON()
      };
    },

    findImages: function(files)
    {
      var images = [];

      for (var i = 0; i < files.length; ++i)
      {
        var file = files[i];

        if (/^image\/(jpeg|png|gif)$/.test(file.type))
        {
          images.push(file);
        }
      }

      return images;
    },

    findThumbnail: function(imageId)
    {
      return this.$('.thumbnail[data-id="' + imageId + '"]');
    },

    deleteImage: function($thumbnail)
    {
      $thumbnail.fadeOut('fast');
      $thumbnail.find('.btn').attr('disabled', true);

      var imageId = $thumbnail.attr('data-id');
      var req = this.ajax({
        type: 'DELETE',
        url: '/snf/programs/' + this.model.id + '/images/' + imageId
      });

      req.fail(function()
      {
        $thumbnail.find('.btn').attr('disabled', false);
        $thumbnail.fadeIn('fast');
      });
    },

    handleFiles: function(files)
    {
      var imageFileList = this.findImages(files);

      if (!imageFileList.length)
      {
        return;
      }

      var imageFileMap = {};

      for (var i = 0; i < imageFileList.length; ++i)
      {
        var imageFile = imageFileList[i];
        var imageId = Date.now().toString(36).toUpperCase()
          + (1000000000 + Math.random() * 1000000000).toString(36).replace('.', '').substr(0, 10).toUpperCase();

        this.createImageThumbnail(imageFile, imageId);

        imageFileMap[imageId] = imageFile;
      }

      this.uploadImageFiles(imageFileMap);
    },

    createImageThumbnail: function(file, imageId)
    {
      if (this.findThumbnail(imageId).length)
      {
        return;
      }

      var $thumbnail = this.renderPartial(thumbnailTemplate, {
        program: {
          _id: this.model.id
        },
        image: {
          _id: imageId,
          type: this.resolveImageType(file.type),
          label: file.name.replace(/\..*?$/, '')
        }
      });

      var imgEl = $thumbnail.find('img')[0];

      if (!file.size)
      {
        $thumbnail.hide().appendTo(this.$('.panel-body')).fadeIn('fast').find('a');

        return;
      }

      imgEl.src = '';

      var reader = new FileReader();
      reader.onload = function(e) { imgEl.src = e.target.result; };
      reader.readAsDataURL(file);

      $thumbnail.addClass('is-uploading').appendTo(this.$('.panel-body'));
    },

    resolveImageType: function(type)
    {
      switch (type)
      {
        case 'image/jpeg':
          return 'jpg';

        case 'image/png':
          return 'png';

        case 'image/gif':
          return 'gif';

        default:
          return type;
      }
    },

    uploadImageFiles: function(imageFiles)
    {
      var fd = new FormData();

      _.forEach(imageFiles, function(imageFile, imageId)
      {
        fd.append(imageId, imageFile);
      });

      var req = this.ajax({
        type: 'POST',
        url: '/snf/programs/' + this.model.id + '/images',
        data: fd,
        processData: false,
        contentType: false
      });

      var view = this;

      req.fail(function()
      {
        Object.keys(imageFiles).forEach(function(imageId)
        {
          var $thumbnail = view.findThumbnail(imageId);

          $thumbnail.fadeOut('fast', function()
          {
            $thumbnail.remove();
          });
        });
      });

      req.done(function()
      {
        Object.keys(imageFiles).forEach(function(imageId)
        {
          view.findThumbnail(imageId).removeClass('is-uploading');
        });
      });
    },

    onImagesChanged: function(e, images, options)
    {
      var $thumbnail;
      var message = options.message;

      switch (options.action)
      {
        case 'added':
          message.images.forEach(function(image)
          {
            var file = {
              type: image.type,
              name: image.label + '.' + image.type
            };

            this.createImageThumbnail(file, image._id);
          }, this);
          break;

        case 'deleted':
          $thumbnail = this.findThumbnail(message.image._id);

          if ($thumbnail.length)
          {
            $thumbnail.fadeOut('fast', function()
            {
              $thumbnail.remove();
            });
          }
          break;

        case 'edited':
          this.findThumbnail(message.image._id).find('.thumbnail-label').text(message.image.label);
          break;
      }
    }

  });
});
