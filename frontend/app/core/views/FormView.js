define([
  'jquery',
  'underscore',
  'form2js',
  'js2form',
  'app/viewport',
  '../View'
], function(
  $,
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

    idPrefix: 'formView',

    successUrlPrefix: '/',

    $errorMessage: null,

    initialize: function()
    {
      this.idPrefix = _.uniqueId(this.idPrefix);
      this.$errorMessage = null;

      this.listenTo(this.model, 'change', function(model)
      {
        js2form(this.el, model.toJSON());
      });
    },

    destroy: function()
    {
      this.hideErrorMessage();
    },

    serialize: function()
    {
      return {
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
      js2form(this.el, this.model.toJSON());
    },

    serializeForm: function(formData)
    {
      return formData;
    },

    submitForm: function()
    {
      this.hideErrorMessage();

      if (!this.el.checkValidity())
      {
        return false;
      }

      var $submitEl = this.$('[type="submit"]').attr('disabled', true);

      var req = $.ajax({
        type: this.options.formMethod,
        url: this.el.action,
        data: JSON.stringify(this.serializeForm(form2js(this.el))),
        contentType: 'application/json'
      });

      var view = this;

      req.done(function(res)
      {
        view.broker.publish('router.navigate', {
          url: view.successUrlPrefix + res._id,
          trigger: true
        });
      });

      req.fail(function()
      {
        view.$errorMessage = viewport.msg.show({
          type: 'error',
          text: view.options.failureText
        });
      });

      req.always(function()
      {
        $submitEl.attr('disabled', false);
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
    }

  });
});
