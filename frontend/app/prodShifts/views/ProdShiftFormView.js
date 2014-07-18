// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/data/prodLines',
  'app/users/util/setUpUserSelect2',
  'app/prodShifts/templates/form'
], function(
  t,
  time,
  viewport,
  FormView,
  prodLines,
  setUpUserSelect2,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.setUpProdLineField();
      this.setUpUserSelect2('master');
      this.setUpUserSelect2('leader');
      this.setUpUserSelect2('operator');

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
          data: prodLines.map(function(prodLine)
          {
            return {
              id: prodLine.id,
              text: prodLine.getLabel()
            };
          })
        });
      }
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

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.date = time.format(formData.date, 'YYYY-MM-DD');

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
      formData.operator = this.serializeUserInfo('operator');
      formData.operators = formData.operator ? [formData.operator] : [];
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
        && t.has('prodShifts', 'FORM:ERROR:' + xhr.responseJSON.error.message))
      {
        this.$errorMessage = viewport.msg.show({
          type: 'warning',
          time: 5000,
          text: t('prodShifts', 'FORM:ERROR:' + xhr.responseJSON.error.message)
        });
      }
      else
      {
        FormView.prototype.handleFailure.apply(this, arguments);
      }
    }

  });
});
