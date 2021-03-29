// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/data/aors',
  'app/core/View',
  'app/core/util/transliterate',
  'app/prodDowntimes/util/reasonAndAor',
  'app/production/templates/downtimePicker'
], function(
  _,
  $,
  t,
  time,
  viewport,
  aors,
  View,
  transliterate,
  reasonAndAor,
  downtimePickerTemplate
) {
  'use strict';

  return View.extend({

    template: downtimePickerTemplate,

    dialogClassName: 'production-modal',

    nlsDomain: 'production',

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

        if (this.options.embedded)
        {
          this.handleEmbeddedPick(submitEl);
        }
        else
        {
          this.handlePick(submitEl);
        }
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
      },
      'focus [data-vkb]': function(e)
      {
        if (this.options.embedded && this.options.vkb)
        {
          this.options.vkb.show(e.target, this.onVkbValueChange);
        }
      },
      'click #-clearReason': function()
      {
        this.selectEmbeddedReason(null);
      },
      'click #-clearAor': function()
      {
        this.selectEmbeddedAor(null);
      },
      'click #-selectedReason': function()
      {
        if (this.options.vkb)
        {
          this.options.vkb.hide();
        }

        this.$id('startedAtGroup').addClass('hidden');
        this.$id('aorGroup').addClass('hidden');
        this.$id('commentGroup').addClass('hidden');
        this.$id('submit').prop('disabled', true);

        var $reasonFilter = this.$id('reasonFilter');
        var $reasonGroup = this.$id('reasonGroup').css('margin-top', '15px');
        var $list = $reasonGroup.find('.btn-group-vertical');
        var selectedReason = this.model.reason;
        var html = '';

        reasonAndAor
          .getReasonsForAor(this, this.model.aor)
          .sort(function(a, b) { return a.reason.getLabel().localeCompare(b.reason.getLabel()); })
          .forEach(function(d)
          {
            var className = 'btn btn-lg btn-default ' + (d.reason.id === selectedReason ? 'active' : '');
            var filter = transliterate(d.reason.id + d.reason.getLabel()).toUpperCase().replace(/[^A-Z0-9]+/g, '');

            html += '<button type="button" class="' + className + '" data-reason="' + d.reason.id + '" '
              + 'data-filter="' + filter + '">'
              + '<strong>' + d.reason.id + '</strong>'
              + _.escape(d.reason.getLabel())
              + '</button>';
          });

        $reasonGroup.find('.production-downtimePicker-btn-group').addClass('hidden');
        $reasonGroup.find('label').addClass('hidden');
        $reasonFilter.removeClass('hidden');
        $list.html(html).removeClass('hidden');
        $reasonFilter.focus();

        var activeEl = $list.find('.active')[0];

        if (activeEl)
        {
          activeEl.scrollIntoView();
        }

        this.selectingOption = true;
      },
      'click #-selectedAor': function()
      {
        if (this.options.vkb)
        {
          this.options.vkb.hide();
        }

        this.$id('startedAtGroup').addClass('hidden');
        this.$id('reasonGroup').addClass('hidden');
        this.$id('commentGroup').addClass('hidden');
        this.$id('submit').prop('disabled', true);

        var $aorFilter = this.$id('aorFilter');
        var $aorGroup = this.$id('aorGroup').css('margin-top', '15px');
        var $list = $aorGroup.find('.btn-group-vertical');
        var selectedAor = this.model.aor;
        var html = '';

        reasonAndAor
          .getAorsForReason(this, this.model.reason)
          .sort(function(a, b) { return a.aor.getLabel().localeCompare(b.aor.getLabel()); })
          .forEach(function(d)
          {
            var className = 'btn btn-lg btn-default ' + (d.aor.id === selectedAor ? 'active' : '');
            var filter = transliterate(d.aor.getLabel()).toUpperCase().replace(/[^A-Z0-9]+/g, '');

            html += '<button type="button" class="' + className + '" data-aor="' + d.aor.id + '" '
              + 'data-filter="' + filter + '">'
              + _.escape(d.aor.getLabel())
              + '</button>';
          });

        $aorGroup.find('.production-downtimePicker-btn-group').addClass('hidden');
        $aorGroup.find('label').addClass('hidden');
        $aorFilter.removeClass('hidden');
        $list.html(html).removeClass('hidden');
        $aorFilter.focus();

        var activeEl = $list.find('.active')[0];

        if (activeEl)
        {
          activeEl.scrollIntoView();
        }

        this.selectingOption = true;
      },
      'click .btn[data-reason]': function(e)
      {
        this.selectEmbeddedReason(e.currentTarget.dataset.reason);

        if (this.model.aor || !this.model.reason)
        {
          return;
        }

        var aorsForReason = reasonAndAor.getAorsForReason(this, this.model.reason);

        if (aorsForReason.length === 1)
        {
          this.selectEmbeddedAor(aorsForReason[0].id);
        }
      },
      'click .btn[data-aor]': function(e)
      {
        this.selectEmbeddedAor(e.currentTarget.dataset.aor);
      },
      'input #-reasonFilter': 'filterReasons',
      'input #-aorFilter': 'filterAors',
      'keyup #-reasonFilter, #-aorFilter': function(e)
      {
        if (e.keyCode !== 13)
        {
          return;
        }

        var $options = this.$(e.target).next().find('.btn:not(.hidden)');

        if ($options.length === 1)
        {
          $options.first().click();
        }
      }
    },

    initialize: function()
    {
      this.onVkbValueChange = this.onVkbValueChange.bind(this);
      this.selectingOption = false;

      reasonAndAor.initialize(this);

      $(window).on('keyup.' + this.idPrefix, this.onKeyUp.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      reasonAndAor.destroy(this);

      if (this.options.vkb)
      {
        this.options.vkb.hide();
      }
    },

    getTemplateData: function()
    {
      return {
        startedAt: this.model.startedAt,
        mode: this.model.mode,
        embedded: this.options.embedded
      };
    },

    afterRender: function()
    {
      var customReasons = this.model.prodShift.getDowntimeReasons().sort(function(a, b)
      {
        return a.id.localeCompare(b.id);
      });

      reasonAndAor.setUpReasons(this, customReasons, this.model.prodShift.get('subdivision'));
      reasonAndAor.setUpAors(this);

      if (this.model.reasonComment)
      {
        this.$id('reasonComment').val(this.model.reasonComment);
      }

      if (this.options.embedded)
      {
        return this.setUpEmbeddedFields();
      }

      if (this.model.reason)
      {
        this.$id('reason').val(this.model.reason);
      }

      if (this.model.aor)
      {
        this.$id('aor').val(this.model.aor);
      }

      this.setUpReasonSelect2();
      this.setUpAorSelect2();
      this.focusControl();
    },

    setUpEmbeddedFields: function()
    {
      this.selectEmbeddedReason(this.model.reason);
      this.selectEmbeddedAor(this.model.aor);
    },

    selectEmbeddedReason: function(reason)
    {
      reason = reasonAndAor.reasons.get(reason);

      var label = '<span>'
        + (reason ? reason.getLabel() : t('production', 'downtimePicker:reason:placeholder'))
        + '</span>';

      this.$id('selectedReason')
        .html(label)
        .val(reason ? reason.id : '');

      this.$id('reasonFilter').val('').addClass('hidden');

      var $reasonGroup = this.$id('reasonGroup');

      $reasonGroup.find('.btn-group-vertical').addClass('hidden');
      $reasonGroup.find('label').removeClass('hidden');
      $reasonGroup.find('.production-downtimePicker-btn-group').removeClass('hidden');

      this.$id('startedAtGroup').removeClass('hidden');
      this.$id('aorGroup').removeClass('hidden');
      this.$id('commentGroup').removeClass('hidden');
      this.$id('submit').prop('disabled', false);

      this.model.reason = reason ? reason.id : null;
      this.selectingOption = false;
    },

    selectEmbeddedAor: function(aor)
    {
      aor = reasonAndAor.aors.get(aor);

      var label = '<span>'
        + (aor ? aor.getLabel() : t('production', 'downtimePicker:aor:placeholder'))
        + '</span>';

      this.$id('selectedAor')
        .html(label)
        .val(aor ? aor.id : '');

      this.$id('aorFilter').val('').addClass('hidden');

      var $aorGroup = this.$id('aorGroup');

      $aorGroup.find('.btn-group-vertical').addClass('hidden');
      $aorGroup.find('label').removeClass('hidden');
      $aorGroup.find('.production-downtimePicker-btn-group').removeClass('hidden');

      this.$id('startedAtGroup').removeClass('hidden');
      this.$id('reasonGroup').removeClass('hidden');
      this.$id('commentGroup').removeClass('hidden');
      this.$id('submit').prop('disabled', false);

      this.model.aor = aor ? aor.id : null;
      this.selectingOption = false;
    },

    onVkbValueChange: function(fieldEl)
    {
      if (/reasonFilter/.test(fieldEl.id))
      {
        this.filterReasons();
      }
      else if (/aorFilter/.test(fieldEl.id))
      {
        this.filterAors();
      }
    },

    onDialogShown: function()
    {
      this.focusControl();
    },

    onKeyUp: function(e)
    {
      if (!this.selectingOption || (document.activeElement && document.activeElement.dataset.vkb))
      {
        return;
      }

      var $vkb = $('.production-vkb');

      if (!$vkb.length || $vkb.hasClass('hidden'))
      {
        return;
      }

      $vkb.find('.btn[data-key="' + e.originalEvent.key.toUpperCase() + '"]').click();
    },

    filterReasons: function()
    {
      var $options = this.$id('reasonGroup').find('.btn-group-vertical').find('.btn');
      var filter = transliterate(this.$id('reasonFilter').val()).toUpperCase().replace(/[^A-Z0-9]+/g, '');

      if (reasonAndAor.reasons.get(filter))
      {
        $options.addClass('hidden').filter('.btn[data-reason="' + filter + '"]').removeClass('hidden');
      }
      else if (filter.length)
      {
        $options.addClass('hidden').filter('.btn[data-filter*="' + filter + '"]').removeClass('hidden');
      }
      else
      {
        $options.removeClass('hidden');
      }
    },

    filterAors: function()
    {
      var $options = this.$id('aorGroup').find('.btn-group-vertical').find('.btn');
      var filter = transliterate(this.$id('aorFilter').val()).toUpperCase().replace(/[^A-Z0-9]+/g, '');

      if (filter.length)
      {
        $options.addClass('hidden').filter('.btn[data-filter*="' + filter + '"]').removeClass('hidden');
      }
      else
      {
        $options.removeClass('hidden');
      }
    },

    focusControl: function()
    {
      if (this.options.embedded)
      {
        return;
      }

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

    handleEmbeddedPick: function(submitEl)
    {
      var reason = this.$id('selectedReason').val();
      var aor = this.$id('selectedAor').val();
      var comment = this.$id('reasonComment').val();

      if (!reason)
      {
        this.$id('selectedReason').focus();

        submitEl.disabled = false;

        return viewport.msg.show({
          type: 'error',
          time: 2000,
          text: t('production', 'downtimePicker:msg:emptyReason')
        });
      }

      if (!aor)
      {
        this.$id('selectedAor').focus();

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
