// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/wmes-osh-common/dictionaries',
  '../Accident',
  'app/wmes-osh-accidents/templates/form'
], function(
  _,
  currentUser,
  time,
  viewport,
  FormView,
  dictionaries,
  Accident,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    dialogClassName: 'osh-entries-form-dialog',

    events: Object.assign({

      'change #-workplace': function()
      {
        this.$id('department').val('');
        this.$id('building').val('');
        this.$id('location').val('');
        this.$id('station').val('');

        this.setUpDepartmentSelect2();
        this.setUpBuildingSelect2();
        this.setUpLocationSelect2();
        this.setUpStationSelect2();
      },

      'change #-department': function()
      {
        this.$id('building').val('');
        this.$id('location').val('');
        this.$id('station').val('');

        this.setUpBuildingSelect2();
        this.setUpLocationSelect2();
        this.setUpStationSelect2();
      },

      'change #-building': function()
      {
        this.$id('location').val('');
        this.$id('station').val('');

        this.setUpLocationSelect2();
        this.setUpStationSelect2();
      },

      'change #-location': function()
      {
        this.$id('station').val('');

        this.setUpStationSelect2();
      },

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

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpWorkplaceSelect2();
      this.setUpDepartmentSelect2();
      this.setUpBuildingSelect2();
      this.setUpLocationSelect2();
      this.setUpStationSelect2();
    },

    setUpWorkplaceSelect2: function()
    {
      const $input = this.$id('workplace');
      let currentWorkplace = dictionaries.workplaces.get(+$input.val());

      if (currentWorkplace)
      {
        currentWorkplace = {
          id: currentWorkplace.id,
          text: currentWorkplace.getLabel({long: true}),
          model: currentWorkplace
        };
      }

      const map = {};

      dictionaries.workplaces.forEach(model =>
      {
        if (!model.get('active'))
        {
          return;
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          model
        };
      });

      if (currentWorkplace && !map[currentWorkplace.id])
      {
        map[currentWorkplace.id] = currentWorkplace;
      }

      $input.select2({
        width: '100%',
        data: Object.values(map).sort((a, b) => a.text.localeCompare(b.text))
      });

      $input.select2('enable');
    },

    setUpDepartmentSelect2: function()
    {
      const $input = this.$id('department');
      let currentDepartment = dictionaries.departments.get(+$input.val());

      if (currentDepartment)
      {
        currentDepartment = {
          id: currentDepartment.id,
          text: currentDepartment.getLabel({long: true}),
          model: currentDepartment
        };
      }

      const currentWorkplaceId = +this.$id('workplace').val();
      const map = {};

      dictionaries.departments.forEach(model =>
      {
        if (!model.get('active') || !model.hasWorkplace(currentWorkplaceId))
        {
          return;
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          model
        };
      });

      if (currentDepartment && !map[currentDepartment.id])
      {
        map[currentDepartment.id] = currentDepartment;
      }

      const data = Object.values(map).sort((a, b) => a.text.localeCompare(b.text));

      $input.select2({
        width: '100%',
        placeholder: currentWorkplaceId ? ' ' : this.t('FORM:placeholder:noWorkplace'),
        data
      });

      if (data.length === 1)
      {
        $input.select2('data', data[0]);
      }
      else if (!map[$input.val()])
      {
        $input.val('').select2('data', null);
      }

      $input.select2('enable', !!currentWorkplaceId);
    },

    setUpBuildingSelect2: function()
    {
      const $input = this.$id('building');
      const currentDepartmentId = +this.$id('department').val();
      const map = {};

      dictionaries.buildings.forEach(model =>
      {
        if (!model.get('active') || !model.hasDepartment(currentDepartmentId))
        {
          return;
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          model
        };
      });

      const data = Object.values(map).sort((a, b) => a.text.localeCompare(b.text));

      $input.select2({
        width: '100%',
        placeholder: currentDepartmentId ? ' ' : this.t('FORM:placeholder:noDepartment'),
        allowClear: true,
        data
      });

      if (!this.options.editMode && data.length === 1)
      {
        $input.select2('data', data[0]);
      }

      $input.select2('enable', data.length > 0 && !!currentDepartmentId);
    },

    setUpLocationSelect2: function()
    {
      const $input = this.$id('location');
      const currentBuildingId = +this.$id('building').val();
      const map = {};

      dictionaries.locations.forEach(model =>
      {
        if (!model.get('active') || !model.hasBuilding(currentBuildingId))
        {
          return;
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          model
        };
      });

      const data = Object.values(map).sort((a, b) => a.text.localeCompare(b.text));

      $input.select2({
        width: '100%',
        placeholder: currentBuildingId ? ' ' : this.t('FORM:placeholder:noBuilding'),
        allowClear: true,
        data
      });

      if (!this.options.editMode && data.length === 1)
      {
        $input.select2('data', data[0]);
      }

      $input.select2('enable', data.length > 0 && !!currentBuildingId);
    },

    setUpStationSelect2: function()
    {
      const $input = this.$id('station');
      const currentLocationId = +this.$id('location').val();
      const map = {};

      dictionaries.stations.forEach(model =>
      {
        if (!model.get('active') || !model.hasLocation(currentLocationId))
        {
          return;
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          model
        };
      });

      const data = Object.values(map).sort((a, b) => a.text.localeCompare(b.text));

      $input.select2({
        width: '100%',
        placeholder: currentLocationId ? ' ' : this.t('FORM:placeholder:noLocation'),
        allowClear: true,
        data
      });

      if (!this.options.editMode && data.length === 1)
      {
        $input.select2('data', data[0]);
      }

      $input.select2('enable', data.length > 0 && !!currentLocationId);
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
