// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/views/FormView',
  'app/orders/templates/addDocumentForm'
], function(
  viewport,
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    updateOnChange: false,

    events: Object.assign({

      'change #-item': function()
      {
        var inputEl = this.$id('item')[0];
        var exists = this.model.get('documents').find({item: inputEl.value.padStart(4, '0')});

        inputEl.setCustomValidity(exists ? this.t('documents:add:exists') : '');
      },

      'input #-nc15': function()
      {
        var view = this;
        var $nc15 = view.$id('nc15');
        var nc15 = $nc15.val();

        $nc15.data('valid', false);
        $nc15[0].setCustomValidity('');

        if (!/^[0-9]{15}$/.test(nc15))
        {
          return;
        }

        if (view.model.get('documents').get(nc15))
        {
          $nc15[0].setCustomValidity(view.t('documents:add:exists'));

          return;
        }

        view.$id('submit').prop('disabled', true);

        var req = view.ajax({
          url: '/orderDocuments/files/' + nc15 + '?select(name)'
        });

        req.fail(function()
        {
          $nc15[0].setCustomValidity(view.t('documents:add:notFound'));
        });

        req.done(function(res)
        {
          $nc15.data('valid', true);
          view.$id('name').val(res.name || nc15);
        });

        req.always(function()
        {
          view.$id('submit').prop('disabled', false);
        });
      }

    }, FormView.prototype.events),

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);
    },

    checkValidity: function()
    {
      return this.$id('nc15').data('valid');
    },

    serializeToForm: function()
    {
      return {};
    },

    serializeForm: function(formData)
    {
      var documents = this.model.get('documents').toJSON();

      documents.forEach(function(doc)
      {
        if (doc.added == null)
        {
          doc.added = false;
        }
      });

      formData.item = formData.item.padStart(4, '0');
      formData.added = true;

      documents.push(formData);

      return {
        documents: documents
      };
    },

    request: function(formData)
    {
      return this.ajax({
        method: 'POST',
        url: this.model.url(),
        data: JSON.stringify(formData)
      });
    },

    handleSuccess: function()
    {
      viewport.closeDialog();
    }

  });
});
