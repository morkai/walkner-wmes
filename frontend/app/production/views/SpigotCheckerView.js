// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/production/templates/spigotChecker'
], function(
  $,
  t,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'production-modal production-spigotChecker-modal',

    events: {
      'submit': function()
      {
        var $submit = this.$id('submit').prop('disabled', true);
        var matches = this.$id('nc12').val().match(/([0-9]{12})/);
        var nc12 = (matches ? matches[1] : '').trim();

        if (!nc12.length || !this.model.checkSpigot(this.options.component, nc12))
        {
          this.$id('nc12')[0].setCustomValidity(t('production', 'spigotChecker:nc12:invalid'));

          this.timers.submit = setTimeout(function() { $submit.prop('disabled', false).click(); }, 1);
        }
        else
        {
          viewport.msg.show({
            type: 'success',
            time: 3000,
            text: t('production', t('production', 'spigotChecker:success'))
          });

          this.closeDialog();
        }

        return false;
      }
    },

    initialize: function()
    {
      this.lastKeyPressAt = 0;

      $(window)
        .on('keydown.' + this.idPrefix, this.onKeyDown.bind(this))
        .on('keypress.' + this.idPrefix, this.onKeyPress.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        component: this.options.component
      };
    },

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);

      this.$id('nc12').focus();
    },

    closeDialog: function() {},

    onKeyDown: function(e)
    {
      if (e.keyCode === 8)
      {
        this.lastKeyPressAt = Date.now();

        this.$id('nc12').val('')[0].setCustomValidity('');

        return false;
      }
    },

    onKeyPress: function(e)
    {
      if (e.keyCode === 13)
      {
        this.$id('submit').click();
      }

      if (e.keyCode < 32 || e.keyCode > 126)
      {
        return;
      }

      var keyPressAt = Date.now();
      var prevValue = keyPressAt - this.lastKeyPressAt > 333 ? '' : this.$id('nc12').val();
      var key = String.fromCharCode(e.keyCode);

      this.$id('nc12').val(prevValue + key)[0].setCustomValidity('');

      this.lastKeyPressAt = keyPressAt;

      return false;
    }

  });
});
