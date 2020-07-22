// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'form2js',
  'js2form',
  'app/viewport',
  '../Model',
  '../View'
], function(
  _,
  form2js,
  js2form,
  viewport,
  Model,
  View
) {
  'use strict';

  return View.extend({

    events: {
      'submit': 'submitForm'
    },

    $errorMessage: null,

    updateOnChange: true,

    initialize: function()
    {
      this.$errorMessage = null;

      if (!this.model)
      {
        this.model = new Model();
      }

      this.listenTo(this.model, 'change', function()
      {
        if (this.isRendered() && this.updateOnChange)
        {
          js2form(this.el, this.serializeToForm(true), '.', null, false, false);
        }
      });
    },

    destroy: function()
    {
      this.hideErrorMessage();
    },

    serialize: function()
    {
      var options = this.options;

      return _.assign(View.prototype.serialize.apply(this, arguments), {
        editMode: !!options.editMode,
        formMethod: options.formMethod,
        formAction: options.formAction,
        formActionText: options.formActionText,
        panelTitleText: options.panelTitleText,
        model: this.serializeModel()
      });
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeToForm(false));
    },

    serializeModel: function()
    {
      return this.model.toJSON();
    },

    serializeToForm: function(partial) // eslint-disable-line no-unused-vars
    {
      return this.model.serializeForm ? this.model.serializeForm() : this.model.toJSON();
    },

    serializeForm: function(formData)
    {
      return formData;
    },

    getFormData: function()
    {
      return this.serializeForm(form2js(this.el));
    },

    submitForm: function()
    {
      this.hideErrorMessage();

      if (!this.el.checkValidity())
      {
        return false;
      }

      var formData = this.getFormData();

      if (!this.checkValidity(formData))
      {
        this.handleInvalidity(formData);

        return false;
      }

      var $submitEl = this.$('.form-actions .btn:not(.cancel)').attr('disabled', true);

      this.submitRequest($submitEl, formData);

      return false;
    },

    submitRequest: function($submitEl, formData)
    {
      var req = this.request(formData);

      req.done(this.handleSuccess.bind(this));
      req.fail(this.handleFailure.bind(this));
      req.always(function() { $submitEl.attr('disabled', false); });
    },

    request: function(formData)
    {
      return this.promised(this.model.save(formData, this.getSaveOptions()));
    },

    checkValidity: function(formData)
    {
      return !!formData;
    },

    handleInvalidity: function()
    {

    },

    handleSuccess: function()
    {
      if (typeof this.options.done === 'function')
      {
        this.options.done(true);
      }
      else if (this.broker)
      {
        this.broker.publish('router.navigate', {
          url: this.model.genClientUrl(),
          trigger: true
        });
      }
    },

    handleFailure: function(jqXhr)
    {
      this.showErrorMessage(this.getFailureText(jqXhr));
    },

    getFailureText: function()
    {
      return this.options.failureText;
    },

    showErrorMessage: function(text)
    {
      this.hideErrorMessage();

      this.$errorMessage = viewport.msg.show({
        type: 'error',
        time: 3000,
        text: text
      });

      return false;
    },

    hideErrorMessage: function()
    {
      if (this.$errorMessage !== null)
      {
        viewport.msg.hide(this.$errorMessage);

        this.$errorMessage = null;
      }
    },

    getSaveOptions: function()
    {
      return {
        wait: true
      };
    }

  });
});
