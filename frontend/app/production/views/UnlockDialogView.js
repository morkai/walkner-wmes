// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
          login: this.$id('login').val(),
          password: this.$id('password').val()
        };

        this.socket.emit('production.unlock', req, this.handleUnlockResponse.bind(this));
      }
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        type: 'unlock',
        prodLine: this.model.prodLine.id
      };
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    },

    closeDialog: function() {},

    handleUnlockResponse: function(err, res)
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
            : t('production', 'unlockDialog:error:UNLOCK_FAILURE')
        });

        return this.$id('submit').prop('disabled', false);
      }

      var remoteData = res.prodShift;

      if (remoteData)
      {
        remoteData.prodShiftOrder = res.prodShiftOrder;
        remoteData.prodDowntimes = res.prodDowntimes;
      }

      this.model.setSecretKey(res.secretKey, remoteData);
      this.closeDialog();
    }

  });
});
