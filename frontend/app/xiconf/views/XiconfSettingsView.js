// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/settings/views/SettingsView',
  'app/xiconf/templates/settings'
], function(
  _,
  $,
  t,
  viewport,
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#xiconf;settings',

    template: template,

    initialize: function()
    {
      SettingsView.prototype.initialize.apply(this, arguments);

      var handleDragEvent = this.handleDragEvent.bind(this);

      $(document).on('dragenter.' + this.idPrefix, handleDragEvent);
      $(document).on('dragleave.' + this.idPrefix, handleDragEvent);
      $(document).on('dragover.' + this.idPrefix, handleDragEvent);
      $(document).on('drop.' + this.idPrefix, this.onDrop.bind(this));
    },

    destroy: function()
    {
      SettingsView.prototype.destroy.apply(this, arguments);

      $(document).off('.' + this.idPrefix);
    },

    handleDragEvent: function(e)
    {
      e.preventDefault();
      e.stopPropagation();
    },

    onDrop: function(e)
    {
      e = e.originalEvent;

      e.preventDefault();
      e.stopPropagation();

      if (!e.dataTransfer.files.length)
      {
        return viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: t('xiconf', 'MSG:drop:filesOnly')
        });
      }

      var file = _.find(e.dataTransfer.files, function(file)
      {
        return file.type === 'application/x-zip-compressed'
          && /^[0-9]+\.[0-9x]+\.[0-9x]+\-[0-9]+\.[0-9x]+\.[0-9x]+\.zip$/.test(file.name);
      });

      if (!file)
      {
        return viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: t('xiconf', 'MSG:drop:invalidFile')
        });
      }

      var formData = new FormData();

      formData.append('update', file);

      var req = this.ajax({
        type: 'POST',
        url: '/xiconf;upload',
        data: formData,
        processData: false,
        contentType: false
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: t('xiconf', 'MSG:drop:upload:failure')
        });
      });

      req.done(function()
      {
        viewport.msg.show({
          type: 'success',
          time: 2500,
          text: t('xiconf', 'MSG:drop:upload:success')
        });
      });
    }

  });
});
