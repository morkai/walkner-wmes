// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/viewport',
  'app/core/views/FormView',
  'app/kanbanContainers/templates/form'
], function(
  _,
  viewport,
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'input #-_id': 'validateId'

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.validateId = _.debounce(this.validateId.bind(this), 500);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      if (this.options.editMode)
      {
        this.$id('_id').prop('readonly', true);
        this.$id('name').focus();
      }
      else
      {
        this.$id('_id').focus();
      }
    },

    validateId: function()
    {
      var view = this;
      var $id = view.$id('_id');
      var req = view.ajax({method: 'HEAD', url: '/kanban/containers/' + $id.val()});

      req.fail(function()
      {
        $id[0].setCustomValidity('');
      });

      req.done(function()
      {
        $id[0].setCustomValidity(req.status === 200 ? view.t('FORM:ERROR:alreadyExists') : '');
      });
    },

    submitRequest: function($submit, formData)
    {
      var view = this;

      if (!formData.image)
      {
        return FormView.prototype.submitRequest.call(view, $submit, formData);
      }

      var uploadFormData = new FormData();

      uploadFormData.append('image', this.$id('image')[0].files[0]);

      var req = view.ajax({
        type: 'POST',
        url: '/kanban/containers/' + formData._id + '.jpg',
        data: uploadFormData,
        processData: false,
        contentType: false
      });

      req.fail(function()
      {
        view.showErrorMessage(view.t('FORM:ERROR:imageFailure'));

        $submit.prop('disabled', false);
      });

      req.done(function(image)
      {
        formData.image = image;

        FormView.prototype.submitRequest.call(view, $submit, formData);
      });
    }

  });
});
