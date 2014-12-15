// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/data/aors',
  'app/data/downtimeReasons',
  'app/core/View',
  'app/production/templates/downtimePicker'
], function(
  t,
  time,
  viewport,
  aors,
  downtimeReasons,
  View,
  downtimePickerTemplate
) {
  'use strict';

  return View.extend({

    template: downtimePickerTemplate,

    dialogClassName: 'production-modal',

    events: {
      'keypress .select2-container': function(e)
      {
        if (e.which === 13)
        {
          e.preventDefault();

          this.$el.submit();
        }
      },
      'keypress textarea': function(e)
      {
        if (e.which === 13 && e.target.value.trim() === '')
        {
          e.preventDefault();

          this.$el.submit();
        }
      },
      'submit': function(e)
      {
        e.preventDefault();

        var submitEl = this.$('.btn[type="submit"]')[0];

        if (submitEl.disabled)
        {
          return;
        }

        submitEl.disabled = true;

        this.handlePick(submitEl);
      },
      'click .production-downtimePicker-now': function()
      {
        var startedAt = Date.now();

        this.$id('startedAt')
          .val(time.format(startedAt, 'YYYY-MM-DD, HH:mm:ss'))
          .attr('data-time', startedAt);
      }
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        startedAt: this.model.startedAt,
        mode: this.model.mode
      };
    },

    afterRender: function()
    {
      if (this.model.reason)
      {
        this.$id('reason').val(this.model.reason);
      }

      if (this.model.aor)
      {
        this.$id('aor').val(this.model.aor);
      }

      if (this.model.reasonComment)
      {
        this.$id('reasonComment').val(this.model.reasonComment);
      }

      this.setUpReasonSelect2();
      this.setUpAorSelect2();
      this.focusControl();
    },

    onDialogShown: function()
    {
      this.focusControl();
    },

    focusControl: function()
    {
      if (!this.model.reason)
      {
        this.$id('reason').select2('focus');
      }
      else if (!this.model.aor)
      {
        this.$id('aor').select2('focus');
      }
      else if (this.model.mode === 'edit')
      {
        this.$id('reasonComment').focus();
      }
      else
      {
        this.$('.btn-danger').focus();
      }
    },

    setUpReasonSelect2: function()
    {
      var view = this;
      var $reason = this.$id('reason');

      $reason.select2({
        dropdownCssClass: 'production-dropdown',
        openOnEnter: null,
        data: this.model.prodShift.getDowntimeReasons()
          .map(function(downtimeReason)
          {
            return {
              id: downtimeReason.id,
              text: downtimeReason.id + ' - ' + downtimeReason.get('label')
            };
          })
          .sort(function(a, b)
          {
            return a.id.localeCompare(b.id);
          })
      });

      $reason.on('change', function()
      {
        if ($reason.select2('val'))
        {
          view.$id('aor').select2('focus');
        }
      });
    },

    setUpAorSelect2: function()
    {
      var view = this;
      var $aor = this.$id('aor');

      $aor.select2({
        dropdownCssClass: 'production-dropdown',
        openOnEnter: null,
        data: aors.map(function(aor)
        {
          return {
            id: aor.id,
            text: aor.get('name')
          };
        })
      });

      $aor.on('change', function()
      {
        if ($aor.select2('val'))
        {
          view.$id('reasonComment').select();
        }
      });
    },

    handlePick: function(submitEl)
    {
      var reason = this.$id('reason').select2('val');
      var aor = this.$id('aor').select2('val');
      var comment = this.$id('reasonComment').val();

      if (!reason)
      {
        this.$id('reason').select2('focus');

        submitEl.disabled = false;

        return viewport.msg.show({
          type: 'error',
          time: 2000,
          text: t('production', 'downtimePicker:msg:emptyReason')
        });
      }

      if (!aor)
      {
        this.$id('aor').select2('focus');

        submitEl.disabled = false;

        return viewport.msg.show({
          type: 'error',
          time: 2000,
          text: t('production', 'downtimePicker:msg:emptyAor')
        });
      }

      this.trigger('downtimePicked', {
        reason: reason,
        reasonComment: comment,
        aor: aor,
        startedAt: new Date(parseInt(this.$id('startedAt').attr('data-time'), 10))
      });
    }

  });
});
