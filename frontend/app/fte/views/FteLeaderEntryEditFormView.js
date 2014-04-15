// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/core/util/onModelDeleted',
  'app/fte/templates/leaderEntry',
  './fractionsUtil'
], function(
  _,
  $,
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
      'keyup .fte-leaderEntry-count': 'updateCount',
      'focus .fte-leaderEntry-count': function(e)
      {
        var inputEl = e.target;
        var dataset = inputEl.dataset;

        this.focused = [
          inputEl.parentNode,
          inputEl.parentNode.parentNode.children[0],
          this.theadEl.querySelector(
            '.fte-leaderEntry-column-company[data-column="' + dataset.company + '"]'
          ),
          this.theadEl.querySelector(
            '.fte-leaderEntry-total-company[data-column="' + dataset.company + '"]'
          )
        ];

        if (inputEl.dataset.division === undefined)
        {
          this.focused.push.apply(this.focused, this.theadEl.querySelectorAll(
            '.fte-leaderEntry-column-division[data-column^="' + dataset.company + '"]'
          ));
        }
        else
        {
          this.focused.push(this.theadEl.querySelector(
            '.fte-leaderEntry-column-division[data-column="'
            + dataset.company + ':' + dataset.division
            + '"]'
          ));
        }

        $(this.focused).addClass('is-focused');
      },
      'blur .fte-leaderEntry-count': function()
      {
        $(this.focused).removeClass('is-focused');
      }
    },

    remoteTopics: function()
    {
      var topics = {};

      topics['fte.leader.updated.' + this.model.id] = 'onRemoteEdit';
      topics['fte.leader.deleted'] = 'onModelDeleted';

      return topics;
    },

    initialize: function()
    {
      this.focused = null;
      this.theadEl = null;
    },

    destroy: function()
    {
      this.focused = null;
      this.theadEl = null;
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change', this.render);

      this.theadEl = this.el.getElementsByTagName('thead')[0];

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

      var dataset = e.target.dataset;
      var oldCount = fractionsUtil.parse(dataset.value) || 0;
      var newCount = fractionsUtil.parse(e.target.value) || 0;

      if (oldCount === newCount)
      {
        return;
      }

      var timerKey = dataset.task + ':' + dataset.company + ':' + dataset.division;

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

      var dataset = countEl.dataset;
      var oldRemote = dataset.remote;
      var data = {
        socketId: this.socket.getId(),
        _id: this.model.id,
        newCount: newCount,
        taskIndex: parseInt(dataset.task, 10),
        companyIndex: parseInt(dataset.company, 10)
      };

      var divisionIndex = parseInt(dataset.division, 10);

      if (!isNaN(divisionIndex))
      {
        data.divisionIndex = divisionIndex;
      }

      dataset.value = data.newCount;
      dataset.remote = 'false';

      var view = this;

      this.socket.emit('fte.leader.updateCount', data, function(err)
      {
        if (err)
        {
          if (dataset.remote !== 'true')
          {
            countEl.value = oldCount;
            dataset.value = oldCount;
            dataset.remote = oldRemote;

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

      this.$('.fte-leaderEntry-total-company[data-column=' + companyIndex + ']')
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
