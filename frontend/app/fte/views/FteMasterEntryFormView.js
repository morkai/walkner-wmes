define([
  'underscore',
  'jquery',
  'moment',
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/fte/templates/masterEntry',
  'app/fte/templates/absentUserRow',
  './fractionsUtil',
  'i18n!app/nls/fte'
], function(
  _,
  $,
  moment,
  t,
  user,
  View,
  masterEntryTemplate,
  absentUserRowTemplate,
  fractionsUtil
) {
  'use strict';

  return View.extend({

    template: masterEntryTemplate,

    idPrefix: 'masterEntryForm',

    events: {
      'change .fte-masterEntry-count': 'updateCount',
      'keyup .fte-masterEntry-count': 'updateCount',
      'change .fte-masterEntry-noPlan': 'updatePlan',
      'click .fte-masterEntry-noPlan-container': function(e)
      {
        if (e.target.classList.contains('fte-masterEntry-noPlan-container'))
        {
          this.$(e.target).find('.fte-masterEntry-noPlan').click();
        }
      },
      'click .fte-masterEntry-absence-remove': 'removeAbsentUser'
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
      if (this.model.get('locked'))
      {
        return this.broker.publish('router.navigate', {
          url: this.model.genClientUrl(),
          replace: true,
          trigger: true
        });
      }

      this.listenToOnce(this.model, 'change', this.render);

      this.setUpUserFinder();

      this.focusFirstEnabledInput();
    },

    serialize: function()
    {
      return _.extend(this.model.serializeWithTotals(), {
        editable: true,
        renderAbsentUserRow: absentUserRowTemplate,
        round: fractionsUtil.round
      });
    },

    setUpUserFinder: function()
    {
      var $userFinder = this.$('.fte-masterEntry-absence-userFinder');
      var $entries = this.$('.fte-masterEntry-absence-entries');
      var $noEntries = this.$('.fte-masterEntry-absence-noEntries');

      if ($entries.children().length)
      {
        $noEntries.hide();
      }
      else
      {
        $entries.hide();
      }

      $userFinder.select2({
        allowClear: true,
        minimumInputLength: 3,
        ajax: {
          cache: true,
          quietMillis: 500,
          url: function(term)
          {
            term = term.trim();

            var property = /^[0-9]+$/.test(term) ? 'personellId' : 'lastName';

            term = encodeURIComponent('^' + term);

            return '/users'
              + '?select(personellId,lastName,firstName)'
              + '&sort(lastName)'
              + '&limit(20)&regex(' + property + ',' + term + ',i)';
          },
          results: function(data)
          {
            return {
              results: (data.collection || [])
                .filter(function(user)
                {
                  var selector = '.fte-masterEntry-absence-remove[data-userId="' + user._id + '"]';

                  return $entries.find(selector).length === 0;
                })
                .map(function(user)
                {
                  var name = user.lastName && user.firstName
                    ? (user.firstName + ' ' + user.lastName)
                    : '-';
                  var personellId = user.personellId ? user.personellId : '-';

                  return {
                    id: user._id,
                    text: name + ' (' + personellId + ')',
                    name: name,
                    personellId: personellId
                  };
                })
            };
          }
        }
      });

      var view = this;

      $userFinder.on('change', function(e)
      {
        $userFinder.select2('val', '');

        var data = {
          type: 'addAbsentUser',
          socketId: view.socket.getId(),
          _id: view.model.id,
          user: e.added
        };

        view.socket.emit('fte.master.addAbsentUser', data, function(err)
        {
          if (err)
          {
            console.error(err);
          }
          else
          {
            view.handleAddAbsentUserChange(data);
          }
        });
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
      var noPlanEl = this.el.querySelector('.fte-masterEntry-noPlan:not(:checked)');

      if (noPlanEl)
      {
        this.$(noPlanEl).closest('tr').find('.fte-masterEntry-count').first().select();
      }
    },

    focusNextEnabledInput: function($nextRow)
    {
      if (!$nextRow.length)
      {
        return this.focusFirstEnabledInput();
      }

      if ($nextRow.find('.fte-masterEntry-noPlan:checked').length)
      {
        return this.focusNextEnabledInput($nextRow.next());
      }

      $nextRow.find('.fte-masterEntry-count').first().select();
    },

    toggleCountsInRow: function($noPlan, remote)
    {
      var $focusedRow = this.$(this.el.ownerDocument.activeElement).closest('tr');
      var $lastRow = this.$('.fte-masterEntry > tbody > :last-child');
      var $noPlanRow = $noPlan.closest('tr');

      $noPlanRow.find('.fte-masterEntry-count').attr('disabled', $noPlan[0].checked);

      if (!$noPlan[0].checked)
      {
        if (!remote)
        {
          $noPlanRow.find('.fte-masterEntry-count').first().select();
        }
      }

      this.recountAll($noPlanRow);

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
        taskId: e.target.getAttribute('data-taskId'),
        taskIndex: parseInt(e.target.getAttribute('data-task'), 10),
        newValue: e.target.checked
      };
      var $noPlan = this.$(e.target);
      var view = this;

      this.toggleCountsInRow($noPlan);

      this.socket.emit('fte.master.updatePlan', data, function(err)
      {
        if (err)
        {
          console.error(err);

          e.target.checked = !e.target.checked;

          view.toggleCountsInRow($noPlan);
        }
      });
    },

    updateCount: function(e)
    {
      if (e.which === 13)
      {
        return this.focusNextInput(this.$(e.target));
      }

      var oldCount = fractionsUtil.parse(e.target.getAttribute('data-value'));
      console.log('newCount', e.target.value);
      var newCount = fractionsUtil.parse(e.target.value);

      if (oldCount === newCount)
      {
        return;
      }

      var timerKey = e.target.getAttribute('data-task')
        + ':' + e.target.getAttribute('data-function')
        + ':' + e.target.getAttribute('data-company');

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
        newCount: newCount,
        taskIndex: parseInt(countEl.getAttribute('data-task'), 10),
        functionIndex: parseInt(countEl.getAttribute('data-function'), 10),
        companyIndex: parseInt(countEl.getAttribute('data-company'), 10)
      };

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

            view.recount(countEl);
          }
        }
      });

      this.recount(countEl);
    },

    recount: function(countEl)
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
      $taskTr.find(countSelector).each(function() { total += fractionsUtil.parse(this.value); });
      $taskTr.find(totalSelector).text(fractionsUtil.round(total));

      total = 0;
      countSelector = '.fte-masterEntry-count'
        + '[data-functionId=' + functionId + ']'
        + '[data-companyId=' + companyId + ']';
      totalSelector = '.fte-masterEntry-total-prodFunction-company'
        + '[data-functionId=' + functionId + ']'
        + '[data-companyId=' + companyId + ']';
      this.$(countSelector).each(function()
      {
        if (!this.disabled)
        {
          total += fractionsUtil.parse(this.value);
        }
      });
      this.$(totalSelector).text(fractionsUtil.round(total));

      total = 0;
      countSelector = '.fte-masterEntry-total-prodFunction-company'
        + '[data-companyId="' + companyId + '"]';
      totalSelector = '.fte-masterEntry-total-company[data-companyId="' + companyId + '"]';
      this.$(countSelector).each(function() { total += fractionsUtil.parse(this.innerHTML); });
      this.$(totalSelector).text(fractionsUtil.round(total));

      total = 0;
      countSelector = '.fte-masterEntry-total-prodFunction-company'
        + '[data-functionId="' + functionId + '"]';
      totalSelector = '.fte-masterEntry-total-prodFunction[data-functionId="' + functionId + '"]';
      this.$(countSelector).each(function() { total += fractionsUtil.parse(this.innerHTML); });
      this.$(totalSelector).text(fractionsUtil.round(total));

      total = 0;
      countSelector = '.fte-masterEntry-total-company';
      totalSelector = '.fte-masterEntry-total';
      this.$(countSelector).each(function() { total += fractionsUtil.parse(this.innerHTML); });
      this.$(totalSelector).text(fractionsUtil.round(total));
    },

    recountAll: function($row)
    {
      var view = this;

      $row.find('.fte-masterEntry-count').each(function()
      {
        this.value = '0';
        this.setAttribute('data-value', '0');

        view.recount(this);
      });
    },

    removeAbsentUser: function(e)
    {
      var $button = this.$(e.target).closest('button').attr('disabled', true);

      var data = {
        type: 'removeAbsentUser',
        socketId: this.socket.getId(),
        _id: this.model.id,
        userId: $button.attr('data-userId')
      };

      var view = this;

      this.socket.emit('fte.master.removeAbsentUser', data, function(err)
      {
        if (err)
        {
          console.error(err);

          $button.attr('disabled', false);
        }
        else
        {
          view.handleRemoveAbsentUserChange(data);
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

        case 'addAbsentUser':
          return this.handleAddAbsentUserChange(message);

        case 'removeAbsentUser':
          return this.handleRemoveAbsentUserChange(message);
      }
    },

    handleAddAbsentUserChange: function(message)
    {
      var absentUser = message.user;

      if (this.$('.fte-masterEntry-absence-remove[data-userId="' + absentUser.id + '"]').length)
      {
        return;
      }

      $(absentUserRowTemplate({absentUser: absentUser, editable: true}))
        .hide()
        .appendTo(this.$('.fte-masterEntry-absence-entries').show())
        .fadeIn('fast');

      this.$('.fte-masterEntry-absence-noEntries').hide();
    },

    handleRemoveAbsentUserChange: function(message)
    {
      var $button = this.$('.fte-masterEntry-absence-remove[data-userId="' + message.userId + '"]');

      if ($button.length)
      {
        var view = this;

        $button.closest('tr').fadeOut(function()
        {
          $(this).remove();

          var $entries = view.$('.fte-masterEntry-absence-entries');

          if (!$entries.length)
          {
            $entries.hide();
            view.$('.fte-masterEntry-absence-noEntries').show();
          }
        });
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

      this.toggleCountsInRow($noPlan, true);
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
