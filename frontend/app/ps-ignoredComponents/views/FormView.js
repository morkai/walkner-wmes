// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/views/FormView',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/ps-ignoredComponents/templates/form'
], function(
  _,
  t,
  FormView,
  setUpMrpSelect2,
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

        var req = this.ajax({method: 'HEAD', url: '/paintShop/ignoredComponents/' + nc12});

        req.fail(function()
        {
          e.target.setCustomValidity('');
        });

        req.done(function()
        {
          e.target.setCustomValidity(req.status === 200 ? view.t('FORM:ERROR:alreadyExists') : '');
        });

        this.ajax({url: '/kanban/components/' + nc12}).done(function(res)
        {
          view.$id('name').val(res.description);
        });
      }

    }, FormView.prototype.events),

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.mrps = formData.mrps.join(',');

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      if (this.options.editMode)
      {
        this.$id('_id').prop('readonly', true);
      }
      else
      {
        this.$id('_id').focus();
      }

      setUpMrpSelect2(this.$id('mrps'), {
        view: this,
        own: false,
        width: '100%'
      });
    }

  });
});
