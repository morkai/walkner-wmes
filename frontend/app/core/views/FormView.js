// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
      return this.model.toJSON();
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

      var formData = this.serializeForm(form2js(this.el));

      if (!this.checkValidity(formData))
      {
        return false;
      }

      var $submitEl = this.$('[type="submit"]').attr('disabled', true);

      var req = this.promised(this.model.save(formData, this.getSaveOptions()));

      var view = this;

      req.done(function()
      {
        if (typeof view.options.done === 'function')
        {
          view.options.done(true);
        }
        else
        {
          view.broker.publish('router.navigate', {
            url: view.model.genClientUrl(),
            trigger: true
          });
        }
      });

      req.fail(this.handleFailure.bind(this));

      req.always(function()
      {
        $submitEl.attr('disabled', false);
      });

      return false;
    },

    checkValidity: function(formData)
    {
      return !!formData;
    },

    handleFailure: function()
    {
      this.showErrorMessage(this.options.failureText);
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
