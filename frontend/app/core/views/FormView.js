// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'form2js',
  'js2form',
  'app/viewport',
  '../View'
], function(
  _,
  form2js,
  js2form,
  viewport,
  View
) {
  'use strict';

  return View.extend({

    events: {
      'submit': 'submitForm'
    },

    $errorMessage: null,

    initialize: function()
    {
      this.$errorMessage = null;

      this.listenTo(this.model, 'change', function()
      {
        if (this.isRendered())
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
      return {
        editMode: !!this.options.editMode,
        idPrefix: this.idPrefix,
        formMethod: this.options.formMethod,
        formAction: this.options.formAction,
        formActionText: this.options.formActionText,
        panelTitleText: this.options.panelTitleText,
        model: this.model.toJSON()
      };
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeToForm(false));
    },

    serializeToForm: function(partial)
    {
      /*jshint unused:false*/

      return this.model.toJSON();
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

      var $submitEl = this.$('[type="submit"]').attr('disabled', true);

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
      else
      {
        this.broker.publish('router.navigate', {
          url: this.model.genClientUrl(),
          trigger: true
        });
      }
    },

    handleFailure: function()
    {
      this.showErrorMessage(this.getFailureText());
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
