// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/View',
  'app/core/util/onModelDeleted',
  'app/users/util/setUpUserSelect2',
  'app/fte/templates/masterEntry',
  'app/fte/templates/absentUserRow',
  '../util/fractions',
  'jquery.stickytableheaders'
], function(
  _,
  $,
  View,
  onModelDeleted,
  setUpUserSelect2,
  masterEntryTemplate,
  absentUserRowTemplate,
  fractionsUtil
) {
  'use strict';

  return View.extend({

    template: masterEntryTemplate,

    events: {
      'change .fte-masterEntry-count': 'updateCount',
      'keyup .fte-masterEntry-count': 'updateCount',
      'keydown .fte-masterEntry-count': function(e)
      {
        if (e.which === 13)
        {
          this.focusNextInput(this.$(e.target));

          return false;
        }
      },
      'change .fte-masterEntry-noPlan': function(e)
      {
        this.updatePlan(e.currentTarget);
      },
      'click .fte-masterEntry-noPlan-container': function(e)
      {
        if (e.target.classList.contains('fte-masterEntry-noPlan-container'))
        {
          this.$(e.target).find('.fte-masterEntry-noPlan').click();
        }
      },
      'click .fte-masterEntry-absence-remove': 'removeAbsentUser',
      'focus .fte-masterEntry-count, .fte-masterEntry-noPlan': function(e)
      {
        var inputEl = e.target;
        var cellEl = inputEl.parentNode;
        var rowEl = cellEl.parentNode;
        var dataset = inputEl.dataset;
        var cachedColumns = this.cachedColumns;

        this.focused = [
          inputEl.parentNode,
          rowEl.children[0]
        ];

        if (inputEl.classList.contains('fte-masterEntry-noPlan'))
        {
          this.focused.push(this.el.querySelector('.fte-masterEntry-column-noPlan'));
        }
        else if (cellEl.classList.contains('fte-masterEntry-demand'))
        {
          this.focused.push(
            this.el.querySelector('.fte-masterEntry-total-demand-company[data-companyid="' + dataset.companyid + '"]'),
            rowEl.querySelector('.fte-masterEntry-total-demand-task')
          );
        }
        else
        {
          var companyColumnIndex = dataset.function + ':' + dataset.company;

          this.focused.push(
            cachedColumns.prodFunctions[dataset.function],
            cachedColumns.prodFunctionTotals[dataset.function],
            cachedColumns.companies[companyColumnIndex],
            cachedColumns.companyTotals[companyColumnIndex],
            rowEl.querySelector('.fte-masterEntry-total-company-task[data-companyindex="' + dataset.company + '"]')
          );
        }

        this.$(this.focused).addClass('is-focused');
      },
      'blur .fte-masterEntry-count, .fte-masterEntry-noPlan': function(e)
      {
        this.$(this.focused).removeClass('is-focused');

        if (e.currentTarget.value === '0')
        {
          e.currentTarget.value = '';
        }
      },
      'click .fte-count-container': function(e)
      {
        if (e.target.classList.contains('fte-count-container'))
        {
          this.$(e.currentTarget).find('input').select();
        }
      },
      'click a[data-action="showHidden"]': function(e)
      {
        var noPlanEl = this.$('.fte-masterEntry-noPlan[data-task="' + e.currentTarget.dataset.task + '"]')[0];

        noPlanEl.checked = false;

        this.updatePlan(noPlanEl);

        this.$(e.currentTarget).parent().remove();

        return false;
      }
    },

    remoteTopics: function()
    {
      var topics = {};

      topics['fte.master.updated.' + this.model.id] = 'onRemoteEdit';
      topics['fte.master.deleted'] = 'onModelDeleted';

      return topics;
    },

    initialize: function()
    {
      this.focused = null;
      this.cachedColumns = {
        prodFunctions: null,
        prodFunctionTotals: null,
        companies: null,
        companyTotals: null
      };
    },

    destroy: function()
    {
      this.$('.fte-masterEntry').stickyTableHeaders('destroy');

      this.focused = null;
      this.cachedColumns = null;
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change', this.render);

      this.setUpUserFinder();
      this.setUpStickyHeaders();
      this.cacheColumns();
      this.updateNoPlanDropdown();
      this.focusFirstEnabledInput();
    },

    serialize: function()
    {
      return _.assign(this.model.serializeWithTotals(), {
        idPrefix: this.idPrefix,
        editable: true,
        changing: false,
        renderAbsentUserRow: absentUserRowTemplate,
        round: fractionsUtil.round
      });
    },

    setUpUserFinder: function()
    {
      var view = this;
      var $entries = this.$('.fte-masterEntry-absence-entries');
      var $noEntries = this.$('.fte-masterEntry-absence-noEntries');
      var $userFinder = setUpUserSelect2(this.$('.fte-masterEntry-absence-userFinder'), {
        userFilter: function(user)
        {
          var selector = '.fte-masterEntry-absence-remove[data-userId="' + user._id + '"]';

          return $entries.find(selector).length === 0;
        }
      });

      if ($entries.children().length)
      {
        $noEntries.hide();
      }
      else
      {
        $entries.hide();
      }

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
            view.trigger('remoteError', err);
          }
          else
          {
            view.handleAddAbsentUserChange(data);
          }
        });
      });
    },

    setUpStickyHeaders: function()
    {
      this.$('.fte-masterEntry').stickyTableHeaders({fixedOffset: $('.navbar-fixed-top')});
    },

    cacheColumns: function()
    {
      var cachedColumns = {
        prodFunctions: {},
        prodFunctionTotals: {},
        companies: {},
        companyTotals: {}
      };
      var $thead = this.$('.tableFloatingHeaderOriginal');

      cacheColumns('column-prodFunction', 'prodFunctions');
      cacheColumns('total-prodFunction', 'prodFunctionTotals');
      cacheColumns('column-company', 'companies');
      cacheColumns('total-prodFunction-company', 'companyTotals');

      this.cachedColumns = cachedColumns;

      function cacheColumns(selector, property)
      {
        $thead.find('.fte-masterEntry-' + selector).each(function()
        {
          cachedColumns[property][this.dataset.column] = this;
        });
      }
    },

    focusNextInput: function($current)
    {
      var $nextCell = $current.parent().next();

      if ($nextCell.length)
      {
        if ($nextCell.hasClass('fte-masterEntry-total-shortage'))
        {
          return this.focusFirstEnabledInput(true);
        }

        return $nextCell.find('input').select();
      }

      var $nextRow = $current.closest('tr').next();

      if (!$nextRow.length)
      {
        return this.focusFirstEnabledInput();
      }

      this.focusNextEnabledInput($nextRow);
    },

    focusFirstEnabledInput: function(skipDemand)
    {
      var $demand = this.$('.fte-masterEntry-total-demand-company').first();

      if (!skipDemand && $demand.length)
      {
        $demand.find('input').select();

        return;
      }

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

      $noPlanRow[$noPlan[0].checked ? 'fadeOut' : 'fadeIn'](this.updateNoPlanDropdown.bind(this));

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

    updateNoPlanDropdown: function()
    {
      var $dropdown = this.$('.fte-masterEntry-noPlan-dropdown');
      var html = '';

      this.$('tbody > tr').each(function()
      {
        if (this.style.display !== 'none')
        {
          return;
        }

        html += '<li><a href="#" data-action="showHidden" data-task="' + this.dataset.taskIndex + '">'
          + this.children[0].textContent
          + '</a></li>';
      });

      $dropdown.find('.dropdown-menu').html(html);

      if (html.length)
      {
        $dropdown.fadeIn();
      }
      else
      {
        $dropdown.fadeOut();
      }
    },

    updatePlan: function(noPlanEl)
    {
      var view = this;
      var data = {
        type: 'plan',
        socketId: view.socket.getId(),
        _id: view.model.id,
        taskId: noPlanEl.dataset.taskid,
        taskIndex: +noPlanEl.dataset.task,
        newValue: noPlanEl.checked
      };
      var $noPlan = view.$(noPlanEl);

      this.toggleCountsInRow($noPlan);

      this.socket.emit('fte.master.updatePlan', data, function(err)
      {
        if (err)
        {
          noPlanEl.checked = !noPlanEl.checked;

          view.toggleCountsInRow($noPlan);

          view.trigger('remoteError', err);
        }
      });
    },

    updateCount: function(e)
    {
      var dataset = e.target.dataset;
      var oldCount = fractionsUtil.parse(dataset.value);
      var newCount = fractionsUtil.parse(e.target.value);

      if (oldCount === newCount)
      {
        return;
      }

      var timerKey = dataset.task
        + ':' + dataset.function
        + ':' + dataset.company;

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
      var view = this;

      delete view.timers[timerKey];

      var dataset = countEl.dataset;
      var oldRemote = dataset.remote;
      var data = {
        type: 'count',
        socketId: view.socket.getId(),
        _id: view.model.id,
        kind: dataset.kind,
        newCount: newCount
      };

      if (data.kind === 'demand')
      {
        data.companyId = dataset.companyid;
      }
      else
      {
        data.taskIndex = +dataset.task;
        data.functionIndex = +dataset.function;
        data.companyIndex = +dataset.company;
      }

      dataset.value = data.newCount;
      dataset.remote = 'false';

      view.socket.emit('fte.master.updateCount', data, function(err)
      {
        if (err)
        {
          if (dataset.remote !== 'true')
          {
            countEl.value = oldCount;
            dataset.value = oldCount;
            dataset.remote = oldRemote;

            view.recount(countEl);
          }

          view.trigger('remoteError', err);
        }
      });

      view.recount(countEl);
    },

    recount: function(countEl)
    {
      if (countEl.dataset.kind === 'demand')
      {
        this.recountDemand();
      }
      else
      {
        this.recountSupply(countEl);
      }
    },

    recountDemand: function()
    {
      var countSelector;
      var totalSelector;
      var total;
      var $thead = this.$('.tableFloatingHeaderOriginal');

      // Overall total
      total = 0;
      countSelector = '.fte-masterEntry-count[data-kind="demand"]';
      totalSelector = '.fte-masterEntry-total-demand';
      $thead.find(countSelector).each(function() { total += fractionsUtil.parse(this.value); });
      $thead.find(totalSelector).text(fractionsUtil.round(total));

      this.recountShortage();
    },

    recountSupply: function(countEl)
    {
      var countSelector;
      var totalSelector;
      var total;
      var $taskTr = this.$(countEl).closest('tr');
      var $thead = this.$('.tableFloatingHeaderOriginal');
      var functionId = countEl.dataset.functionid;
      var companyId = countEl.dataset.companyid;
      var prefix = '.fte-masterEntry-supply';

      // Task company total
      total = 0;
      countSelector = '.fte-masterEntry-count[data-companyId="' + companyId + '"]';
      totalSelector = '.fte-masterEntry-total-company-task[data-companyId="' + companyId + '"]';
      $taskTr.find(countSelector).each(function() { total += fractionsUtil.parse(this.value); });
      $taskTr.find(totalSelector).text(fractionsUtil.round(total));

      // Prod function company total
      total = 0;
      countSelector = prefix + ' > .fte-masterEntry-count'
        + '[data-functionId=' + functionId + ']'
        + '[data-companyId=' + companyId + ']';
      totalSelector = prefix + '.fte-masterEntry-total-prodFunction-company'
        + '[data-functionId=' + functionId + ']'
        + '[data-companyId=' + companyId + ']';
      this.$(countSelector).each(function()
      {
        if (!this.disabled)
        {
          total += fractionsUtil.parse(this.value);
        }
      });
      $thead.find(totalSelector).text(fractionsUtil.round(total));

      // Company total
      total = 0;
      countSelector = prefix + '.fte-masterEntry-total-prodFunction-company'
        + '[data-companyId="' + companyId + '"]';
      totalSelector = prefix + '.fte-masterEntry-total-company[data-companyId="' + companyId + '"]';
      $thead.find(countSelector).each(function() { total += fractionsUtil.parse(this.innerHTML); });
      $thead.find(totalSelector).text(fractionsUtil.round(total));

      // Prod function total
      total = 0;
      countSelector = prefix + '.fte-masterEntry-total-prodFunction-company'
        + '[data-functionId="' + functionId + '"]';
      totalSelector = prefix + '.fte-masterEntry-total-prodFunction[data-functionId="' + functionId + '"]';
      $thead.find(countSelector).each(function() { total += fractionsUtil.parse(this.innerHTML); });
      $thead.find(totalSelector).text(fractionsUtil.round(total));

      // Overall total
      total = 0;
      countSelector = prefix + '.fte-masterEntry-total-company';
      totalSelector = prefix + '.fte-masterEntry-total';
      $thead.find(countSelector).each(function() { total += fractionsUtil.parse(this.innerHTML); });
      $thead.find(totalSelector).text(fractionsUtil.round(total));

      this.recountShortage();
    },

    recountShortage: function()
    {
      var $thead = this.$('.tableFloatingHeaderOriginal');
      var demand = {
        total: fractionsUtil.parse($thead.find('.fte-masterEntry-total-demand').text())
      };
      var supply = {
        total: fractionsUtil.parse($thead.find('.fte-masterEntry-total').text())
      };

      $thead.find('.fte-masterEntry-total-shortage').text(
        demand.total ? fractionsUtil.round(demand.total - supply.total) : 0
      );

      $thead.find('.fte-masterEntry-count[data-kind="demand"]').each(function()
      {
        demand[this.dataset.companyid] = fractionsUtil.parse(this.value);
      });
      $thead.find('.fte-masterEntry-total-company').each(function()
      {
        var companyId = this.dataset.companyid;

        supply[companyId] = fractionsUtil.parse(this.textContent);

        $thead.find('.fte-masterEntry-total-shortage-company[data-companyid="' + companyId + '"]').text(
          demand.total ? fractionsUtil.round(demand[companyId] - supply[companyId]) : 0
        );
      });

      this.$('.fte-masterEntry-shortage.fte-masterEntry-total-company-task').each(function()
      {
        var companyId = this.dataset.companyid;
        var count = fractionsUtil.parse(this.textContent);

        supply.total += count;
        supply[companyId] += count;
      });

      $thead.find('.fte-masterEntry-shortage-diff-total').text(
        demand.total ? fractionsUtil.round(demand.total - supply.total) : 0
      );

      $thead.find('.fte-masterEntry-shortage-diff').each(function()
      {
        var companyId = this.dataset.companyid;

        this.textContent = demand.total ? fractionsUtil.round(demand[companyId] - supply[companyId]) : 0;
      });
    },

    recountAll: function($row)
    {
      var view = this;

      $row.find('.fte-masterEntry-count').each(function()
      {
        this.value = '';
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
          $button.attr('disabled', false);

          view.trigger('remoteError', err);
        }
        else
        {
          view.handleRemoveAbsentUserChange(data);
        }
      });
    },

    onRemoteEdit: function(message)
    {
      this.model.handleUpdateMessage(message, true);

      if (message.socketId === this.socket.getId())
      {
        return;
      }

      switch (message.type)
      {
        case 'plan':
          return this.handlePlanChange(message.action);

        case 'count':
          return this.handleCountChange(message.action);

        case 'addAbsentUser':
          return this.handleAddAbsentUserChange(message);

        case 'removeAbsentUser':
          return this.handleRemoveAbsentUserChange(message);

        case 'edit':
          return this.render();
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
      var selector;

      if (message.kind === 'demand')
      {
        selector = '.fte-masterEntry-demand > .fte-masterEntry-count[data-companyid="' + message.companyId + '"]';
      }
      else
      {
        selector = '.fte-masterEntry-supply'
          + ' > .fte-masterEntry-count[data-task="' + message.taskIndex + '"]'
          + '[data-function="' + message.functionIndex + '"]'
          + '[data-company="' + message.companyIndex + '"]';
      }

      var $count = this.$(selector);

      if (!$count.length)
      {
        return;
      }

      $count.val(message.newCount || '');
      $count.attr({
        'data-value': message.newCount,
        'data-remote': 'true'
      });

      this.recount($count[0]);
    },

    onModelDeleted: function(message)
    {
      onModelDeleted(this.broker, this.model, message);
    }

  });
});
