define([
  'underscore',
  'moment',
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/fte/templates/leaderEntry',
  'i18n!app/nls/fte'
], function(
  _,
  moment,
  t,
  user,
  View,
  leaderEntryTemplate
) {
  'use strict';

  return View.extend({

    template: leaderEntryTemplate,

    idPrefix: 'leaderEntryForm',

    events: {
      'change .fte-leaderEntry-count': 'updateCount',
      'keyup .fte-leaderEntry-count': 'updateCount'
    },

    initialize: function()
    {
      var view = this;

      this.listenToOnce(this.model, 'sync', function()
      {
        var redirectToDetails = view.redirectToDetails.bind(view);

        view.pubsub.subscribe('fte.leader.updated.' + view.model.id, view.onRemoteEdit.bind(view));
        view.pubsub.subscribe('fte.leader.locked.' + view.model.id, redirectToDetails);
        view.pubsub.subscribe('shiftChanged', redirectToDetails);
      });
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change', this.render);

      this.$('.fte-leaderEntry-count').first().focus();
    },

    serialize: function()
    {
      return _.extend(this.model.serializeWithTotals(), {editable: true});
    },

    updateCount: function(e)
    {
      var timerKey =
        e.target.getAttribute('data-task') + ':' + e.target.getAttribute('data-company');

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
        socketId: this.socket.getId(),
        _id: this.model.id,
        newCount: parseInt(countEl.value, 10) || 0,
        taskIndex: parseInt(countEl.getAttribute('data-task'), 10),
        companyIndex: parseInt(countEl.getAttribute('data-company'), 10)
      };

      if (data.newCount === oldCount)
      {
        return;
      }

      countEl.setAttribute('data-value', data.newCount);
      countEl.setAttribute('data-remote', 'false');

      var view = this;

      this.socket.emit('fte.leader.updateCount', data, function(err)
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

      this.recount(countEl, data.taskIndex, data.companyIndex);
    },

    recount: function(countEl, taskIndex, companyIndex)
    {
      var taskTotal = 0;
      var companyTotal = 0;
      var overallTotal = 0;

      var $taskTr = this.$(countEl).closest('tr');

      $taskTr.find('.fte-leaderEntry-count').each(function()
      {
        taskTotal += parseInt(this.value, 10) || 0;
      });

      $taskTr.find('.fte-leaderEntry-total-task')
        .text(taskTotal);

      this.$('.fte-leaderEntry-count[data-company=' + companyIndex + ']').each(function()
      {
        companyTotal += parseInt(this.value, 10) || 0;
      });

      this.$('td.fte-leaderEntry-total-company[data-company=' + companyIndex + ']')
        .text(companyTotal);

      this.$('.fte-leaderEntry-total-company').each(function()
      {
        overallTotal += parseInt(this.innerHTML, 10) || 0;
      });

      this.$('td.fte-leaderEntry-total-overall')
        .text(overallTotal);
    },

    onRemoteEdit: function(message)
    {
      if (message.socketId === this.socket.getId())
      {
        return;
      }

      var selector = '.fte-leaderEntry-count'
        + '[data-company=' + message.companyIndex + ']'
        + '[data-task=' + message.taskIndex + ']';

      var $count = this.$(selector);

      if ($count.length === 0)
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
