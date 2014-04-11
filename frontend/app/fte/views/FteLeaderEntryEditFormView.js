define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/core/util/onModelDeleted',
  'app/fte/templates/leaderEntry',
  './fractionsUtil'
], function(
  _,
  t,
  user,
  View,
  onModelDeleted,
  leaderEntryTemplate,
  fractionsUtil
) {
  'use strict';

  return View.extend({

    template: leaderEntryTemplate,

    idPrefix: 'leaderEntryForm',

    events: {
      'change .fte-leaderEntry-count': 'updateCount',
      'keyup .fte-leaderEntry-count': 'updateCount'
    },

    remoteTopics: function()
    {
      var topics = {};

      topics['fte.leader.updated.' + this.model.id] = this.onRemoteEdit.bind(this);
      topics['fte.leader.deleted'] = this.onModelDeleted.bind(this);

      return topics;
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change', this.render);

      this.$('.fte-leaderEntry-count').first().select();
    },

    serialize: function()
    {
      return _.extend(this.model.serializeWithTotals(), {
        editable: true,
        round: fractionsUtil.round
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

      if ($nextRow.length)
      {
        return $nextRow.find('.fte-leaderEntry-count').first().select();
      }

      this.el.querySelector('.fte-leaderEntry-count').select();
    },

    updateCount: function(e)
    {
      if (e.which === 13)
      {
        return this.focusNextInput(this.$(e.target));
      }

      var oldCount = fractionsUtil.parse(e.target.getAttribute('data-value')) || 0;
      var newCount = fractionsUtil.parse(e.target.value) || 0;

      if (oldCount === newCount)
      {
        return;
      }

      var timerKey = e.target.getAttribute('data-task')
        + ':' + e.target.getAttribute('data-company')
        + ':' + e.target.getAttribute('data-division');

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
        socketId: this.socket.getId(),
        _id: this.model.id,
        newCount: newCount,
        taskIndex: parseInt(countEl.getAttribute('data-task'), 10),
        companyIndex: parseInt(countEl.getAttribute('data-company'), 10)
      };

      var divisionIndex = parseInt(countEl.getAttribute('data-division'), 10);

      if (!isNaN(divisionIndex))
      {
        data.divisionIndex = divisionIndex;
      }

      countEl.setAttribute('data-value', data.newCount);
      countEl.setAttribute('data-remote', 'false');

      var view = this;

      this.socket.emit('fte.leader.updateCount', data, function(err)
      {
        if (err)
        {
          if (countEl.getAttribute('data-remote') !== 'true')
          {
            countEl.value = oldCount;
            countEl.setAttribute('data-value', oldCount);
            countEl.setAttribute('data-remote', oldRemote);

            view.recount(countEl, data.taskIndex, data.companyIndex);

            data.newCount = oldCount;

            view.model.handleUpdateMessage(data, true);
          }

          view.trigger('remoteError', err);
        }
      });

      this.recount(countEl, data.taskIndex, data.companyIndex);

      this.model.handleUpdateMessage(data, true);
    },

    recount: function(countEl, taskIndex, companyIndex)
    {
      var taskTotal = 0;
      var companyTotal = 0;
      var overallTotal = 0;

      var $taskTr = this.$(countEl).closest('tr');

      $taskTr.find('.fte-leaderEntry-count').each(function()
      {
        taskTotal += fractionsUtil.parse(this.value) || 0;
      });

      $taskTr.find('.fte-leaderEntry-total-task')
        .text(fractionsUtil.round(taskTotal));

      this.$('.fte-leaderEntry-count[data-company=' + companyIndex + ']').each(function()
      {
        companyTotal += fractionsUtil.parse(this.value) || 0;
      });

      this.$('.fte-leaderEntry-total-company[data-company=' + companyIndex + ']')
        .text(fractionsUtil.round(companyTotal));

      this.$('.fte-leaderEntry-total-company').each(function()
      {
        overallTotal += fractionsUtil.parse(this.innerHTML) || 0;
      });

      this.$('.fte-leaderEntry-total-overall')
        .text(fractionsUtil.round(overallTotal));
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

      if (typeof message.divisionIndex === 'number')
      {
        selector += '[data-division="' + message.divisionIndex + '"]';
      }

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

      this.model.handleUpdateMessage(message, true);
    },

    onModelDeleted: function(message)
    {
      onModelDeleted(this.broker, this.model, message);
    }

  });
});
