define([
  'underscore',
  'moment',
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/fte/templates/masterEntry',
  'i18n!app/nls/fte'
], function(
  _,
  moment,
  t,
  user,
  View,
  masterEntryTemplate
) {
  'use strict';

  return View.extend({

    template: masterEntryTemplate,

    idPrefix: 'masterEntryForm',

    events: {
      'change .fte-masterEntry-count': 'updateCount',
      'keyup .fte-masterEntry-count': 'updateCount',
      'change .fte-masterEntry-noPlan': 'updatePlan'
    },

    initialize: function()
    {
      var view = this;

      this.listenToOnce(this.model, 'sync', function()
      {
        var redirectToDetails = view.redirectToDetails.bind(view);

        view.pubsub.subscribe('fte.master.updated.' + view.model.id, view.onRemoteEdit.bind(view));
        view.pubsub.subscribe('fte.master.locked.' + view.model.id, redirectToDetails);
        view.pubsub.subscribe('shiftChanged', redirectToDetails);
      });
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change', this.render);

      this.$('.fte-masterEntry-count').first().focus();

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
      return _.extend(this.model.serializeWithTotals(), {editable: true});
    },

    updatePlan: function(e)
    {
      var data = {
        type: 'plan',
        socketId: this.socket.getId(),
        _id: this.model.id,
        taskIndex: parseInt(e.target.getAttribute('data-task'), 10),
        newValue: e.target.checked
      };

      this.socket.emit('fte.master.updatePlan', data, function(err)
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
      var timerKey = e.target.getAttribute('data-task')
        + ':' + e.target.getAttribute('data-function')
        + ':' + e.target.getAttribute('data-company');

      if (this.timers[timerKey])
      {
        clearTimeout(this.timers[timerKey]);
      }

      this.timers[timerKey] = setTimeout(this.doUpdateCount.bind(this), 250, e.target, timerKey);
    },

    doUpdateCount: function(countEl, timerKey)
    {
      delete this.timers[timerKey];

      var oldRemote = countEl.getAttribute('data-remote');
      var oldCount = parseInt(countEl.getAttribute('data-value'), 10);
      var data = {
        type: 'count',
        socketId: this.socket.getId(),
        _id: this.model.id,
        newCount: parseInt(countEl.value, 10) || 0,
        taskIndex: parseInt(countEl.getAttribute('data-task'), 10),
        functionIndex: parseInt(countEl.getAttribute('data-function'), 10),
        companyIndex: parseInt(countEl.getAttribute('data-company'), 10)
      };

      if (data.newCount === oldCount)
      {
        return;
      }

      countEl.setAttribute('data-value', data.newCount);
      countEl.setAttribute('data-remote', 'false');

      var view = this;

      this.socket.emit('fte.master.updateCount', data, function(err)
      {
        if (err)
        {
          console.error(err);

          if (countEl.getAttribute('data-remote') !== 'true')
          {
            countEl.value = oldCount;
            countEl.setAttribute('data-value', oldCount);
            countEl.setAttribute('data-remote', oldRemote);

            view.recount(countEl, data.taskIndex, data.companyIndex);
          }
        }
      });

      this.recount(countEl, data.taskIndex, data.functionIndex, data.companyIndex);
    },

    recount: function(countEl, taskIndex, functionIndex, companyIndex)
    {
      var countSelector;
      var totalSelector;
      var total;
      var $taskTr = this.$(countEl).closest('tr');
      var functionId = countEl.getAttribute('data-functionId');
      var companyId = countEl.getAttribute('data-companyId');

      total = 0;
      countSelector = '.fte-masterEntry-count[data-companyId="' + companyId + '"]';
      totalSelector = '.fte-masterEntry-total-company-task[data-companyId="' + companyId + '"]';
      $taskTr.find(countSelector).each(function() { total += parseInt(this.value, 10) || 0; });
      $taskTr.find(totalSelector).text(total);

      total = 0;
      countSelector = '.fte-masterEntry-count'
        + '[data-functionId=' + functionId + ']'
        + '[data-companyId=' + companyId + ']';
      totalSelector = '.fte-masterEntry-total-prodFunction-company'
        + '[data-functionId=' + functionId + ']'
        + '[data-companyId=' + companyId + ']';
      this.$(countSelector).each(function() { total += parseInt(this.value, 10) || 0; });
      this.$(totalSelector).text(total);

      total = 0;
      countSelector = '.fte-masterEntry-total-prodFunction-company'
        + '[data-companyId="' + companyId + '"]';
      totalSelector = '.fte-masterEntry-total-company[data-companyId="' + companyId + '"]';
      this.$(countSelector).each(function() { total += parseInt(this.innerHTML, 10) || 0; });
      this.$(totalSelector).text(total);

      total = 0;
      countSelector = '.fte-masterEntry-total-prodFunction-company'
        + '[data-functionId="' + functionId + '"]';
      totalSelector = '.fte-masterEntry-total-prodFunction[data-functionId="' + functionId + '"]';
      this.$(countSelector).each(function() { total += parseInt(this.innerHTML, 10) || 0; });
      this.$(totalSelector).text(total);

      total = 0;
      countSelector = '.fte-masterEntry-total-company';
      totalSelector = '.fte-masterEntry-total';
      this.$(countSelector).each(function() { total += parseInt(this.innerHTML, 10) || 0; });
      this.$(totalSelector).text(total);
    },

    onRemoteEdit: function(message)
    {
      if (message.socketId === this.socket.getId())
      {
        return;
      }

      if (message.type === 'plan')
      {
        this.handlePlanChange(message);
      }
      else
      {
        this.handleCountChange(message);
      }
    },

    handlePlanChange: function(message)
    {
      var selector = '.fte-masterEntry-noPlan[data-task="' + message.taskIndex + '"]';

      var $noPlan = this.$(selector);

      if (!$noPlan.length)
      {
        return;
      }

      $noPlan.prop('checked', message.newValue);
    },

    handleCountChange: function(message)
    {
      var selector = '.fte-masterEntry-count'
        + '[data-task=' + message.taskIndex + ']'
        + '[data-function=' + message.functionIndex + ']'
        + '[data-company=' + message.companyIndex + ']';

      var $count = this.$(selector);

      if (!$count.length)
      {
        return;
      }

      $count.val(message.newCount);
      $count.attr({
        'data-value': message.newCount,
        'data-remote': 'true'
      });

      this.recount($count[0], message.taskIndex, message.companyIndex);
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
