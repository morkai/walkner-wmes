// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/reports/util/formatXAxis',
  'app/qiResults/templates/outgoingQuality/ppmTable'
], function(
  _,
  $,
  time,
  viewport,
  View,
  formatXAxis,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click td[data-key]': function(e)
      {
        var view = this;
        var el = e.currentTarget;
        var week = el.dataset.key;
        var oldValue = parseInt(el.textContent.trim(), 10) || 0;

        if (el.querySelector('.fa-spinner'))
        {
          return;
        }

        var input = el.querySelector('input');

        if (input)
        {
          input.focus();

          return;
        }

        view.$('form').remove();

        var $form = $('<form></form>');
        var $input = $('<input type="number" class="form-control" min="0">').val(oldValue);
        var $submit = $('<button class="btn btn-primary"><i class="fa fa-save"></i></button>');

        $form.append($input).append($submit).on('submit', function()
        {
          var newValue = parseInt($input.val(), 10) || 0;

          $form.remove();

          if (newValue === oldValue)
          {
            return;
          }

          viewport.msg.saving();

          el.style.textAlign = 'center';
          el.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';

          var req = view.ajax({
            method: 'POST',
            url: '/qi/reports/outgoingQuality/weeks/' + week,
            data: JSON.stringify({target: newValue})
          });

          req.fail(function()
          {
            viewport.msg.savingFailed();

            el.innerHTML = oldValue;
          });

          req.done(function()
          {
            viewport.msg.saved();
          });

          req.always(function()
          {
            el.style.textAlign = '';
          });

          return false;
        });

        $form.appendTo(el);
        $input.focus();
      }
    },

    initialize: function()
    {
      this.listenTo(this.model, 'change:groups', this.render);

      $(window).on('keydown.' + this.idPrefix, this.onKeyDown.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    getTemplateData: function()
    {
      var view = this;

      return {
        canManage: view.model.canManage(),
        data: _.map(view.model.get('groups'), function(group)
        {
          return {
            key: group.key,
            week: time.format(group.key, '[W]W'),
            oql: group.oql,
            target: group.oqlTarget
          };
        })
      };
    },

    onKeyDown: function(e)
    {
      if (e.key === 'Escape')
      {
        this.$('form').remove();
      }
    }

  });
});
