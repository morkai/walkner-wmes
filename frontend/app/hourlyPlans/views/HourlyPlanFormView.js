define([
  'underscore',
  'jquery',
  'moment',
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/hourlyPlans/templates/entry',
  'i18n!app/nls/hourlyPlans'
], function(
  _,
  $,
  moment,
  t,
  user,
  View,
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

    initialize: function()
    {
      var view = this;

      this.listenToOnce(this.model, 'sync', function()
      {
        var redirectToDetails = view.redirectToDetails.bind(view);

        view.pubsub.subscribe('hourlyPlans.updated.' + view.model.id, view.onRemoteEdit.bind(view));
        view.pubsub.subscribe('hourlyPlans.locked.' + view.model.id, redirectToDetails);
        view.pubsub.subscribe('shiftChanged', redirectToDetails);
      });
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change', this.render);

      this.$('.hourlyPlan-count').first().focus();

      if (this.model.get('locked'))
      {
        this.broker.publish('router.navigate', {
          url: this.model.genClientUrl(),
          replace: true,
          trigger: true
        });
      }
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
        return $nextCell.find('input').focus();
      }

      var $nextRow = $current.closest('tr').next();

      if ($nextRow.length)
      {
        return $nextRow.find('.hourlyPlan-count').first().focus();
      }

      this.el.querySelector('.hourlyPlan-count').select();
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

      this.socket.emit('hourlyPlans.updatePlan', data, function(err)
      {
        if (err)
        {
          console.error(err);

          e.target.checked = !e.target.checked;
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

      this.socket.emit('hourlyPlans.updateCount', data, function(err)
      {
        if (err)
        {
          console.error(err);

          if (countEl.getAttribute('data-remote') !== 'true')
          {
            countEl.value = oldCount;
            countEl.setAttribute('data-value', oldCount);
            countEl.setAttribute('data-remote', oldRemote);
          }
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

    redirectToDetails: function()
    {
      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl(),
        trigger: true
      });
    }

  });
});
