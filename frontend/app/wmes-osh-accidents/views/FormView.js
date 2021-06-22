// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/time',
  'app/viewport',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/views/FormView',
  '../Accident',
  'app/wmes-osh-accidents/templates/form'
], function(
  _,
  currentUser,
  time,
  viewport,
  dictionaries,
  FormView,
  Accident,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    dialogClassName: 'osh-entries-form-dialog',

    events: Object.assign({

      'change input[type="file"][data-max]': function(e)
      {
        const inputEl = e.currentTarget;
        const max = +inputEl.dataset.max;

        inputEl.setCustomValidity(
          inputEl.files.length > max ? this.t('wmes-osh-common', 'FORM:ERROR:tooManyFiles', {max}) : ''
        );
      }

    }, FormView.prototype.events),

    getTemplateData: function()
    {
      return {
        today: time.getMoment().format('YYYY-MM-DD')
      };
    },

    serializeToForm: function()
    {
      const formData = this.model.toJSON();

      if (formData.eventDate)
      {
        const eventDate = time.utc.getMoment(formData.eventDate);

        formData.eventDate = eventDate.format('YYYY-MM-DD');
        formData.eventTime = eventDate.format('HH:mm');
      }
      else
      {
        const now = time.getMoment();

        formData.eventDate = now.format('YYYY-MM-DD');
        formData.eventTime = now.format('HH:mm');
      }

      delete formData.coordinators;
      delete formData.attachments;
      delete formData.users;
      delete formData.changes;

      return formData;
    },

    serializeForm: function(formData)
    {
      const workplace = this.$id('workplace').select2('data');

      formData.division = workplace.model.get('division');
      formData.workplace = workplace.id;
      formData.department = this.$id('department').select2('data').id;
      formData.building = parseInt(this.$id('building').val(), 10) || 0;
      formData.location = parseInt(this.$id('location').val(), 10) || 0;
      formData.station = parseInt(this.$id('station').val(), 10) || 0;

      formData.eventDate = time.utc.getMoment(
        `${formData.eventDate} ${formData.eventTime || '00:00'}:00`,
        'YYYY-MM-DD HH:mm:ss'
      ).toISOString();

      delete formData.eventTime;

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpDivisionSelect2();
      this.setUpWorkplaceSelect2();
      this.setUpDepartmentSelect2();
      this.setUpBuildingSelect2(false);
      this.setUpLocationSelect2();
      this.setUpStationSelect2();
    },

    getSaveOptions: function()
    {
      return {
        wait: true,
        patch: true
      };
    },

    request: function()
    {
      viewport.msg.saving();

      const req = FormView.prototype.request.apply(this, arguments);

      req.always(() =>
      {
        viewport.msg.saved();
      });

      return req;
    },

    submitRequest: function($submitEl, formData)
    {
      const view = this;
      const uploadFormData = new FormData();
      let files = 0;

      view.$('input[type="file"]').each(function()
      {
        const name = this.name.replace('attachments.', '');

        for (let i = 0; i < this.files.length; ++i)
        {
          uploadFormData.append(name, this.files[i]);

          files += 1;
        }
      });

      if (files === 0)
      {
        return FormView.prototype.submitRequest.call(view, $submitEl, formData);
      }

      viewport.msg.saving();

      const uploadReq = view.ajax({
        type: 'POST',
        url: '/osh/attachments',
        data: uploadFormData,
        processData: false,
        contentType: false
      });

      uploadReq.done(attachments =>
      {
        formData.attachments = {
          added: attachments
        };

        FormView.prototype.submitRequest.call(view, $submitEl, formData);

        viewport.msg.saved();
      });

      uploadReq.fail(() =>
      {
        viewport.msg.saved();

        view.showErrorMessage(view.t('wmes-osh-common', 'FORM:ERROR:upload'));

        $submitEl.attr('disabled', false);
      });
    },

    onDialogShown: function()
    {
      this.$id('subject').focus();
    }

  });
});
