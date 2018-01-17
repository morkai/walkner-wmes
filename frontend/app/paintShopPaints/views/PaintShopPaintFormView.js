// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/views/FormView',
  'app/paintShopPaints/templates/form'
], function(
  _,
  t,
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'input #-_id': function(e)
      {
        var view = this;
        var nc12 = view.$id('_id').val();

        if (nc12.length !== 12)
        {
          e.target.setCustomValidity('');

          return;
        }

        var req = this.ajax({method: 'HEAD', url: '/paintShop/paints/' + nc12});

        req.fail(function()
        {
          e.target.setCustomValidity('');
        });

        req.done(function()
        {
          e.target.setCustomValidity(req.status === 200 ? t('paintShopPaints', 'FORM:ERROR:alreadyExists') : '');
        });
      }

    }, FormView.prototype.events),

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      if (this.options.editMode)
      {
        this.$id('_id').prop('readonly', true);
        this.$id('shelf').focus();
      }
      else
      {
        this.$id('_id').focus();
      }
    }

  });
});
