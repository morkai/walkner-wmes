// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/data/downtimeReasons',
  'app/data/aors',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/prodDowntimes/templates/form'
], function(
  _,
  t,
  time,
  viewport,
  downtimeReasons,
  aors,
  FormView,
  setUpUserSelect2,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    events: _.extend({}, FormView.prototype.events, {
      'select2-removed #-reason, #-aor': function()
      {
        this.$id('reason').val('');
        this.$id('aor').val('');

        this.timers.clearSelect2 = setTimeout(function(view)
        {
          view.setUpReasonSelect2();
          view.setUpAorSelect2();
          view.$id('reason').select2('focus');
        }, 1, this);
      },
      'change #-reason': function()
      {
        this.setUpAorSelect2();
      },
      'change #-aor': function()
      {
        this.setUpReasonSelect2();
      }
    }),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.reasonsToAorsMap = {};
      this.reasonsList = [];
      this.aorsList = {};
    },

    destroy: function()
    {
      FormView.prototype.destroy.call(this);

      this.reasonsToAorsMap = null;
      this.reasonsList = null;
      this.aorsList = null;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.setUpReasons();
      this.setUpAors();
      this.setUpUserSelect2('master');
      this.setUpUserSelect2('leader');
      this.setUpUserSelect2('operator');
      this.setUpReasonSelect2();
      this.setUpAorSelect2();

      if (this.model.get('status') === 'undecided')
      {
        this.$('input[name=status]').attr('disabled', true);
        this.$id('decisionComment').attr('disabled', true);
      }

      this.$id('master').select2('focus');
    },

    setUpUserSelect2: function(personnelProperty)
    {
      var $user = setUpUserSelect2(this.$id(personnelProperty));

      var userInfo = this.model.get(personnelProperty);

      if (userInfo && userInfo.id && userInfo.label)
      {
        $user.select2('data', {
          id: userInfo.id,
          text: userInfo.label
        });
      }
    },

    setUpReasonSelect2: function()
    {
      var $reason = this.$id('reason');
      var data = this.getReasonsForAor(this.$id('aor').val());

      $reason.select2({
        allowClear: true,
        placeholder: ' ',
        data: data
      });

      if ($reason.select2('data') === null)
      {
        $reason.select2('val', data.length === 1 ? data[0].id : '');
      }
    },

    setUpAorSelect2: function()
    {
      var $aor = this.$id('aor');
      var data = this.getAorsForReason(this.$id('reason').val());

      $aor.select2({
        allowClear: true,
        placeholder: ' ',
        data: data
      });

      if ($aor.select2('data') === null)
      {
        $aor.select2('val', data.length === 1 ? data[0].id : '');
      }
    },

    showErrorMessage: function(message)
    {
      this.$errorMessage = viewport.msg.show({
        type: 'error',
        text: t('prodShiftOrders', 'FORM:ERROR:' + message)
      });

      return false;
    },

    checkValidity: function(formData)
    {
      if (formData.finishedAt <= formData.startedAt)
      {
        return this.showErrorMessage('times');
      }

      return this.checkTimeValidity(formData, 'startedAt')
        && this.checkTimeValidity(formData, 'finishedAt');
    },

    checkTimeValidity: function(formData, timeProperty)
    {
      var time = formData[timeProperty].getTime();
      var shiftStartTime = Date.parse(this.model.get('date'));
      var shiftEndTime = shiftStartTime + 8 * 3600 * 1000;

      if (time === shiftEndTime)
      {
        time -= 1;
      }

      if (time < shiftStartTime || time >= shiftEndTime)
      {
        return this.showErrorMessage(timeProperty);
      }

      return true;
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.startedAtDate = time.format(formData.startedAt, 'YYYY-MM-DD');
      formData.startedAtTime = time.format(formData.startedAt, 'HH:mm:ss');
      formData.finishedAtDate = time.format(formData.finishedAt, 'YYYY-MM-DD');
      formData.finishedAtTime = time.format(formData.finishedAt, 'HH:mm:ss');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.master = this.serializeUserInfo('master');
      formData.leader = this.serializeUserInfo('leader');
      formData.operator = this.serializeUserInfo('operator');
      formData.operators = formData.operator ? [formData.operator] : [];
      formData.startedAt =
        time.getMoment(formData.startedAtDate + ' ' + formData.startedAtTime).toDate();
      formData.finishedAt =
        time.getMoment(formData.finishedAtDate + ' ' + formData.finishedAtTime).toDate();

      delete formData.startedAtDate;
      delete formData.startedAtTime;
      delete formData.finishedAtDate;
      delete formData.finishedAtTime;

      return formData;
    },

    serializeUserInfo: function(personnelProperty)
    {
      var userInfo = this.$id(personnelProperty).select2('data');

      if (userInfo === null)
      {
        return null;
      }

      return {
        id: userInfo.id,
        label: userInfo.text
      };
    },

    handleFailure: function(xhr)
    {
      if (xhr.responseJSON
        && xhr.responseJSON.error
        && t.has('prodDowntimes', 'FORM:ERROR:' + xhr.responseJSON.error.message))
      {
        this.showErrorMessage(xhr.responseJSON.error.message);
      }
      else
      {
        FormView.prototype.handleFailure.apply(this, arguments);
      }
    },

    getReasonsForAor: function(aor)
    {
      if (!aor)
      {
        return this.reasonsList;
      }

      var reasonsForAor = [];

      for (var i = 0; i < this.reasonsList.length; ++i)
      {
        var reason = this.reasonsList[i];

        if (!reason.aors || reason.aors[aor])
        {
          reasonsForAor.push(reason);
        }
      }

      return reasonsForAor;
    },

    getAorsForReason: function(reason)
    {
      if (!reason)
      {
        return this.aorsList;
      }

      var aorsMap = this.reasonsToAorsMap[reason];

      if (aorsMap === undefined)
      {
        return [];
      }

      if (aorsMap === null)
      {
        return this.aorsList;
      }

      var reasonAors = [];

      _.forEach(Object.keys(aorsMap), function(aorId)
      {
        reasonAors.push({
          id: aorId,
          text: aors.get(aorId).get('name')
        });
      });

      return reasonAors;
    },

    setUpReasons: function()
    {
      var reasonsToAorsMap = {};
      var reasonsList = [];

     downtimeReasons.forEach(function(reason)
      {
        var reasonAors = {};
        var hasAnyAors = false;

        _.forEach(reason.get('aors'), function(aor)
        {
          reasonAors[aor] = true;
          hasAnyAors = true;
        });

        if (!hasAnyAors)
        {
          reasonAors = null;
        }

        reasonsToAorsMap[reason.id] = reasonAors;
        reasonsList.push({
          id: reason.id,
          text: reason.id + ' - ' + reason.get('label'),
          aors: reasonAors
        });
      });

      this.reasonsToAorsMap = reasonsToAorsMap;
      this.reasonsList = reasonsList;
    },

    setUpAors: function()
    {
      var aorsList = [];

      aors.forEach(function(aor)
      {
        aorsList.push({
          id: aor.id,
          text: aor.get('name')
        });
      });

      this.aorsList = aorsList;
    }

  });
});
