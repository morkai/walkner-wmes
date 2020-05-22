// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/planning/util/shift',
  'app/wh-lines/templates/editStartedPlan',
  'i18n!app/nls/wh-lines'
], function(
  time,
  viewport,
  View,
  shiftUtil,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click #-setNextShift': function()
      {
        this.$id('newValue').val(shiftUtil.getPlanDate(this.model.get('nextShiftAt'), false).format('YYYY-MM-DD'));
      },

      'change #-newValue': function()
      {
        this.newValue = this.$id('newValue').val();
      },

      'submit': function()
      {
        var view = this;

        viewport.msg.saving();

        var $submit = view.$id('submit').prop('disabled', true);

        var req = view.ajax({
          method: 'POST',
          url: '/old/wh;act',
          data: JSON.stringify({
            action: 'editStartedPlan',
            data: {
              line: view.model.id,
              newValue: view.$id('newValue').val()
            }
          })
        });

        req.fail(function()
        {
          var error = req.responseJSON && req.responseJSON.error || null;

          if (error && view.t.has('editStartedPlan:error:' + error.code))
          {
            viewport.msg.saved();
            viewport.msg.show({
              type: 'error',
              time: 5000,
              text: view.t('editStartedPlan:error:' + error.code, error)
            });
          }
          else
          {
            viewport.msg.savingFailed();
          }

          $submit.prop('disabled', false);
        });

        req.done(function()
        {
          viewport.msg.saved();
          viewport.closeDialog();
        });

        return false;
      }

    },

    initialize: function()
    {
      this.listenTo(this.model, 'change:startedPlan change:nextShiftAt', this.render);
    },

    getTemplateData: function()
    {
      var currentDate = shiftUtil.getPlanDate(Date.now(), true);
      var curValue = time.utc.getMoment(this.model.get('startedPlan'));

      if (curValue.isBefore(currentDate))
      {
        curValue = currentDate;
      }

      return {
        line: this.model.toJSON(),
        nextShiftAt: this.model.serializeNextShiftAt(),
        minValue: currentDate.format('YYYY-MM-DD'),
        curValue: this.newValue || curValue.format('YYYY-MM-DD'),
        maxValue: currentDate.endOf('week').add(7, 'days').format('YYYY-MM-DD')
      };
    }

  });
});
