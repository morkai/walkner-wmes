// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/production/templates/unlockDialog'
], function(
  t,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'production-modal',

    events: {
      'submit': function(e)
      {
        e.preventDefault();

        var submitEl = this.$id('submit')[0];

        if (submitEl.disabled)
        {
          return;
        }

        submitEl.disabled = true;

        var req = {
          prodLine: this.model.prodLine.id,
          secretKey: this.model.getSecretKey(),
          login: this.$id('login').val(),
          password: this.$id('password').val()
        };

        this.socket.emit('production.lock', req, this.handleLockResponse.bind(this));
      }
    },

    getTemplateData: function()
    {
      return {
        type: 'lock',
        prodLine: this.model.prodLine.id
      };
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    },

    closeDialog: function() {},

    handleLockResponse: function(err)
    {
      if (err)
      {
        this.$id('password').val('');

        if (err.message === 'INVALID_PASSWORD')
        {
          this.$id('password').focus();
        }
        else
        {
          this.$id('login').val('').focus();
        }

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: t.has('production', 'unlockDialog:error:' + err.message)
            ? t('production', 'unlockDialog:error:' + err.message)
            : t('production', 'unlockDialog:error:LOCK_FAILURE')
        });

        return this.$id('submit').prop('disabled', false);
      }

      this.model.setSecretKey(null);
      this.closeDialog();
    }

  });
});
