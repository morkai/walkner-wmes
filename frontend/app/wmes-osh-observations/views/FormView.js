// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/core/util/uuid',
  'app/wmes-osh-common/dictionaries',
  '../Observation',
  'app/wmes-osh-observations/templates/form/form',
  'app/wmes-osh-observations/templates/form/observationRow'
], function(
  _,
  $,
  currentUser,
  time,
  viewport,
  FormView,
  uuid,
  dictionaries,
  Observation,
  template,
  observationRowTemplate
) {
  'use strict';

  return FormView.extend({

    template,

    dialogClassName: 'osh-entries-form-dialog',

    events: Object.assign({

      'change #-userWorkplace': function()
      {
        this.$id('userDivision').val('');

        this.setUpUserDivisionSelect2();
      },

      'change #-workplace': function()
      {
        this.$id('division').val('');
        this.$id('building').val('');
        this.$id('location').val('');
        this.$id('station').val('');

        this.setUpDivisionSelect2();
        this.setUpBuildingSelect2();
        this.setUpLocationSelect2();
        this.setUpStationSelect2();
      },

      'change #-division': function()
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

      'change #-company': function()
      {
        this.$id('companyName').val('');
        this.toggleCompanyName();
      },

      'change input[name="observationKind"]': function()
      {
        this.setUpCategories();
      },

      'change input[type="file"][data-max]': function(e)
      {
        const inputEl = e.currentTarget;
        const max = +inputEl.dataset.max;

        inputEl.setCustomValidity(
          inputEl.files.length > max ? this.t('wmes-osh-common', 'FORM:ERROR:tooManyFiles', {max}) : ''
        );
      },

      'click .osh-observations-form-radio': function(e)
      {
        const $radio = this.$(e.currentTarget).find('input');

        $radio.prop('checked', !$radio.prop('checked')).trigger('change');
      },

      'change input[type="radio"]': function(e)
      {
        this.toggleCategory(this.$(e.target).closest('tr'));
        this.toggleEasyConfirmed();
      },

      'click .btn[data-action="duplicate"]': function(e)
      {
        const $srcRow = this.$(e.currentTarget).closest('tr');
        const categoryId = +$srcRow.find('input[name*="category"]').val();
        const $newRow = this.renderPartial(observationRowTemplate, {
          i: this.observationI++,
          duplicate: true,
          property: e.currentTarget.dataset.property,
          observation: {
            _id: uuid(),
            category: categoryId,
            text: dictionaries.getLabel('observationCategory', categoryId, {long: true}),
            description: dictionaries.getDescription('observationCategory', categoryId),
            safe: null,
            easy: null,
            what: '',
            why: ''
          }
        });

        $newRow.insertAfter($srcRow);

        this.toggleCategory($newRow);
      },

      'click .btn[data-action="remove"]': function(e)
      {
        this.$(e.target).closest('tr').remove();
        this.toggleEasyConfirmed();
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.observationI = 0;
    },

    getTemplateData: function()
    {
      return {
        today: time.getMoment().format('YYYY-MM-DD'),
        kinds: this.serializeKinds()
      };
    },

    serializeKinds: function()
    {
      const kinds = {};

      dictionaries.observationKinds.forEach(kind =>
      {
        if (!kind.get('active'))
        {
          return;
        }

        kinds[kind.id] = {
          value: kind.id,
          label: kind.getLabel({long: true}),
          title: kind.get('description')
        };
      });

      const current = dictionaries.kinds.get(this.model.get('kind'));

      if (current && !kinds[current])
      {
        kinds[current.id] = {
          value: current.id,
          label: current.getLabel({long: true}),
          title: current.get('description')
        };
      }

      return Object.values(kinds).sort((a, b) => a.label.localeCompare(b.label));
    },

    serializeToForm: function()
    {
      const formData = this.model.toJSON();

      if (this.options.editMode)
      {
        const date = time.utc.getMoment(formData.date);

        formData.date = date.format('YYYY-MM-DD');
        formData.time = date.format('H');
        formData.easyConfirmed = (formData.behaviors || []).some(o => o.easy === true);
      }
      else
      {
        const now = time.getMoment();

        formData.date = now.format('YYYY-MM-DD');
        formData.time = now.format('H');
        formData.easyConfirmed = false;
      }

      delete formData.coordinators;
      delete formData.attachments;
      delete formData.users;
      delete formData.changes;

      return formData;
    },

    serializeForm: function(formData)
    {
      const company = this.$id('company').select2('data');

      formData.company = company.id;

      if (company.id !== 0)
      {
        formData.companyName = company.text;
      }

      formData.userWorkplace = this.$id('userWorkplace').select2('data').id;
      formData.userDivision = this.$id('userDivision').select2('data').id;
      formData.workplace = this.$id('workplace').select2('data').id;
      formData.division = this.$id('division').select2('data').id;
      formData.building = this.$id('building').select2('data').id;
      formData.location = this.$id('location').select2('data').id;
      formData.station = parseInt(this.$id('station').val(), 10) || null;

      formData.date = time.utc.getMoment(
        `${formData.date} ${(formData.time || '00').padStart(2, '0')}:00:00`,
        'YYYY-MM-DD HH:mm:ss'
      ).toISOString();

      if (formData.observationKind)
      {
        formData.observationKind = +formData.observationKind;
      }

      const $behaviors = this.$id('behaviors').children();

      formData.behaviors = (formData.behaviors || []).filter((o, i) =>
      {
        const behaviorEl = $behaviors[i];

        if (!behaviorEl.querySelector('input[name*="safe"]:checked'))
        {
          return false;
        }

        o.category = +o.category;
        o.safe = o.safe === true;
        o.easy = o.safe ? null : o.easy;
        o.what = (o.what || '').trim();
        o.why = (o.why || '').trim();
        o.resolution = {
          _id: 0,
          rid: '',
          type: 'unspecified'
        };
        o.implementer = null;

        return true;
      });

      formData.workConditions = (formData.workConditions || []).filter(o =>
      {
        if (typeof o.safe !== 'boolean')
        {
          return false;
        }

        o.category = +o.category;
        o.safe = false;
        o.easy = o.easy === true;
        o.what = (o.what || '').trim();
        o.why = (o.why || '').trim();
        o.resolution = {
          _id: 0,
          rid: '',
          type: 'unspecified'
        };
        o.implementer = null;

        return true;
      });

      return formData;
    },

    checkValidity: function(formData)
    {
      console.log(formData);

      return true;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpUserWorkplaceSelect2();
      this.setUpUserDivisionSelect2();
      this.setUpWorkplaceSelect2();
      this.setUpDivisionSelect2();
      this.setUpBuildingSelect2();
      this.setUpLocationSelect2();
      this.setUpStationSelect2();
      this.setUpCompanySelect2();

      if (this.options.editMode)
      {
        this.setUpCategories();
      }
      else
      {
        this.toggleKind();
      }
    },

    setUpUserWorkplaceSelect2: function()
    {
      const $input = this.$id('userWorkplace');

      if (this.options.editMode)
      {
        const current = dictionaries.workplaces.get(this.model.get('userWorkplace'));

        $input.val(current ? current.id : '').select2({
          width: '100%',
          placeholder: ' ',
          data: !current ? [] : [{
            id: current.id,
            text: current.getLabel({long: true}),
            model: current
          }]
        });

        $input.select2('enable', false);

        return;
      }

      $input
        .prop('required', true)
        .closest('.form-group')
        .addClass('has-required-select2')
        .find('.control-label')
        .addClass('is-required');

      let current = dictionaries.workplaces.get(+$input.val());

      if (current)
      {
        current = {
          id: current.id,
          text: current.getLabel({long: true}),
          model: current
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

      if (current && !map[current.id])
      {
        map[current.id] = current;
      }

      $input.select2({
        width: '100%',
        data: Object.values(map).sort((a, b) => a.text.localeCompare(b.text))
      });

      const userWorkplace = dictionaries.workplaces.get(currentUser.data.oshWorkplace);

      if (this.options.editMode && current)
      {
        $input.select2('enable', false).select2('data', current);

        return;
      }

      if (userWorkplace)
      {
        $input.select2('enable', false).select2('data', {
          id: userWorkplace.id,
          text: userWorkplace.getLabel({long: true}),
          model: userWorkplace
        });

        return;
      }

      $input.select2('enable', true);
    },

    setUpUserDivisionSelect2: function()
    {
      const $input = this.$id('userDivision');

      if (this.options.editMode)
      {
        const current = dictionaries.divisions.get(this.model.get('userDivision'));

        $input.val(current ? current.id : '').select2({
          width: '100%',
          placeholder: ' ',
          data: !current ? [] : [{
            id: current.id,
            text: current.getLabel({long: true}),
            model: current
          }]
        });

        $input.select2('enable', false);

        return;
      }

      const currentWorkplaceId = +this.$id('userWorkplace').val();
      let currentDivision = dictionaries.divisions.get(+$input.val());

      if (currentDivision)
      {
        currentDivision = {
          id: currentDivision.id,
          text: currentDivision.getLabel({long: true}),
          model: currentDivision
        };
      }

      const map = {};

      dictionaries.divisions.forEach(model =>
      {
        if (!model.get('active') || model.get('workplace') !== currentWorkplaceId)
        {
          return;
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          model
        };
      });

      if (currentDivision
        && !map[currentDivision.id]
        && currentDivision.model.get('workplace') === currentWorkplaceId)
      {
        map[currentDivision.id] = currentDivision;
      }

      const data = Object.values(map).sort((a, b) => a.text.localeCompare(b.text));
      let placeholder = ' ';
      let enabled = true;

      if (!currentWorkplaceId && data.length === 0)
      {
        placeholder = this.t('FORM:placeholder:noUserWorkplace');
        enabled = false;
      }

      $input.select2({
        width: '100%',
        placeholder,
        data
      });

      const userDivision = dictionaries.divisions.get(currentUser.data.oshDivision);

      if (this.options.editMode && currentDivision)
      {
        $input.select2('enable', false).select2('data', currentDivision);

        return;
      }

      if (userDivision)
      {
        $input.select2('enable', false).select2('data', {
          id: userDivision.id,
          text: userDivision.getLabel({long: true}),
          model: userDivision
        });

        return;
      }

      $input.select2('enable', enabled);

      if (data.length === 1)
      {
        $input.select2('data', data[0]);
      }
      else if (!map[$input.val()])
      {
        $input.select2('data', null).val('');
      }
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

      $input.select2(
        'enable',
        !this.options.editMode || Observation.can.manage() || this.model.isCoordinator()
      );
    },

    setUpDivisionSelect2: function()
    {
      const $input = this.$id('division');

      const currentWorkplaceId = +this.$id('workplace').val();
      let currentDivision = dictionaries.divisions.get(+$input.val());

      if (currentDivision)
      {
        currentDivision = {
          id: currentDivision.id,
          text: currentDivision.getLabel({long: true}),
          model: currentDivision
        };
      }

      const map = {};

      dictionaries.divisions.forEach(model =>
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

      if (currentDivision && !map[currentDivision.id])
      {
        map[currentDivision.id] = currentDivision;
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

      $input.select2(
        'enable',
        !!currentWorkplaceId
          && (!this.options.editMode || Observation.can.manage() || this.model.isCoordinator())
      );
    },

    setUpBuildingSelect2: function()
    {
      const $input = this.$id('building');
      const currentDivisionId = +this.$id('division').val();
      const map = {};

      dictionaries.buildings.forEach(model =>
      {
        if (!model.get('active') || !model.hasDivision(currentDivisionId))
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
        placeholder: currentDivisionId ? ' ' : this.t('FORM:placeholder:noDivision'),
        data
      });

      if (data.length === 1)
      {
        $input.select2('data', data[0]);
      }

      $input.select2(
        'enable',
        !!currentDivisionId
          && (!this.options.editMode || Observation.can.manage() || this.model.isCoordinator())
      );
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
        data
      });

      if (data.length === 1)
      {
        $input.select2('data', data[0]);
      }

      $input.select2(
        'enable',
        !!currentBuildingId
          && (!this.options.editMode || Observation.can.manage() || this.model.isCoordinator())
      );
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

      if (data.length === 1)
      {
        $input.select2('data', data[0]);
      }

      $input.select2(
        'enable',
        data.length > 0
          && !!currentLocationId
          && (!this.options.editMode || Observation.can.manage() || this.model.isCoordinator())
      );
    },

    setUpCompanySelect2: function()
    {
      const $input = this.$id('company');
      const map = {};

      dictionaries.companies.forEach(model =>
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

      const data = Object.values(map).sort((a, b) => a.text.localeCompare(b.text));

      data.push({
        id: 0,
        text: this.t('FORM:company:other')
      });

      $input.select2({
        width: '100%',
        placeholder: ' ',
        data
      });

      this.toggleCompanyName();
    },

    toggleCompanyName: function()
    {
      const required = this.$id('company').val() === '0';

      this.$id('companyName')
        .prop('disabled', !required)
        .prop('required', required)
        .closest('.form-group')
        .find('.control-label')
        .toggleClass('is-required', required);
    },

    setUpCategories: function()
    {
      const kind = dictionaries.observationKinds.get(
        this.options.editMode
          ? this.model.get('observationKind')
          : +this.$('input[name="observationKind"]:checked').val()
      );

      this.setUpObservations('behaviors', kind);
      this.setUpObservations('workConditions', kind);
      this.toggleEasyConfirmed();
    },

    setUpObservations: function(property, kind)
    {
      const behaviorCategories = new Map();

      if (kind)
      {
        kind.get(property).forEach(id =>
        {
          const category = dictionaries.observationCategories.get(id);

          if (!category || !category.get('active'))
          {
            return;
          }

          behaviorCategories.set(id, category);
        });
      }

      const behaviorObservations = [];

      (this.model.get(property) || []).forEach(observation =>
      {
        behaviorCategories.delete(observation.category);

        behaviorObservations.push({
          _id: observation._id,
          category: observation.category,
          text: observation.text,
          description: dictionaries.getDescription('observationCategory', observation.category),
          safe: observation.safe,
          easy: observation.easy,
          what: observation.what,
          why: observation.why
        });
      });

      behaviorCategories.forEach(category =>
      {
        behaviorObservations.push({
          _id: uuid(),
          category: category.id,
          text: category.get('longName'),
          description: category.get('description'),
          safe: null,
          easy: null,
          what: '',
          why: ''
        });
      });

      this.$id(property).html(
        behaviorObservations.map(observation => this.renderPartialHtml(observationRowTemplate, {
          i: this.observationI++,
          duplicate: false,
          property,
          observation
        }))
      );

      this.$id(property).children().each((i, tr) =>
      {
        this.toggleCategory($(tr));
      });
    },

    toggleKind: function()
    {
      const $kinds = this.$('input[name="observationKind"]');

      if ($kinds.length && !$kinds.filter(':checked').length)
      {
        $kinds.first().click();
      }
    },

    toggleCategory: function($tr)
    {
      $tr.removeClass('success warning danger');

      const $what = $tr.find('textarea[name*="what"]');
      const $why = $tr.find('textarea[name*="why"]');
      const safe = $tr.find('input[name*="safe"]:checked').val();
      const easy = $tr.find('input[name*="easy"]:checked').val();
      const risky = safe === 'false';

      $what.prop('disabled', !risky);
      $why.prop('disabled', !risky);

      if (!risky)
      {
        $tr
          .find('input[name*="easy"]')
          .prop('checked', false)
          .prop('disabled', true)
          .closest('td')
          .addClass('disabled');
        $tr
          .find('textarea')
          .prop('required', false);
      }

      if (safe === 'true')
      {
        $tr.addClass('success');
      }
      else if (risky)
      {
        $tr
          .find('input[name*="easy"]')
          .prop('disabled', false)
          .closest('td')
          .removeClass('disabled');
        $tr
          .find('textarea')
          .prop('required', true);

        if (easy === 'true')
        {
          $tr.addClass('warning');
        }
        else if (easy === 'false')
        {
          $tr.addClass('danger');
        }
        else
        {
          $tr.find('input[name*="easy"][value="true"]').prop('checked', true);
          $tr.addClass('warning');
        }
      }
    },

    toggleEasyConfirmed: function()
    {
      const $easy = this.$id('behaviors').find('input[name*="easy"][value="true"]:checked');

      this.$('input[name="easyConfirmed"]').prop('required', $easy.length > 0);
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

      var req = FormView.prototype.request.apply(this, arguments);

      req.always(function()
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
    }

  });
});
