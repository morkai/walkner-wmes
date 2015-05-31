// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'js2form',
  'form2js',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/orderDocuments/templates/settings'
], function(
  _,
  $,
  js2form,
  form2js,
  t,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events :{
      'submit': function()
      {
        this.submitForm();

        return false;
      },
      'change #-prodLineId': function(e)
      {
        var prodLineName = e.target.value
          .replace(/_/g, ' ')
          .replace(/\s+/, ' ')
          .replace(/~.*?$/, '')
          .trim();

        this.$id('prodLineName').val(prodLineName);
      },
      'change #-prefixFilter': function(e)
      {
        var prefixFilters = {};

        e.target.value.split(/[^0-9]/).forEach(function(prefixFilter)
        {
          if (/^[0-9]+$/.test(prefixFilter))
          {
            prefixFilters[prefixFilter] = true;
          }
        });

        e.target.value = Object.keys(prefixFilters).sort().join(' ');
      },
      'click .message-success, .message-error': 'checkLocalServer'
    },

    afterRender: function()
    {
      var model = this.model;
      var prodLine = model.get('prodLine');

      js2form(this.el, {
        prodLineId: prodLine._id,
        prodLineName: prodLine.name,
        prefixFilterMode: model.get('prefixFilterMode'),
        prefixFilter: model.get('prefixFilter'),
        localServerUrl: model.get('localServerUrl'),
        localServerPath: model.get('localServerPath')
      });

      this.checkLocalServer();
    },

    submitForm: function()
    {
      var view = this;
      var $submit = this.$id('submit').prop('disabled', true);

      $submit.find('.fa').removeClass('fa-save').addClass('fa-spin fa-spinner');

      var reqData = _.defaults(form2js(this.el), {
        prefixFilterMode: 'inclusive',
        prefixFilter: '',
        localServerUrl: '',
        localServerPath: ''
      });

      var req = this.ajax({
        type: 'POST',
        url: window.location.href,
        data: JSON.stringify(reqData)
      });

      req.fail(function(res)
      {
        var code = ((res.responseJSON || {}).error || {}).message;
        var text = t.has('orderDocuments', 'settings:error:' + code)
          ? t('orderDocuments', 'settings:error:' + code)
          : t('orderDocuments', 'settings:error:failure');

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: text
        });
      });

      req.done(function()
      {
        view.trigger('settings', {
          prodLine: {
            _id: reqData.prodLineId,
            name: reqData.prodLineName
          },
          prefixFilterMode: reqData.prefixFilterMode,
          prefixFilter: reqData.prefixFilter
        });
      });

      req.always(function()
      {
        $submit
          .prop('disabled', false)
          .find('.fa')
          .removeClass('fa-spin fa-spinner')
          .addClass('fa-save');
      });
    },

    checkLocalServer: function()
    {
      var view = this;
      var req = this.ajax({
        type: 'GET',
        url: 'http://127.0.0.1:1335/hello'
      });

      var $warning = view.$('.message-warning').removeClass('hidden');
      var $success = view.$('.message-success').addClass('hidden');
      var $error = view.$('.message-error').addClass('hidden');

      req.always(function() { $warning.addClass('hidden');});
      req.done(function() { $success.removeClass('hidden'); });
      req.fail(function() { $error.removeClass('hidden');});
    }

  });
});
