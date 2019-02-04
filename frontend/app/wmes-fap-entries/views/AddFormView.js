// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/viewport',
  'app/core/views/FormView',
  'app/core/util/uuid',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  'app/users/util/setUpUserSelect2',
  '../dictionaries',
  'app/wmes-fap-entries/templates/addForm',
  'app/wmes-fap-entries/templates/addFormUpload',
  'app/wmes-fap-entries/templates/notificationsPopover'
], function(
  _,
  $,
  user,
  viewport,
  FormView,
  uuid,
  idAndLabel,
  orgUnits,
  setUpUserSelect2,
  dictionaries,
  template,
  uploadTemplate,
  notificationsPopoverTemplate
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'click #-cancel': function()
      {
        this.trigger('cancel');
      },
      'click a[data-action="removeUpload"]': function(e)
      {
        var $upload = this.$(e.target).closest('.fap-addForm-upload');
        var uploadId = $upload[0].dataset.uploadId;
        var entry = this.model;

        if (entry.uploading && entry.uploading.upload._id === uploadId)
        {
          entry.uploading.abort();
          entry.uploading = null;
        }
        else
        {
          entry.uploadQueue = entry.uploadQueue.filter(function(upload) { return upload._id !== uploadId; });
          entry.uploadedFiles = entry.uploadedFiles.filter(function(upload) { return upload._id !== uploadId; });
        }

        this.removeUpload(uploadId);

        return false;
      },
      'change #-category': function(e)
      {
        var el = e.target;

        this.model.attributes[el.name] = el.value;

        this.saveInputFocus(el);
        this.updateNotifications();
        this.resolveSubdivisions();
      },
      'change #-lines, #-subdivisions': function(e)
      {
        var el = e.target;

        this.model.attributes[el.name] = el.value.length ? el.value.split(',') : [];

        this.saveInputFocus(el);
      },
      'input #-orderNo, #-problem': function(e)
      {
        this.model.attributes[e.target.name] = e.target.value;

        e.target.setCustomValidity('');

        this.saveInputFocus(e.target);

        if (e.target.name === 'orderNo' && e.target.value.length === 9)
        {
          this.validateOrder();
        }
      },
      'focus input, textarea': function(e)
      {
        this.saveInputFocus(e.target);
      },
      'blur input, textarea': function(e)
      {
        this.saveInputFocus(e.target);
      },
      'change #-orderNo': function()
      {
        this.validateOrder();
      },
      'click .fap-addForm-upload-name': function(e)
      {
        this.showUploadNameEditor(this.$(e.target).closest('.fap-addForm-upload')[0].dataset.uploadId);
      },
      'click #-copy': function()
      {
        this.copyLastEntry();
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.reloadLock = user.lockReload();

      var entry = this.model;

      if (!entry.uploadQueue)
      {
        entry.uploadQueue = [];
        entry.uploading = null;
        entry.uploadedFiles = [];
      }

      this.listenTo(dictionaries.categories, 'reset change', this.setUpCategorySelect2);
    },

    destroy: function()
    {
      FormView.prototype.destroy.apply(this, arguments);

      if (this.model.focusedInput)
      {
        this.saveInputFocus(this.$id(this.model.focusedInput.name)[0]);
      }

      $('.fap-addForm-backdrop').remove();

      user.unlockReload(this.reloadLock);

      dictionaries.unload();
    },

    afterRender: function()
    {
      var view = this;

      FormView.prototype.afterRender.apply(view, arguments);

      dictionaries.load();

      var $backdrop = $('.fap-addForm-backdrop');

      if (!$backdrop.length)
      {
        $backdrop = $('<div class="fap-addForm-backdrop"></div>')
          .appendTo('body')
          .on('click', function() { view.trigger('cancel'); });
      }

      view.$id('lines').select2({
        dropdownCssClass: 'fap-addForm-select2',
        multiple: true,
        allowClear: true,
        placeholder: ' ',
        data: orgUnits.getActiveByType('prodLine').map(idAndLabel)
      });

      view.renderUploads();
      view.setUpCategorySelect2();
      view.setUpSubdivisionsSelect2();
      view.setUpOwnerSelect2();
      view.setUpDnd(view.$el);
      view.setUpDnd($backdrop);
      view.updateNotifications();
      view.focusInput();
    },

    renderUploads: function()
    {
      var view = this;
      var $uploads = view.$id('uploads');

      view.model.uploadedFiles.forEach(function(upload)
      {
        view.renderUpload(upload, true).appendTo($uploads);
      });

      if (view.model.uploading)
      {
        view.renderUpload(view.model.uploading.upload, false).appendTo($uploads);
      }

      view.model.uploadQueue.forEach(function(upload)
      {
        view.renderUpload(upload, false).appendTo($uploads);
      });

      if ($uploads[0].childElementCount > 1)
      {
        $uploads[0].firstElementChild.classList.add('hidden');
      }

      $uploads.popover({
        placement: 'left',
        trigger: 'hover',
        container: $uploads.parent()[0],
        selector: '.fap-addForm-upload',
        html: true,
        content: function()
        {
          if (view.$el.hasClass('fap-addForm-editing'))
          {
            return;
          }

          var uploadId = this.dataset.uploadId;
          var upload = view.findUpload(uploadId);

          if (!upload || !upload.img)
          {
            return;
          }

          return upload.img;
        },
        template: function(template)
        {
          return $(template).addClass('fap-addForm-upload-popover').attr('data-upload-id', this.dataset.uploadId);
        }
      });
    },

    renderUpload: function(upload, uploaded)
    {
      return this.renderPartial(uploadTemplate, {
        uploaded: uploaded,
        upload: upload
      });
    },

    setUpCategorySelect2: function()
    {
      this.$id('category').select2({
        dropdownCssClass: 'fap-addForm-select2',
        data: dictionaries.categories.where({active: true}).map(idAndLabel)
      });
    },

    setUpSubdivisionsSelect2: function()
    {
      this.$id('subdivisions')
        .select2({
          dropdownCssClass: 'fap-addForm-select2',
          placeholder: ' ',
          allowClear: true,
          multiple: true,
          data: orgUnits.getActiveByType('division').map(function(division)
          {
            var divisionText = division.getLabel();

            return {
              text: divisionText,
              children: orgUnits.getChildren(division)
                .filter(function(subdivision) { return !subdivision.get('deactivatedAt'); })
                .map(function(subdivision)
                {
                  return {
                    id: subdivision.id,
                    text: subdivision.getLabel(),
                    divisionText: divisionText
                  };
                })
            };
          }),
          formatSelection: function(item, container, e)
          {
            return e(item.divisionText + ' \\ ' + item.text);
          }
        });
    },

    setUpOwnerSelect2: function()
    {
      var $owner = this.$id('owner');

      if (!$owner.length)
      {
        return;
      }

      setUpUserSelect2($owner, {
        view: this,
        noPersonnelId: true,
        width: '100%',
        dropdownCssClass: 'fap-addForm-select2'
      });
    },

    setUpDnd: function($el)
    {
      $el
        .on('drag dragstart dragend dragover dragenter dragleave drop', function(e)
        {
          e.preventDefault();
          e.stopPropagation();
        })
        .on('drop', this.onDrop.bind(this));
    },

    onDrop: function(e)
    {
      var view = this;
      var entry = view.model;
      var files = Array.prototype.slice.call(e.originalEvent.dataTransfer.files);
      var totalFiles = (entry.uploading ? 1 : 0)
        + entry.uploadQueue.length
        + entry.uploadedFiles.length
        + files.length;

      if (totalFiles > 5)
      {
        viewport.msg.show({
          type: 'warning',
          time: 2500,
          text: view.t('upload:tooMany', {max: 5})
        });

        return false;
      }

      files.forEach(function(file)
      {
        var img = null;

        if (file.type.indexOf('image/') === 0)
        {
          img = new Image();
          img.src = URL.createObjectURL(file);
        }

        entry.uploadQueue.push({
          _id: uuid(),
          file: file,
          name: file.name,
          img: img
        });

        var $uploads = view.$id('uploads');

        $uploads[0].firstElementChild.classList.add('hidden');

        view.renderUpload(_.last(entry.uploadQueue), false).appendTo($uploads);
      });

      if (!entry.uploading)
      {
        view.uploadNext();
      }

      return false;
    },

    uploadNext: function()
    {
      var view = this;
      var entry = view.model;
      var upload = entry.uploadQueue.shift();

      if (!upload)
      {
        view.$id('submit').prop('disabled', false);

        return;
      }

      view.$id('submit').prop('disabled', true);

      var $uploads = view.$id('uploads');
      var formData = new FormData();

      formData.append('file', upload.file);

      entry.uploading = view.ajax({
        type: 'POST',
        url: '/fap/entries;upload',
        data: formData,
        processData: false,
        contentType: false
      });

      entry.uploading.upload = upload;

      entry.uploading.fail(function()
      {
        view.removeUpload(upload._id);

        if (entry.uploading.statusText === 'abort')
        {
          return;
        }

        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: view.t('upload:failure', {file: upload.file.name})
        });
      });

      entry.uploading.done(function(hash)
      {
        var $upload = $uploads.find('[data-upload-id="' + upload._id + '"]');

        $upload.find('.fa-spinner').removeClass('fa-spinner fa-spin').addClass('fa-times');

        upload.hash = hash;

        entry.uploadedFiles.push(upload);
      });

      entry.uploading.always(function()
      {
        entry.uploading = null;

        view.uploadNext();
      });
    },

    removeUpload: function(uploadId)
    {
      var $uploads = this.$id('uploads');

      $uploads.find('[data-upload-id="' + uploadId + '"]').remove();
      this.$('.popover[data-upload-id="' + uploadId + '"]').remove();

      if ($uploads[0].childElementCount === 1)
      {
        $uploads[0].firstElementChild.classList.remove('hidden');
      }
    },

    saveInputFocus: function(el)
    {
      if (!el)
      {
        return;
      }

      var $select2 = this.$(el).closest('.select2-container');

      if ($select2.length)
      {
        el = $select2.next()[0];
      }

      this.model.focusedInput = {
        name: el.name,
        selectionStart: el.selectionStart,
        selectionEnd: el.selectionEnd
      };
    },

    focusInput: function()
    {
      var view = this;

      if (!view.model.focusedInput)
      {
        var $el = view.$id('owner');

        if (!$el.length)
        {
          $el = view.$id('orderNo');
        }

        $el.focus();

        return;
      }

      var focusedEl = view.$id(view.model.focusedInput.name)[0];

      if (!focusedEl)
      {
        view.$id('orderNo').focus();

        return;
      }

      if (focusedEl.tagName === 'TEXTAREA')
      {
        var body = focusedEl.value;

        focusedEl.value = body.substring(0, view.model.focusedInput.selectionEnd);
        focusedEl.scrollTop = focusedEl.scrollHeight;
        focusedEl.value = body;
      }

      if (focusedEl.setSelectionRange)
      {
        focusedEl.setSelectionRange(
          view.model.focusedInput.selectionStart,
          view.model.focusedInput.selectionEnd
        );
      }

      var $focusedEl = this.$(focusedEl);

      if ($focusedEl.prev().hasClass('select2-container'))
      {
        $focusedEl.select2('focus');
      }
      else
      {
        focusedEl.focus();
      }
    },

    resolveSubdivisions: function()
    {
      var view = this;
      var orderNo = view.$id('orderNo').val();
      var category = dictionaries.categories.get(view.$id('category').val());

      if (view.resolveSubdivisionsReq)
      {
        view.resolveSubdivisionsReq.abort();
        view.resolveSubdivisionsReq = null;
      }

      if (!category)
      {
        return;
      }

      var req = view.resolveSubdivisionsReq = this.ajax({
        method: 'POST',
        url: '/fap/entries;resolve-participants',
        data: JSON.stringify({
          orderNo: orderNo,
          category: category
        })
      });

      req.done(function(res)
      {
        if (res.subdivisions)
        {
          view.$id('subdivisions').select2('val', res.subdivisions);
        }
      });

      req.always(function()
      {
        if (req === view.resolveSubdivisionsReq)
        {
          view.resolveSubdivisionsReq = null;
        }
      });
    },

    updateNotifications: function()
    {
      var category = dictionaries.categories.get(this.$id('category').val());
      var notifications = category && category.get('notifications') || [];

      if (!notifications.length)
      {
        this.$id('notifications').addClass('hidden');

        return;
      }

      this.$id('notifications').removeClass('hidden').popover({
        placement: 'bottom',
        trigger: 'hover',
        html: true,
        content: this.renderPartial(notificationsPopoverTemplate, {
          notifications: category.serialize().notifications
        }),
        template: function(template)
        {
          return $(template).addClass('fap-addForm-notifications-popover');
        }
      });
    },

    validateOrder: function()
    {
      var view = this;
      var $orderNo = view.$id('orderNo');
      var orderNo = $orderNo.val();

      if (!/^[0-9]{9}$/.test(orderNo) || orderNo === '000000000')
      {
        return;
      }

      if (view.model.validatedOrder === orderNo)
      {
        return;
      }

      view.model.validatedOrder = orderNo;

      var req = view.ajax({
        method: 'POST',
        url: '/fap/entries;validate-order?order=' + orderNo
      });

      req.fail(function()
      {
        if (req.status === 404)
        {
          $orderNo[0].setCustomValidity(view.t('addForm:orderNo:notFound'));
        }
      });

      req.done(function(res)
      {
        if (res.lines.length)
        {
          view.$id('lines').select2('val', res.lines).trigger('change');
          view.resolveSubdivisions();
        }
      });
    },

    findUpload: function(uploadId)
    {
      var entry = this.model;

      if (entry.uploading && entry.uploading.upload._id === uploadId)
      {
        return entry.uploading.upload;
      }

      for (var i = 0; i < entry.uploadedFiles.length; ++i)
      {
        if (entry.uploadedFiles[i]._id === uploadId)
        {
          return entry.uploadedFiles[i];
        }
      }

      for (var j = 0; j < entry.uploadQueue.length; ++j)
      {
        if (entry.uploadQueue[j]._id === uploadId)
        {
          return entry.uploadQueue[j];
        }
      }

      return null;
    },

    showUploadNameEditor: function(uploadId)
    {
      var view = this;
      var $upload = view.$id('uploads').find('[data-upload-id="' + uploadId + '"]');
      var upload = view.findUpload(uploadId);
      var $input = $('<input type="text" class="form-control fap-addForm-upload-input">').val(upload.name);

      view.$el.addClass('fap-addForm-editing');

      $input.on('blur', function()
      {
        save();
        hide();
      });

      $input.on('keydown', function(e)
      {
        if (e.key === 'Escape')
        {
          hide();

          return false;
        }

        if (e.key === 'Enter')
        {
          e.target.blur();

          return false;
        }
      });

      $input.appendTo($upload).focus();

      function hide()
      {
        $input.remove();
        view.$el.removeClass('fap-addForm-editing');
      }

      function save()
      {
        var name = $input.val().trim();

        if (!name.length)
        {
          return;
        }

        if (!/\.[a-zA-Z0-9]{1,}$/.test(name))
        {
          name += '.' + upload.name.split('.').pop();
        }

        upload.name = name;

        $upload.find('.fap-addForm-upload-name').text(name);
      }
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      if (Array.isArray(formData.lines))
      {
        formData.lines = formData.lines.join(',');
      }

      if (Array.isArray(formData.subdivisions))
      {
        formData.subdivisions = formData.subdivisions.join(',');
      }

      return formData;
    },

    serializeForm: function(formData)
    {
      var owner = this.$id('owner').select2('data');

      if (owner)
      {
        formData.owner = {
          id: owner.id,
          label: owner.text
        };
      }

      formData.lines = (formData.lines || '').split(',').filter(function(v) { return !!v.length; });
      formData.subdivisions = (formData.subdivisions || '').split(',').filter(function(v) { return !!v.length; });
      formData.divisions = [];

      formData.lines.forEach(function(line)
      {
        var division = orgUnits.getAllForProdLine(line).division;

        if (division && formData.divisions.indexOf(division) === -1)
        {
          formData.divisions.push(division);
        }
      });

      formData.files = this.model.uploadedFiles.map(function(upload)
      {
        return {
          _id: upload.hash,
          name: upload.name
        };
      });

      return formData;
    },

    getFailureText: function()
    {
      return this.t('core', 'FORM:ERROR:addFailure');
    },

    copyLastEntry: function()
    {
      var view = this;
      var $copy = view.$id('copy');
      var $icon = $copy.find('.fa');

      if ($icon.hasClass('fa-spin'))
      {
        return;
      }

      $icon.removeClass('fa-copy').addClass('fa-spinner fa-spin');

      var req = view.ajax({
        url: '/fap/entries?limit(1)&sort(-createdAt)&select(category,problem)'
          + '&observers.user.id=' + user.data._id
          + '&creator.id=' + user.data._id
      });

      req.done(function(res)
      {
        if (!res.totalCount)
        {
          return viewport.msg.show({
            type: 'warning',
            time: 2500,
            text: view.t('addForm:copy:notFound')
          });
        }

        view.$id('category').select2('val', res.collection[0].category).trigger('change');
        view.$id('problem').val(res.collection[0].problem).focus();
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: view.t('addForm:copy:failure')
        });
      });

      req.done(function()
      {
        $icon.removeClass('fa-spinner fa-spin').addClass('fa-copy');
      });
    }

  });
});
