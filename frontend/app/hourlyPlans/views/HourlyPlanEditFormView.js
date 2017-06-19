// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/util/onModelDeleted',
  'app/hourlyPlans/templates/entry'
], function(
  _,
  $,
  user,
  viewport,
  View,
  onModelDeleted,
  entryTemplate
) {
  'use strict';

  return View.extend({

    template: entryTemplate,

    events: {
      'change .hourlyPlan-count': 'updateCount',
      'keyup .hourlyPlan-count': 'updateCount',
      'change .hourlyPlan-noPlan': 'updatePlan',
      'mouseenter .hourlyPlan-flow': function(e)
      {
        this.hovered = e.currentTarget;
      },
      'mouseleave .hourlyPlan-flow': function()
      {
        this.hovered = null;
      },
      'click .hourlyPlan-noPlan-container': function(e)
      {
        if (e.target.classList.contains('hourlyPlan-noPlan-container'))
        {
          this.$(e.target).find('.hourlyPlan-noPlan').click();
        }
      },
      'focus .hourlyPlan-count, .hourlyPlan-noPlan': function(e)
      {
        this.focused = [
          e.target.parentNode,
          e.target.parentNode.parentNode.children[0],
          this.el.querySelector('.hourlyPlan-column-' + e.target.parentNode.dataset.column)
        ];

        this.$(this.focused).addClass('is-focused');
      },
      'blur .hourlyPlan-count, .hourlyPlan-noPlan': function()
      {
        this.$(this.focused).removeClass('is-focused');
      },
      'paste .hourlyPlan-count': 'pasteCounts'
    },

    remoteTopics: function()
    {
      var topics = {};

      topics['hourlyPlans.updated.' + this.model.id] = 'onRemoteEdit';
      topics['hourlyPlans.deleted'] = 'onModelDeleted';

      return topics;
    },

    initialize: function()
    {
      this.hovered = null;
      this.focused = [];

      $('body').on('paste.' + this.idPrefix, this.onBodyPaste.bind(this));
    },

    destroy: function()
    {
      $('body').off('.' + this.idPrefix);

      this.focused = null;
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change', this.render);

      this.focusFirstEnabledInput();
    },

    serialize: function()
    {
      return _.extend(this.model.serialize(), {
        editable: true
      });
    },

    focusNextInput: function($current)
    {
      var $nextCell = $current.closest('td').next('td');

      if ($nextCell.length)
      {
        return $nextCell.find('input').select();
      }

      var $nextRow = $current.closest('tr').next();

      if (!$nextRow.length)
      {
        return this.focusFirstEnabledInput();
      }

      this.focusNextEnabledInput($nextRow);
    },

    focusFirstEnabledInput: function()
    {
      var noPlanEl = this.el.querySelector('.hourlyPlan-noPlan:not(:checked)');

      if (noPlanEl)
      {
        this.$(noPlanEl).closest('tr').find('.hourlyPlan-count').first().select();
      }
    },

    focusNextEnabledInput: function($nextRow)
    {
      if (!$nextRow.length)
      {
        return this.focusFirstEnabledInput();
      }

      if ($nextRow.find('.hourlyPlan-noPlan:checked').length)
      {
        return this.focusNextEnabledInput($nextRow.next());
      }

      $nextRow.find('.hourlyPlan-count').first().select();
    },

    toggleCountsInRow: function($noPlan, remote)
    {
      var $focusedRow = this.$(this.el.ownerDocument.activeElement).closest('tr');
      var $lastRow = this.$('.hourlyPlan > tbody > :last-child');
      var $noPlanRow = $noPlan.closest('tr');

      var $counts = $noPlanRow.find('.hourlyPlan-count').attr('disabled', $noPlan[0].checked);

      if (!$noPlan[0].checked)
      {
        if (!remote)
        {
          $noPlanRow.find('.hourlyPlan-count').first().select();
        }

        return;
      }

      $counts.val('0').attr('data-value', '0');

      if (!remote)
      {
        return $noPlanRow[0] === $lastRow[0]
          ? this.focusFirstEnabledInput()
          : this.focusNextEnabledInput($noPlanRow);
      }

      if ($noPlanRow[0] === $focusedRow[0])
      {
        return $noPlanRow[0] === $lastRow[0]
          ? this.focusFirstEnabledInput()
          : this.focusNextEnabledInput($noPlanRow);
      }
    },

    updatePlan: function(e)
    {
      var data = {
        type: 'plan',
        socketId: this.socket.getId(),
        _id: this.model.id,
        flowIndex: parseInt(e.target.getAttribute('data-flow'), 10),
        newValue: e.target.checked
      };
      var $noPlan = this.$(e.target);
      var view = this;

      this.toggleCountsInRow($noPlan);

      this.socket.emit('hourlyPlans.updatePlan', data, function(err)
      {
        if (err)
        {
          e.target.checked = !e.target.checked;

          view.toggleCountsInRow($noPlan);
          view.trigger('remoteError', err);
        }
      });
    },

    pasteCounts: function(e, targetEl)
    {
      var pastedValue = e.originalEvent.clipboardData.getData('text/plain') || '';
      var rawValues = (' ' + pastedValue + ' ').match(/-?([0-9]+)[^0-9]/g) || [];
      var newValues = rawValues.map(function(v) { return Math.max(parseInt(v, 10) || 0, 0); });

      if (newValues.length < 3)
      {
        return;
      }

      var view = this;
      var $target = view.$(targetEl || e.currentTarget);
      var data = {
        type: 'counts',
        socketId: view.socket.getId(),
        _id: view.model.id,
        newValues: newValues,
        flowIndex: parseInt($target.attr('data-flow'), 10)
      };

      if ($target[0].name === 'hour')
      {
        data.hourIndex = parseInt($target.attr('data-hour'), 10);
      }

      viewport.msg.saving();

      view.socket.emit('hourlyPlans.updateCounts', data, function(err)
      {
        if (err)
        {
          viewport.msg.savingFailed();

          view.trigger('remoteError', err);
        }
      });

      return false;
    },

    updateCount: function(e)
    {
      if (e.which === 13)
      {
        return this.focusNextInput(this.$(e.target));
      }

      var oldCount = parseInt(e.target.getAttribute('data-value'), 10) || 0;
      var newCount = parseInt(e.target.value, 10) || 0;

      if (oldCount === newCount)
      {
        return;
      }

      var timerKey = e.target.getAttribute('data-flow')
        + ':' + e.target.getAttribute('data-hour')
        + ':' + e.target.getAttribute('name');

      if (this.timers[timerKey])
      {
        clearTimeout(this.timers[timerKey]);
      }

      this.timers[timerKey] = setTimeout(
        this.doUpdateCount.bind(this), 250, e.target, timerKey, oldCount, newCount
      );
    },

    doUpdateCount: function(countEl, timerKey, oldCount, newCount)
    {
      delete this.timers[timerKey];

      var oldRemote = countEl.getAttribute('data-remote');
      var data = {
        type: 'count',
        socketId: this.socket.getId(),
        _id: this.model.id,
        newValue: newCount,
        flowIndex: parseInt(countEl.getAttribute('data-flow'), 10)
      };

      if (countEl.name === 'hour')
      {
        data.hourIndex = parseInt(countEl.getAttribute('data-hour'), 10);
      }

      countEl.setAttribute('data-value', data.newValue);
      countEl.setAttribute('data-remote', 'false');

      var view = this;

      this.socket.emit('hourlyPlans.updateCount', data, function(err)
      {
        if (err)
        {
          if (countEl.getAttribute('data-remote') !== 'true')
          {
            countEl.value = oldCount;
            countEl.setAttribute('data-value', oldCount);
            countEl.setAttribute('data-remote', oldRemote);
          }

          view.trigger('remoteError', err);
        }
      });
    },

    onRemoteEdit: function(message)
    {
      /*jshint -W015*/

      switch (message.type)
      {
        case 'plan':
          return this.handlePlanChange(message);

        case 'count':
          return this.handleCountChange(message);

        case 'counts':
          return this.handleCountsChange(message);
      }
    },

    handlePlanChange: function(message)
    {
      if (message.socketId === this.socket.getId())
      {
        return;
      }

      var selector = '.hourlyPlan-noPlan[data-flow="' + message.flowIndex + '"]';

      var $noPlan = this.$(selector);

      if (!$noPlan.length)
      {
        return;
      }

      $noPlan.prop('checked', message.newValue);

      this.toggleCountsInRow($noPlan, true);
    },

    handleCountChange: function(message)
    {
      if (message.socketId === this.socket.getId())
      {
        return;
      }

      var selector = '.hourlyPlan-count[data-flow=' + message.flowIndex + ']';

      if (typeof message.hourIndex === 'number')
      {
        selector += '[data-hour=' + message.hourIndex + ']';
      }
      else
      {
        selector += '[name=level]';
      }

      var $count = this.$(selector);

      if (!$count.length)
      {
        return;
      }

      $count.val(message.newValue);
      $count.attr({
        'data-value': message.newValue,
        'data-remote': 'true'
      });
    },

    handleCountsChange: function(message)
    {
      var selector = '.hourlyPlan-count[data-flow=' + message.flowIndex + ']';
      var $counts = this.$(selector);

      if (!$counts.length)
      {
        return;
      }

      message.newValues.forEach(function(newValue, i)
      {
        $counts[i + 1].value = newValue;
      });

      if (message.socketId === this.socket.getId())
      {
        viewport.msg.saved();
      }
    },

    onBodyPaste: function(e)
    {
      if (!this.hovered)
      {
        return;
      }

      return this.pasteCounts(e, this.hovered);
    },

    onModelDeleted: function(message)
    {
      onModelDeleted(this.broker, this.model, message);
    }

  });
});
