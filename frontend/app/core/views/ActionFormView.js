define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/router',
  '../View',
  'app/core/templates/actionForm',
  'i18n!app/nls/core'
], function(
  _,
  $,
  t,
  viewport,
  router,
  View,
  actionFormTemplate
) {
  'use strict';

  var DEFAULT_OPTIONS = {
    /**
     * @type {string}
     */
    formMethod: 'POST',
    /**
     * @type {string}
     */
    formAction: '/',
    /**
     * @type {string|function}
     */
    formActionText: t.bound('core', 'ACTION_FORM:BUTTON'),
    /**
     * @type {string}
     */
    formActionSeverity: 'primary',
    /**
     * @type {string|function}
     */
    messageText: t.bound('core', 'ACTION_FORM:MESSAGE'),
    /**
     * @type {string|null}
     */
    successUrl: null,
    /**
     * @type {string}
     */
    cancelUrl: '#',
    /**
     * @type {string|function}
     */
    failureText: t.bound('core', 'ACTION_FORM:MESSAGE_FAILURE'),
    /**
     * @type {*}
     */
    requestData: null
  };

  var ActionFormView = View.extend({

    template: actionFormTemplate,

    events: {
      'submit': 'submitForm'
    },

    $errorMessage: null,

    initialize: function()
    {
      _.defaults(this.options, DEFAULT_OPTIONS);

      this.$errorMessage = null;
    },

    destroy: function()
    {
      this.hideErrorMessage();
    },

    serialize: function()
    {
      return {
        formMethod: this.options.formMethod,
        formAction: this.options.formAction,
        formActionText: this.options.formActionText,
        formActionSeverity: this.options.formActionSeverity,
        messageText: this.options.messageText,
        cancelUrl: this.options.cancelUrl,
        model: this.model
      };
    },

    afterRender: function()
    {
      if (this.model)
      {
        this.listenToOnce(this.model, 'change', this.render);
      }
    },

    submitForm: function()
    {
      this.hideErrorMessage();

      var $submitEl = this.$('[type="submit"]').attr('disabled', true);

      var options = this.options;
      var data = options.requestData;

      if (data == null)
      {
        data = undefined;
      }
      else if (_.isFunction(data))
      {
        data = data.call(this);
      }
      else
      {
        data = JSON.stringify(data);
      }

      var req = $.ajax({
        type: options.formMethod,
        url: options.formAction,
        data: data
      });

      var view = this;

      req.done(function(jqXhr)
      {
        view.trigger('success', jqXhr);

        if (_.isString(options.successUrl))
        {
          view.broker.publish('router.navigate', {
            url: options.successUrl,
            trigger: true,
            replace: true
          });
        }
      });

      req.fail(function(jqXhr)
      {
        view.trigger('failure', jqXhr);

        if (options.failureText)
        {
          view.$errorMessage = viewport.msg.show({
            type: 'error',
            time: 5000,
            text: options.failureText
          });
        }
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

  }, {

    showDialog: function(options)
    {
      var dialogTitle = null;

      if (!options.nlsDomain)
      {
        options.nlsDomain = options.model.getNlsDomain();
      }

      if (options.nlsDomain)
      {
        dialogTitle = t.bound(options.nlsDomain, 'ACTION_FORM:DIALOG_TITLE:' + options.actionKey);

        var modelLabel = options.labelAttribute
          ? options.model.get(options.labelAttribute)
          : options.model.getLabel();

        if (modelLabel)
        {
          options.messageText = t.bound(
            options.nlsDomain,
            'ACTION_FORM:MESSAGE_SPECIFIC:' + options.actionKey,
            {label: modelLabel}
          );
        }
        else
        {
          options.messageText =
            t.bound(options.nlsDomain, 'ACTION_FORM:MESSAGE:' + options.actionKey);
        }

        options.formActionText =
          t.bound(options.nlsDomain, 'ACTION_FORM:BUTTON:' + options.actionKey);

        options.failureText =
          t.bound(options.nlsDomain, 'ACTION_FORM:MESSAGE_FAILURE:' + options.actionKey);
      }

      if (!options.formAction && _.isFunction(options.model.url))
      {
        options.formAction = options.model.url();
      }

      if (!_.isObject(options.requestData))
      {
        options.requestData = {};
      }

      if (!_.isString(options.requestData.action))
      {
        options.requestData.action = options.actionKey;
      }

      var dialogView = new ActionFormView(options);

      dialogView.on('success', viewport.closeDialog);

      viewport.showDialog(dialogView, dialogTitle);

      return dialogView;
    },

    showDeleteDialog: function(options)
    {
      options.actionKey = 'delete';
      options.formMethod = 'DELETE';
      options.formActionSeverity = 'danger';

      return ActionFormView.showDialog(options);
    }

  });

  return ActionFormView;
});
