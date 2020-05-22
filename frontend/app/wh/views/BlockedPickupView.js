// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/planning/util/shift',
  'app/wh/templates/pickup/blockedPickup'
], function(
  _,
  time,
  viewport,
  View,
  shiftUtil,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'wh-blockedPickup-dialog',

    nlsDomain: 'wh',

    events: {
      'click h3[data-action="toggleLines"]': function(e)
      {
        var $h3 = this.$(e.currentTarget);
        var $table = $h3.next();

        $table.toggleClass('hidden');

        $table.find('.highlight').removeClass('highlight highlight-success');

        $h3
          .find('.fa')
          .removeClass('fa-chevron-down fa-chevron-right')
          .addClass($table.hasClass('hidden') ? 'fa-chevron-right' : 'fa-chevron-down');

        if (viewport.$dialog)
        {
          viewport.$dialog.modal('adjustBackdrop');
        }
      },
      'click td[data-action="setStartTime"]': function(e)
      {
        var $tr = this.$(e.currentTarget).closest('tr');
        var lineId = $tr[0].dataset.id;
        var ignoredLine = this.model.ignoredLines.find(function(l) { return l._id === lineId; });

        this.setStartedPlan($tr, ignoredLine.startTime);
      },
      'click td[data-action="setNextShift"]': function(e)
      {
        var $tr = this.$(e.currentTarget).closest('tr');
        var lineId = $tr[0].dataset.id;
        var whLine = this.model.whLines.get(lineId);

        this.setStartedPlan($tr, whLine.get('nextShiftAt'));
      },
      'submit form': function(e)
      {
        var view = this;
        var $form = view.$(e.currentTarget);
        var lineId = $form.closest('tr')[0].dataset.id;
        var $value = $form.find('.form-control');
        var oldValue = time.utc.format(view.model.whLines.get(lineId).get('startedPlan'), 'YYYY-MM-DD');
        var newValue = $value.val();

        if (newValue === oldValue)
        {
          return false;
        }

        var $submit = $form.find('.btn');

        $value.prop('disabled', true).removeClass('highlight highlight-success');
        $submit.prop('disabled', true).find('.fa').removeClass('fa-save').addClass('fa-spinner fa-spin');

        var req = view.ajax({
          method: 'POST',
          url: '/old/wh;act',
          data: JSON.stringify({
            action: 'editStartedPlan',
            data: {
              line: lineId,
              newValue: newValue,
              whUser: view.model.whUser
            }
          })
        });

        req.fail(function()
        {
          var error = req.responseJSON && req.responseJSON.error || null;

          if (!error || !view.t.has('blockedPickup:error:' + error.code))
          {
            error = {code: 'generic'};
          }

          viewport.msg.show({
            type: 'error',
            time: 5000,
            text: view.t('blockedPickup:error:' + error.code, error)
          });
        });

        req.done(function()
        {
          view.timers.highlight = setTimeout(function() { $value.addClass('highlight highlight-success'); }, 1);
        });

        req.always(function()
        {
          $value.prop('disabled', false);
          $submit
            .prop('disabled', false)
            .find('.fa')
            .removeClass('fa-spinner fa-spin')
            .addClass('fa-save');
        });

        return false;
      }
    },

    initialize: function()
    {
      this.once('afterRender', function()
      {
        this.listenTo(
          this.model.whLines,
          'change:startedPlan change:nextShiftAt change:pickup change:components',
          this.updateLine
        );
      });
    },

    getTemplateData: function()
    {
      var view = this;
      var currentDate = shiftUtil.getPlanDate(Date.now(), true);
      var ignoredIds = {};
      var ignoredLines = [];
      var remainingLines = [];

      view.model.ignoredLines.forEach(function(ignoredLine)
      {
        var whLine = view.model.whLines.get(ignoredLine._id);

        if (!whLine)
        {
          return;
        }

        ignoredIds[whLine.id] = true;

        ignoredLine.mrps.sort(function(a, b)
        {
          return a.localeCompare(b, undefined, {numeric: true, ignorePunctuation: true});
        });

        ignoredLines.push({
          _id: whLine.id,
          mrps: ignoredLine.mrps.join(', '),
          completed: time.toString(whLine.get('pickup').time / 1000, true, false),
          delivered: time.toString(whLine.get('components').time / 1000, true, false),
          nextShift: whLine.serializeNextShiftAt(),
          startTime: time.utc.format(ignoredLine.startTime, 'L, HH:mm:ss'),
          startedPlan: time.utc.format(whLine.get('startedPlan'), 'YYYY-MM-DD')
        });
      });

      view.model.whLines.forEach(function(whLine)
      {
        if (ignoredIds[whLine.id])
        {
          return;
        }

        remainingLines.push({
          _id: whLine.id,
          completed: time.toString(whLine.get('pickup').time / 1000, true, false),
          delivered: time.toString(whLine.get('components').time / 1000, true, false),
          nextShift: whLine.serializeNextShiftAt(),
          startedPlan: time.utc.format(whLine.get('startedPlan'), 'YYYY-MM-DD')
        });
      });

      view.sortLines(ignoredLines);
      view.sortLines(remainingLines);

      return {
        minValue: currentDate.format('YYYY-MM-DD'),
        maxValue: currentDate.endOf('week').add(7, 'days').format('YYYY-MM-DD'),
        unpaintedLines: view.model.unpaintedLines,
        ignoredLines: ignoredLines,
        remainingLines: remainingLines
      };
    },

    afterRender: function()
    {
      console.log(this.model);
    },

    sortLines: function(lines)
    {
      lines.sort(function(a, b)
      {
        var cmp = !a.mrps ? 0 : a.mrps.localeCompare(b.mrps, undefined, {numeric: true, ignorePunctuation: true});

        if (!cmp)
        {
          cmp = a._id.localeCompare(b._id, undefined, {numeric: true, ignorePunctuation: true});
        }

        return cmp;
      });
    },

    updateLine: function(whLine)
    {
      var $row = this.$('tr[data-id="' + _.escape(whLine.id) + '"]');

      if (!$row.length)
      {
        return;
      }

      $row.find('[data-prop="completed"]').text(time.toString(whLine.get('pickup').time / 1000, true, false));
      $row.find('[data-prop="delivered"]').text(time.toString(whLine.get('components').time / 1000, true, false));
      $row.find('[data-prop="nextShift"]').text(whLine.serializeNextShiftAt());
      $row.find('.form-control').val(time.utc.format(whLine.get('startedPlan'), 'YYYY-MM-DD'));
    },

    setStartedPlan: function($tr, value)
    {
      var $value = $tr.find('.form-control');

      if ($value.prop('disabled'))
      {
        return;
      }

      var startedPlan = shiftUtil.getPlanDate(value, false);

      if (!startedPlan.isValid())
      {
        return;
      }

      $value.val(startedPlan.format('YYYY-MM-DD')).removeClass('highlight highlight-success');

      this.timers.highlight = setTimeout(function() { $value.addClass('highlight'); }, 1);
    }

  });
});
