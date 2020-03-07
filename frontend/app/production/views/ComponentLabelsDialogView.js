// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/viewport',
  'app/core/View',
  'app/componentLabels/ComponentLabelCollection',
  'app/production/templates/componentLabels'
], function(
  _,
  viewport,
  View,
  ComponentLabelCollection,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'production-modal production-componentLabels-modal',

    events: {

      'focus [data-vkb]': function(e)
      {
        if (this.options.embedded && this.options.vkb)
        {
          this.options.vkb.show(e.target);
        }
      },

      'click .btn-default[value]': function(e)
      {
        this.$('.btn.active[value]').removeClass('active');
        e.currentTarget.classList.add('active');
      },

      'submit': function()
      {
        this.submitForm();

        return false;
      }

    },

    initialize: function()
    {
      this.selected = null;

      this.componentLabels = new ComponentLabelCollection(null, {
        url: '/orders/'
          + this.model.prodShiftOrder.get('orderId')
          + '/componentLabels/'
          + this.model.prodShiftOrder.get('operationNo')
      });

      this.once('afterRender', function()
      {
        this.promised(this.componentLabels.fetch({reset: true}));
      });

      this.listenTo(this.componentLabels, 'reset', this.renderComponentLabels);
    },

    destroy: function()
    {
      if (this.options.vkb)
      {
        this.options.vkb.hide();
      }
    },

    getTemplateData: function()
    {
      return {
        orderNo: this.model.prodShiftOrder.get('orderId'),
        operationNo: this.model.prodShiftOrder.get('operationNo')
      };
    },

    renderComponentLabels: function()
    {
      var $list = this.$id('componentsList');
      var $message = this.$id('componentsMessage');
      var $submit = this.$id('submit');

      if (!this.componentLabels.length)
      {
        $list.addClass('hidden').empty();
        $message.html(this.t('componentLabels:noComponents')).removeClass('hidden');
        $submit.prop('disabled', true);

        return;
      }

      var html = '';

      this.componentLabels.forEach(function(c)
      {
        html += '<button type="button" class="btn btn-lg btn-default" value="' + c.id + '">'
          + '<em>' + c.get('componentCode') + '</em>'
          + '<span>' + c.get('description') + '</span>'
          + '</button>';
      });

      $message.addClass('hidden');
      $list.html(html).removeClass('hidden');
      $submit.prop('disabled', false);
    },

    submitForm: function()
    {
      var view = this;
      var labelQty = +view.$id('labelQty').val().replace(/[^0-9]+/g, '');
      var componentLabel = view.componentLabels.get(view.$('.btn.active[value]').val());

      if (!labelQty)
      {
        view.$id('labelQty').focus();

        return;
      }

      if (!componentLabel)
      {
        view.$id('componentsList').find('.btn').first().focus();

        return;
      }

      var orderData = view.model.prodShiftOrder.get('orderData');
      var bom = orderData && orderData.bom || [];
      var component = _.find(bom, function(c) { return c.nc12 === componentLabel.get('componentCode'); });
      var maxQty = component && component.qty || 50;

      if (labelQty > maxQty)
      {
        labelQty = maxQty;
      }

      view.$id('labelQty').val(labelQty);

      view.$id('submit').prop('disabled', true).find('.fa-spin').removeClass('hidden');

      var req = view.ajax({
        method: 'POST',
        url: '/componentLabels/' + componentLabel.id + ';print',
        data: JSON.stringify({
          labelQty: labelQty,
          orderNo: this.model.prodShiftOrder.get('orderId'),
          prodLine: view.model.prodLine.id,
          secretKey: view.model.getSecretKey()
        })
      });

      req.fail(function()
      {
        var code = req.responseJSON && req.responseJSON.error && req.responseJSON.error.code || '';

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: view.t.has('componentLabels:error:' + code)
            ? view.t('componentLabels:error:' + code)
            : view.t('componentLabels:error')
        });

        view.$id('submit').prop('disabled', false).find('.fa-spin').addClass('hidden');
      });

      req.done(function()
      {
        viewport.closeDialog();
      });
    }

  });
});
