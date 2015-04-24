// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/data/aors',
  'app/core/View',
  'app/prodDowntimes/util/reasonAndAor',
  'app/production/templates/downtimePicker'
], function(
  _,
  t,
  time,
  viewport,
  aors,
  View,
  reasonAndAor,
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
      },
      'select2-removed #-reason, #-aor': function()
      {
        this.$id('reason').val('');
        this.$id('aor').val('');

        this.model.reason = null;
        this.model.aor = null;

        this.timers.clearSelect2 = setTimeout(function(view)
        {
          view.setUpReasonSelect2();
          view.setUpAorSelect2();
          view.$id('reason').select2('focus');
        }, 1, this);
      },
      'change #-reason': function(e)
      {
        this.model.reason = e.target.value;

        this.setUpAorSelect2();
        this.$id('aor').select2('focus');
      },
      'change #-aor': function(e)
      {
        this.model.aor = e.target.value;

        this.setUpReasonSelect2();

        if (this.$id('reason').select2('data') === null)
        {
          this.$id('reason').select2('focus');
        }
        else
        {
          this.$id('reasonComment').focus();
        }
      }
    },

    initialize: function()
    {
      reasonAndAor.initialize(this);
    },

    destroy: function()
    {
      reasonAndAor.destroy(this);
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

      var customReasons = this.model.prodShift.getDowntimeReasons().sort(function(a, b)
      {
        return a.id.localeCompare(b.id);
      });

      reasonAndAor.setUpReasons(this, customReasons, this.model.prodShift.get('subdivision'));
      reasonAndAor.setUpAors(this);
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
      reasonAndAor.setUpReasonSelect2(this, this.model.aor, {
        allowClear: true,
        dropdownCssClass: 'production-dropdown'
      });
    },

    setUpAorSelect2: function()
    {
      reasonAndAor.setUpAorSelect2(this, this.model.reason, {
        allowClear: true,
        dropdownCssClass: 'production-dropdown'
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
