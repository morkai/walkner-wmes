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
  'app/orderDocuments/templates/localOrderPicker'
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
      }
    },

    afterRender: function()
    {
      js2form(this.el, {
        orderNo: ''
      });
    },

    submitForm: function()
    {
      var view = this;
      var $submit = this.$id('submit').prop('disabled', true);

      $submit.find('.fa').removeClass('fa-search').addClass('fa-spin fa-spinner');

      var orderNo = this.$id('orderNo').val();
      var req = this.ajax({
        type: 'GET',
        url: window.location.origin + '/orders/' + orderNo + '/documents'
      });

      req.fail(function(res)
      {
        var code = ((res.responseJSON || {}).error || {}).message;
        var text = t.has('orderDocuments', 'localOrderPicker:error:' + code)
          ? t('orderDocuments', 'localOrderPicker:error:' + code)
          : t('orderDocuments', 'localOrderPicker:error:failure');

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: text
        });
      });

      req.done(function(localOrder)
      {
        view.trigger('localOrder', localOrder);
      });

      req.always(function()
      {
        $submit
          .prop('disabled', false)
          .find('.fa')
          .removeClass('fa-spin fa-spinner')
          .addClass('fa-search');
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
