define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/core/util/onModelDeleted',
  'app/hourlyPlans/templates/entry'
], function(
  _,
  t,
  user,
  View,
  onModelDeleted,
  entryTemplate
) {
  'use strict';

  return View.extend({

    template: entryTemplate,

    idPrefix: 'hourlyPlanForm',

    events: {
      'change .hourlyPlan-count': 'updateCount',
      'keyup .hourlyPlan-count': 'updateCount',
      'change .hourlyPlan-noPlan': 'updatePlan',
      'click .hourlyPlan-noPlan-container': function(e)
      {
        if (e.target.classList.contains('hourlyPlan-noPlan-container'))
        {
          this.$(e.target).find('.hourlyPlan-noPlan').click();
        }
      }
    },

    remoteTopics: function()
    {
      var topics = {};

      topics['hourlyPlans.updated.' + this.model.id] = 'onRemoteEdit';
      topics['hourlyPlans.deleted'] = 'onModelDeleted';

      return topics;
    },

    afterRender: function()
    {
      if (this.model.get('locked'))
      {
        return this.broker.publish('router.navigate', {
          url: this.model.genClientUrl(),
          replace: true,
          trigger: true
        });
      }

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

      if (message.socketId === this.socket.getId())
      {
        return;
      }

      switch (message.type)
      {
        case 'plan':
          return this.handlePlanChange(message);

        case 'count':
          return this.handleCountChange(message);
      }
    },

    handlePlanChange: function(message)
    {
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

    onModelDeleted: function(message)
    {
      onModelDeleted(this.broker, this.model, message);
    }

  });
});
