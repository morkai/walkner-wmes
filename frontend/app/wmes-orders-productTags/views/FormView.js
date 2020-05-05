// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FormView',
  'app/wmes-orders-productTags/templates/form',
  'app/wmes-orders-productTags/templates/conditionRow'
], function(
  _,
  FormView,
  template,
  conditionRowTemplate
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'input #-conditions .form-control': function()
      {
        this.firstConditionEl.setCustomValidity('');
      },

      'click #-addCondition': function()
      {
        this.addCondition({
          mrp: [],
          nc12: [],
          bom: []
        });
      },

      'click .btn[data-action="removeCondition"]': function(e)
      {
        if (this.$id('conditions').children().length > 1)
        {
          this.$(e.target).closest('tr').remove();

          this.firstConditionEl.setCustomValidity('');
        }
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      this.conditionI = -1;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      var conditions = this.model.get('conditions') || [];

      conditions.forEach(this.addCondition, this);

      if (conditions.length === 0)
      {
        this.$id('addCondition').click();
      }

      this.firstConditionEl = this.$id('conditions').find('.form-control').first()[0];
    },

    addCondition: function(condition)
    {
      this.$id('conditions').append(this.renderPartialHtml(conditionRowTemplate, {
        i: ++this.conditionI,
        condition: condition
      }));
    },

    checkValidity: function(formData)
    {
      var view = this;

      if (formData.conditions.length === 0)
      {
        view.firstConditionEl.setCustomValidity(view.t('conditions:invalid'));

        setTimeout(function() { view.$('.btn-primary').click(); }, 1);

        return false;
      }

      return true;
    },

    serializeForm: function(formData)
    {
      formData.conditions = (formData.conditions || []).filter(function(c)
      {
        c.mrp = _.uniq((c.mrp || '')
          .toUpperCase()
          .split(/[\s,]+/g)
          .filter(function(v) { return /^[A-Z0-9]+$/.test(v); }));

        c.nc12 = _.uniq((c.nc12 || '')
          .toUpperCase()
          .split(/[\s,]+/g)
          .filter(function(v) { return /^([A-Z0-9]{7}|[0-9]{12})$/.test(v); }));

        c.bom = _.uniq((c.bom || '')
          .split(/[\s,]+/g)
          .filter(function(v) { return /^[0-9]{12}$/.test(v); }));

        return c.mrp.length > 0
          || c.nc12.length > 0
          || c.bom.length > 0;
      });

      return formData;
    }

  });
});
