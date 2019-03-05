// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/core/View',
  'app/core/util/onModelDeleted',
  'app/fte/templates/leaderEntry',
  'app/fte/templates/focusInfoBar',
  '../util/fractions'
], function(
  _,
  $,
  user,
  View,
  onModelDeleted,
  leaderEntryTemplate,
  focusInfoBarTemplate,
  fractionsUtil
) {
  'use strict';

  return View.extend({

    template: leaderEntryTemplate,

    events: {
      'change .fte-leaderEntry-count': 'updateCount',
      'keyup .fte-leaderEntry-count': 'updateCount',
      'keydown .fte-leaderEntry-count': function(e)
      {
        if (e.which === 13)
        {
          this.focusNextInput(this.$(e.target));

          return false;
        }
      },
      'focus .fte-leaderEntry-count': function(e)
      {
        var inputEl = e.target;
        var rowEl = inputEl.parentNode.parentNode;
        var theadEl = this.theadEl;
        var dataset = inputEl.dataset;
        var funcComp = dataset.function + ':' + dataset.company;

        this.focused = [
          inputEl.parentNode,
          rowEl.children[0]
        ];

        if (this.withFunctions)
        {
          this.focused.push(
            theadEl.querySelector('.fte-leaderEntry-column-prodFunction[data-column="' + dataset.function + '"]'),
            theadEl.querySelector('.fte-leaderEntry-total-prodFunction[data-column="' + dataset.function + '"]'),
            theadEl.querySelector('.fte-leaderEntry-column-company[data-column="' + funcComp + '"]'),
            theadEl.querySelector('.fte-leaderEntry-total-prodFunction-company[data-column="' + funcComp + '"]')
          );
        }
        else
        {
          this.focused.push(
            theadEl.querySelector('.fte-leaderEntry-column-company[data-column="' + dataset.company + '"]'),
            theadEl.querySelector('.fte-leaderEntry-total-company[data-column="' + dataset.company + '"]')
          );
        }

        if (inputEl.dataset.division === undefined)
        {
          if (this.withFunctions)
          {
            this.focused.push(rowEl.querySelector(
              '.fte-leaderEntry-total-company-task[data-company="' + dataset.company + '"]'
            ));
            this.focused.push.apply(this.focused, theadEl.querySelectorAll(
              '.fte-leaderEntry-column-division[data-column^="' + funcComp + '"]'
            ));
            this.focused.push.apply(this.focused, theadEl.querySelectorAll(
              '.fte-leaderEntry-total-prodFunction-division[data-column^="' + funcComp + '"]'
            ));
          }
          else
          {
            this.focused.push.apply(this.focused, theadEl.querySelectorAll(
              '.fte-leaderEntry-column-division[data-column^="' + dataset.company + '"]'
            ));
          }
        }
        else
        if (this.withFunctions)
          {
            this.focused.push(
              rowEl.querySelector(
                '.fte-leaderEntry-total-company-task'
                + '[data-company="' + dataset.company + '"]'
                + '[data-division="' + dataset.division + '"]'
              ),
              theadEl.querySelector(
                '.fte-leaderEntry-column-division[data-column="' + funcComp + ':' + dataset.division + '"]'
              ),
              theadEl.querySelector(
                '.fte-leaderEntry-total-prodFunction-division[data-column="' + funcComp + ':' + dataset.division + '"]'
              )
            );
          }
          else
          {
            this.focused.push(theadEl.querySelector(
              '.fte-leaderEntry-column-division[data-column="' + dataset.company + ':' + dataset.division + '"]'
            ));
          }

        this.$(this.focused).addClass('is-focused');

        this.showFocusInfoBar(inputEl);
      },
      'focus textarea.fte-leaderEntry-comment': function(e)
      {
        var inputEl = e.target;
        var commentCellEl = inputEl.parentNode;
        var taskNameCellEl = commentCellEl.parentNode.previousElementSibling.firstElementChild;

        this.focused = [commentCellEl, taskNameCellEl];

        this.$(this.focused).addClass('is-focused');

        this.showFocusInfoBar(inputEl);
      },
      'blur .fte-leaderEntry-count, textarea.fte-leaderEntry-comment': function(e)
      {
        this.$(this.focused).removeClass('is-focused');

        if (e.currentTarget.value === '0')
        {
          e.currentTarget.value = '';
        }

        this.hideFocusInfoBar();
      },
      'click .fte-leaderEntry-toggleComment': function(e)
      {
        var $commentBtn = this.$(e.currentTarget);
        var $taskTr = $commentBtn.closest('tr');
        var $commentTr = $taskTr.next();

        $commentTr.toggleClass('hidden');
        $taskTr.toggleClass('has-visible-comment').toggleClass('has-invisible-comment');

        if ($commentTr.hasClass('hidden'))
        {
          $commentBtn.find('.fa').removeClass('fa-comment-o').addClass('fa-comment');
        }
        else
        {
          $commentBtn.find('.fa').removeClass('fa-comment').addClass('fa-comment-o');
          $commentTr.find('textarea').focus();
        }
      },
      'keyup textarea.fte-leaderEntry-comment': function(e)
      {
        this.updateComment(e.target);
      },
      'change textarea.fte-leaderEntry-comment': function(e)
      {
        this.doUpdateComment(e.target);
      },
      'click .fte-leaderEntry-count-container': function(e)
      {
        if (e.target.tagName === 'TD')
        {
          e.target.querySelector('input').select();
        }
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
      this.withFunctions = false;
    },

    destroy: function()
    {
      $('body').removeClass('is-with-fte-focusInfoBar');

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
      this.withFunctions = this.model.isWithFunctions();
      this.withDivisions = this.model.isWithDivisions();

      this.$focusInfoBar = $('<div class="fte-focusInfoBar"></div>').hide().appendTo(this.$el);

      this.$('.fte-leaderEntry-count').first().select();
    },

    serialize: function()
    {
      return _.assign(this.model.serializeWithTotals(), {
        idPrefix: this.idPrefix,
        editable: true,
        withFunctions: this.model.isWithFunctions(),
        round: fractionsUtil.round
      });
    },

    focusNextInput: function($current)
    {
      var $nextCell = $current.parent().next();

      if ($nextCell.hasClass('fte-leaderEntry-total-shortage'))
      {
        return this.scrollIntoView(this.$('tbody .fte-leaderEntry-count').first().select()[0]);
      }

      if ($nextCell.length && !$nextCell.hasClass('fte-leaderEntry-actions'))
      {
        return this.scrollIntoView($nextCell.find('.fte-leaderEntry-count').select()[0]);
      }

      var $nextRow = $current.closest('tr').next();

      while ($nextRow.length)
      {
        if ($nextRow.hasClass('is-parent') || $nextRow.hasClass('fte-leaderEntry-comment'))
        {
          $nextRow = $nextRow.next();
        }
        else
        {
          return this.scrollIntoView($nextRow.find('.fte-leaderEntry-count').first().select()[0]);
        }
      }

      this.scrollIntoView(this.$('.fte-leaderEntry-count').first().select()[0]);
    },

    scrollIntoView: function(el)
    {
      if (el.scrollIntoViewIfNeeded)
      {
        el.scrollIntoViewIfNeeded();
      }
      else
      {
        el.scrollIntoView(true);
      }
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
        + ':' + dataset.company
        + ':' + dataset.division;

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
        kind: dataset.kind || 'supply',
        newCount: newCount
      };

      if (data.kind === 'demand')
      {
        data.companyId = dataset.companyid;
      }
      else
      {
        var divisionIndex = +dataset.division;

        if (!isNaN(divisionIndex))
        {
          data.divisionIndex = divisionIndex;
        }

        data.taskIndex = +dataset.task;
        data.functionIndex = +dataset.function;
        data.companyIndex = +dataset.company;
        data.companyIndexServer = +dataset.companyServer;
      }

      dataset.value = data.newCount;
      dataset.remote = 'false';

      view.socket.emit('fte.leader.updateCount', data, function(err)
      {
        if (err)
        {
          if (dataset.remote !== 'true')
          {
            countEl.value = oldCount;
            dataset.value = oldCount;
            dataset.remote = oldRemote;

            view.recount(countEl, data.taskIndex, data.functionIndex, data.companyIndex);
          }

          view.trigger('remoteError', err);
        }
      });

      view.recount(countEl, data.taskIndex, data.functionIndex, data.companyIndex);
    },

    recount: function(countEl, taskIndex, functionIndex, companyIndex)
    {
      if (this.withFunctions)
      {
        return this.recountWithFunctions(countEl, taskIndex, functionIndex, companyIndex);
      }

      var taskTotal = 0;
      var companyTotal = 0;
      var overallTotal = 0;

      var $taskTr = this.$(countEl).closest('tr');

      $taskTr.find('.fte-leaderEntry-count').each(function()
      {
        taskTotal += fractionsUtil.parse(this.value);
      });

      $taskTr.find('.fte-leaderEntry-total-task').text(fractionsUtil.round(taskTotal));

      this.$('.fte-leaderEntry-count[data-company=' + companyIndex + ']').each(function()
      {
        companyTotal += fractionsUtil.parse(this.value);
      });

      this.$('.fte-leaderEntry-total-company[data-column=' + companyIndex + ']')
        .text(fractionsUtil.round(companyTotal));

      this.$('.fte-leaderEntry-total-company').each(function()
      {
        overallTotal += fractionsUtil.parse(this.innerHTML);
      });

      this.$('.fte-leaderEntry-total-overall').text(fractionsUtil.round(overallTotal));
    },

    recountWithFunctions: function(countEl)
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
      var $thead = this.$('thead');

      // Overall total
      total = 0;
      countSelector = '.fte-leaderEntry-count[data-kind="demand"]';
      totalSelector = '.fte-leaderEntry-total-demand';
      $thead.find(countSelector).each(function() { total += fractionsUtil.parse(this.value); });
      $thead.find(totalSelector).text(fractionsUtil.round(total));

      this.recountShortage();
    },

    recountShortage: function()
    {
      var $thead = this.$('thead');
      var demand = {
        total: fractionsUtil.parse($thead.find('.fte-leaderEntry-total-demand').text())
      };
      var supply = {
        total: fractionsUtil.parse($thead.find('.fte-leaderEntry-total').text())
      };

      $thead.find('.fte-leaderEntry-total-shortage').text(
        demand.total ? fractionsUtil.round(demand.total - supply.total) : 0
      );

      $thead.find('.fte-leaderEntry-count[data-kind="demand"]').each(function()
      {
        demand[this.dataset.companyid] = fractionsUtil.parse(this.value);
      });
      $thead.find('.fte-leaderEntry-total-company').each(function()
      {
        var companyId = this.dataset.companyid;

        supply[companyId] = fractionsUtil.parse(this.textContent);

        $thead.find('.fte-leaderEntry-total-shortage-company[data-companyid="' + companyId + '"]').text(
          demand.total ? fractionsUtil.round(demand[companyId] - supply[companyId]) : 0
        );
      });

      this.$('.fte-leaderEntry-total-company-task[data-absence]').each(function()
      {
        var companyId = this.dataset.companyid;
        var count = fractionsUtil.parse(this.textContent);

        supply.total += count;
        supply[companyId] += count;
      });

      $thead.find('.fte-leaderEntry-shortage-diff-total').text(
        demand.total ? fractionsUtil.round(demand.total - supply.total) : 0
      );

      $thead.find('.fte-leaderEntry-shortage-diff').each(function()
      {
        var companyId = this.dataset.companyid;

        this.textContent = demand.total ? fractionsUtil.round(demand[companyId] - supply[companyId]) : 0;
      });
    },

    recountSupply: function(countEl)
    {
      var $taskTr = this.$(countEl).closest('tr');
      var isChild = $taskTr.hasClass('is-child');
      var $parentTr = null;
      var $childTrs = [];
      var functionIndex = +countEl.dataset.function;
      var companyIndex = +countEl.dataset.company;
      var divisionIndex = +countEl.dataset.division;

      if (isNaN(divisionIndex))
      {
        divisionIndex = -1;
      }

      if (isChild)
      {
        var parentId = $taskTr.attr('data-parent');

        $parentTr = this.$('.is-parent[data-id="' + parentId + '"]');
        $childTrs = this.$('.is-child[data-parent="' + parentId + '"]');
      }

      var taskCompanyTotalSuffix = this.recalcTaskCompanyTotals(companyIndex, divisionIndex, $taskTr);

      if (isChild)
      {
        this.recalcParentTotals(taskCompanyTotalSuffix, functionIndex, $parentTr, $childTrs);
      }

      if (this.withDivisions)
      {
        this.recalcDivisionTotals(functionIndex, companyIndex);
      }

      this.recalcCompanyTotals(functionIndex, companyIndex);
      this.recalcFunctionTotals(functionIndex);
      this.recountShortage();
    },

    recalcTaskCompanyTotals: function(companyIndex, divisionIndex, $taskTr)
    {
      var taskCompanyTotal = 0;
      var taskCompanyTotalSuffix = '[data-company="' + companyIndex + '"]';

      if (divisionIndex !== -1)
      {
        taskCompanyTotalSuffix += '[data-division="' + divisionIndex + '"]';
      }

      $taskTr.find('.fte-leaderEntry-count' + taskCompanyTotalSuffix).each(function()
      {
        taskCompanyTotal += fractionsUtil.parse(this.value);
      });

      $taskTr
        .find('.fte-leaderEntry-total-company-task' + taskCompanyTotalSuffix)
        .text(fractionsUtil.round(taskCompanyTotal));

      return taskCompanyTotalSuffix;
    },

    recalcParentTotals: function(taskCompanyTotalSuffix, functionIndex, $parentTr, $childTrs)
    {
      taskCompanyTotalSuffix = taskCompanyTotalSuffix.replace(/\[data-division="[0-9]+"\]/, '');

      var countElSuffix = taskCompanyTotalSuffix + '[data-function="' + functionIndex + '"]';
      var countElsSelector = '.fte-leaderEntry-count' + countElSuffix + ', '
        + '.fte-leaderEntry-parent-count' + countElSuffix;
      var $parentTotalCounts = $parentTr.find('.fte-leaderEntry-parent-count' + countElSuffix);
      var divisionCount = $parentTotalCounts.length;
      var totals = [];

      $parentTotalCounts.each(function() { totals.push(0); });

      $childTrs.find(countElsSelector).each(function()
      {
        if (this.dataset.absence !== undefined)
        {
          return;
        }

        var count = fractionsUtil.parse(this.tagName === 'TD' ? this.textContent : this.value);

        if (this.dataset.division === undefined)
        {
          count /= divisionCount;

          for (var i = 0; i < divisionCount; ++i)
          {
            totals[i] += count;
          }
        }
        else
        {
          totals[this.dataset.division] += count;
        }
      });

      totals.forEach(function(totalCount, i)
      {
        $parentTotalCounts[i].textContent = fractionsUtil.round(totalCount);
        totals[i] = 0;
      });

      $parentTr.find('.fte-leaderEntry-parent-count' + taskCompanyTotalSuffix).each(function()
      {
        var count = fractionsUtil.parse(this.textContent);

        if (this.dataset.division === undefined)
        {
          count /= divisionCount;

          for (var i = 0; i < divisionCount; ++i)
          {
            totals[i] += count;
          }
        }
        else
        {
          totals[this.dataset.division] += count;
        }
      });

      $parentTotalCounts = $parentTr.find('.fte-leaderEntry-total-company-task' + taskCompanyTotalSuffix);

      totals.forEach(function(totalCount, i)
      {
        $parentTotalCounts[i].textContent = fractionsUtil.round(totalCount);
      });

      if ($parentTr.attr('data-level') === '0')
      {
        return;
      }

      var parentId = $parentTr.attr('data-parent');

      $parentTr = this.$('.is-parent[data-id="' + parentId + '"]');
      $childTrs = this.$('.is-child[data-parent="' + parentId + '"]');

      this.recalcParentTotals(taskCompanyTotalSuffix, functionIndex, $parentTr, $childTrs);
    },

    recalcDivisionTotals: function(functionIndex, companyIndex)
    {
      var view = this;
      var fteDiv = this.model.get('fteDiv');
      var funcCompSuffix = '[data-function="' + functionIndex + '"][data-company="' + companyIndex + '"]';
      var funcCompDivTotals = {};

      fteDiv.forEach(function(divisionId)
      {
        funcCompDivTotals[divisionId] = 0;
      });

      this.$('.fte-leaderEntry-parent-count[data-level="0"]' + funcCompSuffix).each(function()
      {
        var count = fractionsUtil.parse(this.textContent);

        if (this.dataset.division === undefined)
        {
          count /= fteDiv.length;

          fteDiv.forEach(function(divisionId)
          {
            funcCompDivTotals[divisionId] += count;
          });
        }
        else
        {
          funcCompDivTotals[fteDiv[this.dataset.division]] += count;
        }
      });

      this.$('.is-single .fte-leaderEntry-count' + funcCompSuffix).each(function()
      {
        var count = fractionsUtil.parse(this.value);

        if (this.dataset.division === undefined)
        {
          count /= fteDiv.length;

          fteDiv.forEach(function(divisionId)
          {
            funcCompDivTotals[divisionId] += count;
          });
        }
        else
        {
          funcCompDivTotals[fteDiv[this.dataset.division]] += count;
        }
      });

      fteDiv.forEach(function(divisionId, divisionIndex)
      {
        var column = functionIndex + ':' + companyIndex + ':' + divisionIndex;
        var selector = '.fte-leaderEntry-total-prodFunction-division[data-column="' + column + '"]';

        view.$(selector).text(fractionsUtil.round(funcCompDivTotals[divisionId]));
      });

      var compDivTotals = {};

      $(this.theadEl).find('.fte-leaderEntry-total-prodFunction-division').each(function()
      {
        var column = this.dataset.company + ':' + this.dataset.division;

        if (compDivTotals[column] === undefined)
        {
          compDivTotals[column] = 0;
        }

        compDivTotals[column] += fractionsUtil.parse(this.textContent);
      });

      Object.keys(compDivTotals).forEach(function(column)
      {
        view.$('.fte-leaderEntry-total-division[data-column="' + column + '"]').text(
          fractionsUtil.round(compDivTotals[column])
        );
      });
    },

    recalcCompanyTotals: function(functionIndex, companyIndex)
    {
      var funcCompTotal = 0;
      var funcCompColumn = functionIndex + ':' + companyIndex;
      var $thead = this.$(this.theadEl);
      var suffix;

      if (this.withDivisions)
      {
        suffix = '[data-column^="' + funcCompColumn + '"]';

        $thead.find('.fte-leaderEntry-total-prodFunction-division' + suffix).each(function()
        {
          funcCompTotal += fractionsUtil.parse(this.textContent);
        });
      }
      else
      {
        suffix = '[data-function="' + functionIndex + '"][data-company="' + companyIndex + '"]';

        this.$('.fte-leaderEntry-count' + suffix).each(function()
        {
          funcCompTotal += fractionsUtil.parse(this.value);
        });
      }

      this.$('.fte-leaderEntry-total-prodFunction-company[data-column="' + funcCompColumn + '"]').text(
        fractionsUtil.round(funcCompTotal)
      );

      var compTotal = 0;

      $thead.find('.fte-leaderEntry-total-prodFunction-company[data-company="' + companyIndex + '"]').each(function()
      {
        compTotal += fractionsUtil.parse(this.textContent);
      });

      this.$('.fte-leaderEntry-total-company[data-company="' + companyIndex + '"]').text(
        fractionsUtil.round(compTotal)
      );
    },

    recalcFunctionTotals: function(functionIndex)
    {
      var funcTotal = 0;
      var $thead = this.$(this.theadEl);

      $thead.find('.fte-leaderEntry-total-prodFunction-company[data-function="' + functionIndex + '"]').each(function()
      {
        funcTotal += fractionsUtil.parse(this.textContent);
      });

      this.$('.fte-leaderEntry-total-prodFunction[data-column="' + functionIndex + '"]').text(
        fractionsUtil.round(funcTotal)
      );

      var total = 0;

      $thead.find('.fte-leaderEntry-total-prodFunction').each(function()
      {
        total += fractionsUtil.parse(this.textContent);
      });

      this.$('.fte-leaderEntry-total').text(fractionsUtil.round(total));
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
        case 'count':
          return this.handleCountChange(message.action);

        case 'comment':
          return this.handleCommentChange(message.action);

        case 'edit':
          return this.render();
      }
    },

    handleCountChange: function(message)
    {
      var selector = '.fte-leaderEntry-count'
        + '[data-company=' + message.companyIndex + ']'
        + '[data-task=' + message.taskIndex + ']';

      if (this.withFunctions)
      {
        selector += '[data-function="' + message.functionIndex + '"]';
      }

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

      this.recount($count[0], message.taskIndex, message.functionIndex, message.companyIndex);
    },

    handleCommentChange: function(message)
    {
      var $textarea = this.$('textarea.fte-leaderEntry-comment[data-task="' + message.taskIndex + '"]');

      if (!$textarea.length)
      {
        return;
      }

      $textarea.val(message.comment);

      var $commentTr = $textarea.closest('tr');
      var $taskTr = $commentTr.prev();
      var $commentBtnIcon = $taskTr.find('.fte-leaderEntry-toggleComment > .fa');

      if ($textarea.comment)
      {
        $commentTr.addClass('hidden');
        $taskTr.removeClass('has-visible-comment').addClass('has-invisible-comment');
        $commentBtnIcon.removeClass('fa-comment-o').addClass('fa-comment');
      }
      else
      {
        $commentTr.removeClass('hidden');
        $taskTr.removeClass('has-invisible-comment').addClass('has-visible-comment');
        $commentBtnIcon.removeClass('fa-comment').addClass('fa-comment-o');
      }
    },

    onModelDeleted: function(message)
    {
      onModelDeleted(this.broker, this.model, message);
    },

    showFocusInfoBar: function(inputEl)
    {
      if (this.timers.hideFocusInfoBar !== null)
      {
        clearTimeout(this.timers.hideFocusInfoBar);
        this.timers.hideFocusInfoBar = null;
      }

      if (inputEl.dataset.kind === 'demand')
      {
        return this.hideFocusInfoBar();
      }

      var rowEl = inputEl.parentNode.parentNode;

      if (inputEl.classList.contains('fte-leaderEntry-comment'))
      {
        rowEl = rowEl.previousElementSibling;
      }

      var task = rowEl.children[0].textContent;

      if (rowEl.classList.contains('is-child'))
      {
        var parentEl = rowEl;
        var level = +parentEl.dataset.level;

        while (parentEl && level)
        {
          parentEl = parentEl.previousElementSibling.previousElementSibling;

          var newLevel = +parentEl.dataset.level;

          if (newLevel < level)
          {
            level = newLevel;
            task = parentEl.children[0].textContent + ' \\ ' + task;
          }
        }
      }

      var functionIndex = inputEl.dataset.function;
      var companyIndex = inputEl.dataset.company;
      var divisionIndex = inputEl.dataset.division;
      var funcCompColumn = functionIndex + ':' + companyIndex;
      var prodFunctionSelector = functionIndex === undefined
        ? null
        : '.fte-leaderEntry-column-prodFunction[data-column="' + functionIndex + '"]';
      var companySelector = companyIndex === undefined
        ? null
        : '.fte-leaderEntry-column-company[data-column="' + funcCompColumn + '"]';
      var divisionSelector = divisionIndex === undefined
        ? null
        : '.fte-leaderEntry-column-division[data-column="' + funcCompColumn + ':' + divisionIndex + '"]';

      this.$focusInfoBar.html(focusInfoBarTemplate({
        prodTask: task,
        prodFunction: prodFunctionSelector ? this.theadEl.querySelector(prodFunctionSelector).textContent : null,
        company: companySelector ? this.theadEl.querySelector(companySelector).textContent : null,
        division: divisionSelector ? this.theadEl.querySelector(divisionSelector).textContent : null
      }));

      $('body').addClass('is-with-fte-focusInfoBar');

      this.$focusInfoBar.fadeIn('fast');
    },

    hideFocusInfoBar: function()
    {
      var view = this;

      this.timers.hideFocusInfoBar = setTimeout(function()
      {
        if (!view.timers)
        {
          return;
        }

        view.timers.hideFocusInfoBar = null;

        view.$focusInfoBar.fadeOut('fast', function()
        {
          $('body').removeClass('is-with-fte-focusInfoBar');
        });
      }, 1);
    },

    updateComment: function(commentEl)
    {
      var taskIndex = parseInt(commentEl.dataset.task, 10);
      var timerKey = 'updateComment' + taskIndex;

      if (this.timers[timerKey])
      {
        clearTimeout(this.timers[timerKey]);
      }

      this.timers[timerKey] = setTimeout(this.doUpdateComment.bind(this), 5000, commentEl);
    },

    doUpdateComment: function(commentEl)
    {
      var taskIndex = parseInt(commentEl.dataset.task, 10);
      var timerKey = 'updateComment' + taskIndex;

      if (this.timers[timerKey])
      {
        clearTimeout(this.timers[timerKey]);
        delete this.timers[timerKey];
      }

      this.socket.emit('fte.leader.updateComment', {
        type: 'comment',
        socketId: this.socket.getId(),
        _id: this.model.id,
        taskIndex: taskIndex,
        comment: commentEl.value
      });
    }

  });
});
