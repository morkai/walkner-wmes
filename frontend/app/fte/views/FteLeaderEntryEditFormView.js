// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/core/View',
  'app/core/util/onModelDeleted',
  'app/fte/templates/leaderEntry',
  'app/fte/templates/focusInfoBar',
  '../util/fractions',
  'jquery.stickytableheaders'
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
        {
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
        }

        this.$(this.focused).addClass('is-focused');

        this.showFocusInfoBar(e.target);
      },
      'blur .fte-leaderEntry-count': function()
      {
        this.$(this.focused).removeClass('is-focused');

        this.hideFocusInfoBar();
      },
      'click .fte-leaderEntry-toggleComment': function(e)
      {
        var $commentBtn = this.$(e.currentTarget);
        var $taskTr = $commentBtn.closest('tr');
        var $commentTr = $taskTr.next();

        $commentTr.toggleClass('hidden');
        $taskTr.toggleClass('has-visible-comment');

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
      this.$('.fte-leaderEntry').stickyTableHeaders('destroy');

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
      return _.extend(this.model.serializeWithTotals(), {
        editable: true,
        round: fractionsUtil.round
      });
    },

    focusNextInput: function($current)
    {
      var $nextCell = $current.closest('td').next('td');

      if ($nextCell.length && !$nextCell.hasClass('fte-leaderEntry-actions'))
      {
        return this.scrollIntoView($nextCell.find('input').select()[0]);
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

      var firstCountEl = this.el.querySelector('.fte-leaderEntry-count');

      firstCountEl.select();

      this.scrollIntoView(firstCountEl);
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
      var oldCount = fractionsUtil.parse(dataset.value) || 0;
      var newCount = fractionsUtil.parse(e.target.value) || 0;

      if (oldCount === newCount)
      {
        return;
      }

      var timerKey = dataset.task + ':' + dataset.function + ':' + dataset.company + ':' + dataset.division;

      if (this.timers[timerKey])
      {
        clearTimeout(this.timers[timerKey]);
      }

      this.timers[timerKey] = setTimeout(this.doUpdateCount.bind(this), 250, e.target, timerKey, oldCount, newCount);
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
        functionIndex: parseInt(dataset.function, 10) || 0,
        companyIndex: parseInt(dataset.company, 10),
        companyIndexServer: parseInt(dataset.companyServer, 10)
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

            view.recount(countEl, data.taskIndex, data.functionIndex, data.companyIndex);

            data.newCount = oldCount;

            view.model.handleUpdateMessage(data, true);
          }

          view.trigger('remoteError', err);
        }
      });

      this.recount(countEl, data.taskIndex, data.functionIndex, data.companyIndex);

      this.model.handleUpdateMessage(data, true);
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

    recountWithFunctions: function(countEl, taskIndex, functionIndex, companyIndex)
    {
      var $taskTr = this.$(countEl).closest('tr');
      var isChild = $taskTr.hasClass('is-child');
      var $parentTr = null;
      var $childTrs = [];
      var divisionIndex = parseInt(countEl.dataset.division, 10);

      if (isNaN(divisionIndex))
      {
        divisionIndex = -1;
      }

      if (isChild)
      {
        $parentTr = $taskTr.prev().prev();

        while ($parentTr.length && $parentTr.hasClass('is-child'))
        {
          $parentTr = $parentTr.prev().prev();
        }

        var $childTr = $parentTr.next().next();

        while ($childTr.length && $childTr.hasClass('is-child'))
        {
          $childTrs.push($childTr);

          $childTr = $childTr.next().next();
        }
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
      var parentFunctionCompanyTotal = 0;
      var childSuffix = taskCompanyTotalSuffix + '[data-function="' + functionIndex + '"]';

      $childTrs.forEach(function($childTr)
      {
        parentFunctionCompanyTotal += fractionsUtil.parse(
          $childTr.find('.fte-leaderEntry-count' + childSuffix).val()
        );
      });

      $parentTr
        .find('.fte-leaderEntry-parent-count' + childSuffix)
        .text(fractionsUtil.round(parentFunctionCompanyTotal));

      var parentCompanyTotal = 0;

      $parentTr.find('.fte-leaderEntry-parent-count' + taskCompanyTotalSuffix).each(function()
      {
        parentCompanyTotal += fractionsUtil.parse(this.innerText);
      });

      $parentTr
        .find('.fte-leaderEntry-total-company-task' + taskCompanyTotalSuffix)
        .text(fractionsUtil.round(parentCompanyTotal));
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

      this.$('.fte-leaderEntry-parent-count' + funcCompSuffix).each(function()
      {
        var count = fractionsUtil.parse(this.innerText);

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

      this.$('is-single .fte-leaderEntry-count' + funcCompSuffix).each(function()
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

        compDivTotals[column] += fractionsUtil.parse(this.innerText);
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
          funcCompTotal += fractionsUtil.parse(this.innerText);
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
        compTotal += fractionsUtil.parse(this.innerText);
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
        funcTotal += fractionsUtil.parse(this.innerText);
      });

      this.$('.fte-leaderEntry-total-prodFunction[data-column="' + functionIndex + '"]').text(
        fractionsUtil.round(funcTotal)
      );

      var total = 0;

      $thead.find('.fte-leaderEntry-total-prodFunction').each(function()
      {
        total += fractionsUtil.parse(this.innerText);
      });

      this.$('.fte-leaderEntry-total').text(fractionsUtil.round(total));
    },

    onRemoteEdit: function(message)
    {
      if (message.socketId === this.socket.getId())
      {
        return;
      }

      if (message.comment !== undefined)
      {
        return this.onRemoteCommentEdit(message);
      }

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

      this.model.handleUpdateMessage(message, true);
    },

    onRemoteCommentEdit: function(message)
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
        $taskTr.removeClass('has-visible-comment');
        $commentBtnIcon.removeClass('fa-comment-o').addClass('fa-comment');
      }
      else
      {
        $commentTr.removeClass('hidden');
        $taskTr.addClass('has-visible-comment');
        $commentBtnIcon.removeClass('fa-comment').addClass('fa-comment-o');
      }

      this.model.handleUpdateMessage(message, true);
    },

    onModelDeleted: function(message)
    {
      onModelDeleted(this.broker, this.model, message);
    },

    showFocusInfoBar: function(countEl)
    {
      if (this.timers.hideFocusInfoBar !== null)
      {
        clearTimeout(this.timers.hideFocusInfoBar);
        this.timers.hideFocusInfoBar = null;
      }

      var rowEl = countEl.parentNode.parentNode;
      var task = rowEl.children[0].innerText;

      if (rowEl.classList.contains('is-child'))
      {
        var parentEl = rowEl.previousElementSibling.previousElementSibling;

        while (parentEl && parentEl.classList.contains('is-child'))
        {
          parentEl = parentEl.previousElementSibling.previousElementSibling;
        }

        task = parentEl.children[0].innerText + ' \\ ' + task.substr(1);
      }

      var functionIndex = countEl.dataset.function;
      var companyIndex = countEl.dataset.company;
      var divisionIndex = countEl.dataset.division;
      var funcCompColumn = functionIndex + ':' + companyIndex;
      var prodFunctionSelector = '.fte-leaderEntry-column-prodFunction[data-column="' + functionIndex + '"]';
      var companySelector = '.fte-leaderEntry-column-company[data-column="' + funcCompColumn + '"]';
      var divisionSelector = divisionIndex === undefined
        ? null
        : '.fte-leaderEntry-column-division[data-column="' + funcCompColumn + ':' + divisionIndex + '"]';

      this.$focusInfoBar.html(focusInfoBarTemplate({
        prodTask: task,
        prodFunction: this.theadEl.querySelector(prodFunctionSelector).innerText,
        company: this.theadEl.querySelector(companySelector).innerText,
        division: divisionSelector ? this.theadEl.querySelector(divisionSelector).innerText : null
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
        socketId: this.socket.getId(),
        _id: this.model.id,
        taskIndex: taskIndex,
        comment: commentEl.value
      });
    }

  });
});
