// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/viewport',
  'app/core/View',
  'app/data/localStorage',
  'app/componentLabels/ComponentLabel',
  'app/componentLabels/ComponentLabelCollection',
  'app/production/templates/componentLabels'
], function(
  _,
  viewport,
  View,
  localStorage,
  ComponentLabel,
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

      'click #-test': function()
      {
        this.submitForm(true);
      },

      'submit': function()
      {
        this.submitForm(false);

        return false;
      }

    },

    initialize: function()
    {
      this.selected = null;
      this.labelShift = JSON.parse(localStorage.getItem('WMES_OPERATOR_COMPONENT_LABEL_SHIFT') || '[0, 0]');

      var orderNo = this.model.prodShiftOrder.get('orderId');

      this.componentLabels = new ComponentLabelCollection(null, {
        url: '/orders/'
          + orderNo
          + '/componentLabels/'
          + this.model.prodShiftOrder.get('operationNo')
      });

      this.once('afterRender', function()
      {
        if (orderNo)
        {
          this.promised(this.componentLabels.fetch({reset: true}));
        }
        else
        {
          this.componentLabels.reset([]);
        }
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
        operationNo: this.model.prodShiftOrder.get('operationNo'),
        shiftX: this.labelShift[0],
        shiftY: this.labelShift[1]
      };
    },

    renderComponentLabels: function()
    {
      var $list = this.$id('componentsList');
      var $message = this.$id('componentsMessage');
      var $submit = this.$id('submit');
      var $test = this.$id('test');

      if (!this.componentLabels.length)
      {
        $list.addClass('hidden').empty();
        $message.html(this.t('componentLabels:noComponents')).removeClass('hidden');
        $submit.prop('disabled', true);
        $test.prop('disabled', true);

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
      $test.prop('disabled', false);

      if (this.componentLabels.length === 1)
      {
        $list.children().first().click();
      }
    },

    submitForm: function(test)
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

      view.$id('submit').prop('disabled', true);
      view.$id('test').prop('disabled', true);
      view.$id(test ? 'test' : 'submit').find('.fa-spin').removeClass('hidden');

      var shiftX = Math.max(Math.min(parseInt(view.$id('shiftX').val(), 10) || 0, 9999), -9999);
      var shiftY = Math.max(Math.min(parseInt(view.$id('shiftY').val(), 10) || 0, 120), -120);

      view.$id('shiftX').val(shiftX);
      view.$id('shiftY').val(shiftY);

      if (this.labelShift[0] !== shiftX || this.labelShift[1] !== shiftY)
      {
        this.labelShift = [shiftX, shiftY];

        localStorage.setItem('WMES_OPERATOR_COMPONENT_LABEL_SHIFT', JSON.stringify(this.labelShift));
      }

      var req = view.ajax({
        method: 'POST',
        url: '/componentLabels/' + componentLabel.id + ';print',
        data: JSON.stringify({
          test: test,
          labelQty: labelQty,
          shiftX: shiftX,
          shiftY: shiftY,
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

        view.$id('submit').prop('disabled', false);
        view.$id('test').prop('disabled', false);
        view.$id(test ? 'test' : 'submit').find('.fa-spin').addClass('hidden');
      });

      req.done(function()
      {
        if (!test)
        {
          viewport.closeDialog();
        }
      });
    }

  });
});
