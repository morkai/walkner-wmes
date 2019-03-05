// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/time',
  'app/viewport',
  'app/data/downtimeReasons',
  'app/data/aors',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/prodChangeRequests/util/isChangeRequest',
  '../util/reasonAndAor',
  'app/prodDowntimes/templates/form'
], function(
  _,
  t,
  user,
  time,
  viewport,
  downtimeReasons,
  aors,
  FormView,
  setUpUserSelect2,
  isChangeRequest,
  reasonAndAor,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    events: _.assign({
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
    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);
      reasonAndAor.initialize(this);
    },

    destroy: function()
    {
      FormView.prototype.destroy.call(this);
      reasonAndAor.destroy(this);
    },

    serialize: function()
    {
      return _.assign(FormView.prototype.serialize.call(this), {
        isChangeRequest: isChangeRequest()
      });
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (!this.options.editMode)
      {
        reasonAndAor.setUpReasons(this);
        reasonAndAor.setUpAors(this);
        this.setUpReasonSelect2();
        this.setUpAorSelect2();
      }

      this.setUpUserSelect2('master');
      this.setUpUserSelect2('leader');
      this.setUpUserSelect2('operator');

      if (!this.options.editMode && this.model.get('status') === 'undecided')
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
      reasonAndAor.setUpReasonSelect2(this, this.$id('aor').val(), {
        allowClear: true,
        placeholder: ' '
      });
    },

    setUpAorSelect2: function()
    {
      reasonAndAor.setUpAorSelect2(this, this.$id('reason').val(), {
        allowClear: true,
        placeholder: ' '
      });
    },

    showErrorMessage: function(message)
    {
      if (t.has('prodDowntimes', 'FORM:ERROR:' + message))
      {
        message = t('prodDowntimes', 'FORM:ERROR:' + message);
      }

      return FormView.prototype.showErrorMessage.call(this, message);
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
      formData.requestComment = '';

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.master = this.serializeUserInfo('master');
      formData.leader = this.serializeUserInfo('leader');
      formData.operator = this.serializeUserInfo('operator');
      formData.operators = formData.operator ? [formData.operator] : [];
      formData.startedAt = time.getMoment(formData.startedAtDate + ' ' + formData.startedAtTime).toDate();
      formData.finishedAt = time.getMoment(formData.finishedAtDate + ' ' + formData.finishedAtTime).toDate();
      formData.reasonComment = _.isEmpty(formData.reasonComment) ? '' : formData.reasonComment;
      formData.decisionComment = _.isEmpty(formData.decisionComment) ? '' : formData.decisionComment;

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

    handleSuccess: function()
    {
      if (isChangeRequest())
      {
        if (this.options.editMode)
        {
          return this.handleEditSuccess();
        }

        viewport.msg.show({
          type: 'success',
          time: 2500,
          text: t('prodDowntimes', 'changeRequest:msg:success:add')
        });
      }

      FormView.prototype.handleSuccess.apply(this, arguments);
    },

    handleEditSuccess: function()
    {
      this.model.set(this.model.previousAttributes());

      if (viewport.currentDialog === this)
      {
        showMessage();
      }
      else
      {
        this.broker.subscribe('router.executing').setLimit(1).on('message', showMessage);
      }

      return FormView.prototype.handleSuccess.apply(this, arguments);

      function showMessage()
      {
        viewport.msg.show({
          type: 'success',
          time: 5000,
          text: t('prodDowntimes', 'changeRequest:msg:success:edit')
        });
      }
    },

    handleFailure: function(xhr)
    {
      var json = xhr.responseJSON;

      if (json && json.error && t.has('prodDowntimes', 'FORM:ERROR:' + json.error.message))
      {
        this.showErrorMessage(json.error.message);
      }
      else if (isChangeRequest())
      {
        this.showErrorMessage(t(
          'prodShiftOrders',
          'changeRequest:msg:failure:' + (this.options.editMode ? 'edit' : 'add')
        ));
      }
      else
      {
        FormView.prototype.handleFailure.apply(this, arguments);
      }
    }

  });
});
