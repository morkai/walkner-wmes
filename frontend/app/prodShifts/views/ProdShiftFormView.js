// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/data/prodLines',
  'app/users/util/setUpUserSelect2',
  'app/prodChangeRequests/util/isChangeRequest',
  'app/prodShifts/templates/form'
], function(
  _,
  t,
  user,
  time,
  viewport,
  FormView,
  idAndLabel,
  prodLines,
  setUpUserSelect2,
  isChangeRequest,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    serialize: function()
    {
      return _.assign(FormView.prototype.serialize.call(this), {
        isChangeRequest: isChangeRequest()
      });
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.setUpProdLineField();
      this.setUpUserSelect2('master');
      this.setUpUserSelect2('leader');
      this.setUpUserSelect2('operators', true);

      if (this.options.editMode)
      {
        this.$id('date').attr('disabled', true);
        this.$('input[name="shift"]').attr('disabled', true);
      }
    },

    setUpProdLineField: function()
    {
      if (this.options.editMode)
      {
        this.$id('prodLine').addClass('form-control').attr('disabled', true);
      }
      else
      {
        this.$id('prodLine').select2({
          data: prodLines.map(idAndLabel)
        });
      }
    },

    setUpUserSelect2: function(personnelProperty, multiple)
    {
      var $user = setUpUserSelect2(this.$id(personnelProperty), {
        multiple: !!multiple
      });

      var userInfo = this.model.get(personnelProperty);

      if (Array.isArray(userInfo))
      {
        $user.select2('data', userInfo.map(function(u)
        {
          return {
            id: u.id,
            text: u.label
          };
        }));
      }
      else if (userInfo && userInfo.id && userInfo.label)
      {
        $user.select2('data', {
          id: userInfo.id,
          text: userInfo.label
        });
      }
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.date = time.format(formData.date, 'YYYY-MM-DD');
      formData.requestComment = '';

      return formData;
    },

    serializeForm: function(formData)
    {
      if (!this.options.editMode)
      {
        formData.shift = parseInt(formData.shift, 10);
      }

      formData.master = this.serializeUserInfo('master');
      formData.leader = this.serializeUserInfo('leader');
      formData.operators = this.serializeUserInfo('operators');
      formData.operator = formData.operators.length ? formData.operators[0] : null;
      formData.quantitiesDone = formData.quantitiesDone.map(function(quantityDone)
      {
        return {
          planned: parseInt(quantityDone.planned, 10),
          actual: parseInt(quantityDone.actual, 10)
        };
      });

      return formData;
    },

    serializeUserInfo: function(personnelProperty)
    {
      var userInfo = this.$id(personnelProperty).select2('data');

      if (Array.isArray(userInfo))
      {
        return userInfo.map(function(u)
        {
          return {
            id: u.id,
            label: u.text
          };
        });
      }

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
      if (!isChangeRequest())
      {
        return FormView.prototype.handleSuccess.apply(this, arguments);
      }

      if (this.options.editMode)
      {
        this.broker.subscribe('router.executing').setLimit(1).on('message', function()
        {
          viewport.msg.show({
            type: 'success',
            time: 5000,
            text: t('prodShifts', 'changeRequest:msg:success:edit')
          });
        });

        return FormView.prototype.handleSuccess.apply(this, arguments);
      }

      window.scrollTo(0, 0);

      this.model.set(_.result(this.model, 'defaults'));
      this.render();

      this.hideErrorMessage();

      this.$errorMessage = viewport.msg.show({
        type: 'success',
        time: 2500,
        text: t('prodShifts', 'changeRequest:msg:success:add')
      });
    },

    handleFailure: function(xhr)
    {
      var json = xhr.responseJSON;

      if (json && json.error && t.has('prodShifts', 'FORM:ERROR:' + json.error.message))
      {
        this.showErrorMessage(t('prodShifts', 'FORM:ERROR:' + json.error.message));
      }
      else if (isChangeRequest())
      {
        this.showErrorMessage(t(
          'prodShifts',
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
