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
  'app/wmes-osh-nearMisses/NearMiss',
  'app/wmes-osh-nearMisses/views/FormView',
  'app/wmes-osh-kaizens/Kaizen',
  'app/wmes-osh-kaizens/views/FormView',
  '../Observation',
  'app/wmes-osh-observations/templates/form/form',
  'app/wmes-osh-observations/templates/form/observationRow',
  'app/wmes-osh-observations/templates/form/resolutionPopover'
], function(
  _,
  $,
  currentUser,
  time,
  viewport,
  FormView,
  uuid,
  dictionaries,
  NearMiss,
  NearMissFormView,
  Kaizen,
  KaizenFormView,
  Observation,
  template,
  observationRowTemplate,
  resolutionPopoverTemplate
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

      'change .osh-observations-categories input[type="radio"]': function(e)
      {
        this.toggleObservation(this.$(e.target).closest('tr'));
        this.toggleEasyConfirmed(true);
        this.checkDuplicateRid();
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
            why: '',
            resolution: {
              _id: 0,
              rid: '',
              type: 'unspecified'
            }
          }
        });

        $newRow.insertAfter($srcRow);

        this.toggleObservation($newRow);
      },

      'click .btn[data-action="remove"]': function(e)
      {
        const $tr = this.$(e.target).closest('tr');
        const reset = !!$tr.find('input[name*="easy"][value="true"]:checked').length;

        $tr.remove();
        this.toggleEasyConfirmed(reset);
      },

      'click .btn[data-action="addResolution"]': function(e)
      {
        this.showAddResolutionDialog(this.$(e.target).closest('tr'));
      },

      'click .btn[data-action="showResolution"]': function(e)
      {
        this.showResolutionPopover(this.$(e.target).closest('tr'));
      },

      'input input[name$="resolution.rid"]': function(e)
      {
        this.resetResolution(this.$(e.target).closest('tr'));
      },

      'change input[name$="resolution.rid"]': function(e)
      {
        this.loadResolution(this.$(e.target).closest('tr'), false);
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.observationI = 0;
      this.addedResolutions = {};
      this.loadedResolutions = {};
      this.resolutionReq = null;
      this.$resolutionPopover = null;

      $(document)
        .on(`click.${this.idPrefix}`, this.onDocumentClick.bind(this))
        .on(`keydown.${this.idPrefix}`, this.onDocumentKeyDown.bind(this));
    },

    destroy: function()
    {
      FormView.prototype.destroy.apply(this, arguments);

      $(document).off(`.${this.idPrefix}`);

      this.hideResolutionPopover();
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
        o.resolution._id = parseInt(o.resolution._id, 10) || 0;
        o.resolution.rid = o.resolution.rid || '';
        o.implementer = null;

        if (o.resolution._id === 0)
        {
          o.resolution.rid = '';
          o.resolution.type = 'unspecified';
        }

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
        o.resolution._id = parseInt(o.resolution._id, 10) || 0;
        o.resolution.rid = o.resolution.rid || '';
        o.implementer = null;

        if (o.resolution._id === 0)
        {
          o.resolution.rid = '';
          o.resolution.type = 'unspecified';
        }

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

if (!this.options.editMode)
{
  this.$id('subject').val(`Auto test ${new Date().toISOString()}`);
  this.$id('company').select2('data', this.$id('company').data('select2').opts.data[0]).trigger('change');
  this.$id('workplace').select2('data', this.$id('workplace').data('select2').opts.data[0]).trigger('change');
  this.$id('division').select2('data', this.$id('division').data('select2').opts.data[0]).trigger('change');
  this.$id('building').select2('data', this.$id('building').data('select2').opts.data[0]).trigger('change');
  this.$id('location').select2('data', this.$id('location').data('select2').opts.data[0]).trigger('change');
  this.$id('behaviors').children().first().find('[name$="safe"]').last().click();
  this.$id('behaviors').children().first().find('[name$="what"]').val('Auto what');
  this.$id('behaviors').children().first().find('[name$="why"]').val('Auto why');
  this.$id('behaviors').children().first().find('[name$="easy"]').last().click();
  this.$id('workConditions').children().first().find('[name$="safe"]').last().click();
  this.$id('workConditions').children().first().find('[name$="what"]').val('Auto what');
  this.$id('workConditions').children().first().find('[name$="why"]').val('Auto why');
  this.$id('workConditions').children().first().find('[name$="easy"]').first().click();
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
      this.toggleEasyConfirmed(false);
    },

    setUpObservations: function(property, kind)
    {
      const categories = new Map();

      if (kind)
      {
        kind.get(property).forEach(id =>
        {
          const category = dictionaries.observationCategories.get(id);

          if (!category || !category.get('active'))
          {
            return;
          }

          categories.set(id, category);
        });
      }

      const observations = [];

      (this.model.get(property) || []).forEach(observation =>
      {
        categories.delete(observation.category);

        observations.push({
          _id: observation._id,
          category: observation.category,
          text: observation.text,
          description: dictionaries.getDescription('observationCategory', observation.category),
          safe: observation.safe,
          easy: observation.easy,
          what: observation.what,
          why: observation.why,
          resolution: observation.resolution
        });
      });

      categories.forEach(category =>
      {
        observations.push({
          _id: uuid(),
          category: category.id,
          text: category.get('longName'),
          description: category.get('description'),
          safe: null,
          easy: null,
          what: '',
          why: '',
          resolution: {
            _id: 0,
            rid: '',
            type: 'unspecified'
          }
        });
      });

      this.$id(property).html(
        observations.map(observation => this.renderPartialHtml(observationRowTemplate, {
          i: this.observationI++,
          duplicate: false,
          property,
          observation
        }))
      );

      this.$id(property).children().each((i, tr) =>
      {
        this.toggleObservation($(tr));
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

    toggleObservation: function($tr)
    {
      $tr.removeClass('success warning danger');

      const $what = $tr.find('textarea[name*="what"]');
      const $why = $tr.find('textarea[name*="why"]');
      const safe = bool($tr.find('input[name*="safe"]:checked').val());
      let easy = bool($tr.find('input[name*="easy"]:checked').val());
      const risky = safe === false;

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

      if (safe)
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

        if (easy)
        {
          $tr.addClass('warning');
        }
        else if (easy === false)
        {
          $tr.addClass('danger');
        }
        else
        {
          easy = true;
          $tr.find('input[name*="easy"][value="true"]').prop('checked', true);
          $tr.addClass('warning');
        }
      }

      this.toggleResolution($tr, risky, easy);

      function bool(v)
      {
        return v === 'true' ? true : v === 'false' ? false : null;
      }
    },

    toggleResolution: function($tr, risky, easy)
    {
      const $resolution = $tr.find('.osh-observations-form-resolution');
      const $fields = $resolution.find('.form-control, .btn');
      const $id = $resolution.find('input[name$="resolution._id"]');
      const $rid = $resolution.find('input[name$="resolution.rid"]');
      const $type = $resolution.find('input[name$="resolution.type"]');
      const behavior = $fields[0].name.startsWith('behavior');
      const enabled = behavior ? (risky && !easy) : risky;
      const newRelationType = enabled
        ? (behavior ? 'nearMiss' : easy ? 'kaizen' : 'nearMiss')
        : 'unspecified';
      const oldRelationType = $type.val();
      let relation = {
        _id: +$id.val(),
        rid: $rid.val(),
        type: newRelationType
      };

      if (newRelationType !== oldRelationType)
      {
        const observationId = $tr.find('input[name$="_id"]').first().val();
        const addedResolutions = this.addedResolutions[observationId] || {};
        const addedResolution = addedResolutions[newRelationType];

        if (addedResolution)
        {
          relation = addedResolution.getRelation();
        }
        else
        {
          const observationsProperty = behavior ? 'behaviors' : 'workConditions';
          const observation = !enabled
            ? null
            : (this.model.get(observationsProperty) || []).find(o => o._id === observationId);

          if (observation && observation.resolution._id)
          {
            Object.assign(relation, observation.resolution);
          }
          else
          {
            relation = {
              _id: 0,
              rid: '',
              type: newRelationType
            };
          }
        }
      }

      $fields.prop('disabled', !enabled);
      $id.val(relation._id);
      $rid.val(relation.rid).prop('placeholder', this.t(`FORM:resolution:placeholder:${relation.type}`));
      $type.val(relation.type);
    },

    toggleEasyConfirmed: function(reset)
    {
      const $easy = this.$id('behaviors').find('input[name*="easy"][value="true"]:checked');
      const $easyConfirmed = this.$('input[name="easyConfirmed"]');

      if (reset)
      {
        $easyConfirmed.prop('checked', false);
      }

      $easyConfirmed
        .prop('required', $easy.length > 0)
        .closest('div')
        .toggleClass('hidden', $easy.length === 0);
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
    },

    showAddResolutionDialog: function($observation)
    {
      if (!this.el.checkValidity())
      {
        return this.$id('save').click();
      }

      const resolutionInfo = this.getResolutionInfo($observation);
      const formData = Object.assign(this.model.toJSON(), this.getFormData());
      const observationId = $observation.find('input[name$="_id"]').first().val();
      const observationsProp = $observation.closest('tbody')[0].dataset.observationsProp;
      const observation = formData[observationsProp].find(o => o._id === observationId);

      if (!observation)
      {
        return;
      }

      const subject = dictionaries.getLabel('observationCategory', observation.category, {long: true});
      const type = resolutionInfo.relation.type;
      let dialogView = null;

      if (type === 'kaizen')
      {
        dialogView = new KaizenFormView({
          relation: this.model,
          model: new Kaizen({
            subject,
            workplace: formData.workplace,
            division: formData.division,
            building: formData.building,
            location: formData.location,
            station: formData.station,
            problem: observation.what,
            reason: observation.why
          })
        });
      }
      else if (type === 'nearMiss')
      {
        dialogView = new NearMissFormView({
          relation: this.model,
          model: new NearMiss({
            subject,
            workplace: formData.workplace,
            division: formData.division,
            building: formData.building,
            location: formData.location,
            station: formData.station,
            problem: observation.what,
            reason: observation.why,
            eventDate: formData.date
          })
        });
      }
      else
      {
        return;
      }

      viewport.showDialog(dialogView, this.t(`FORM:resolution:title:${type}`));

      dialogView.handleSuccess = () =>
      {
        const rid = dialogView.model.get('rid');

        this.loadedResolutions[rid] = dialogView.model;

        if (!this.addedResolutions[observationId])
        {
          this.addedResolutions[observationId] = {};
        }

        this.addedResolutions[observationId][type] = dialogView.model;

        resolutionInfo.$id.val(dialogView.model.id);
        resolutionInfo.$rid.val(rid);

        viewport.closeDialog();
      };
    },

    showResolutionPopover: function($observation)
    {
      const resolutionInfo = this.getResolutionInfo($observation);

      if (!resolutionInfo.relation.rid)
      {
        resolutionInfo.$rid.focus();

        return;
      }

      if (!resolutionInfo.$rid[0].checkValidity())
      {
        resolutionInfo.$rid[0].reportValidity();

        return;
      }

      if (!resolutionInfo.model)
      {
        return this.loadResolution($observation, true);
      }

      const $btn = $observation.find('.btn[data-action="showResolution"]');

      if ($btn.data('bs.popover'))
      {
        return;
      }

      $btn.popover({
        container: $btn.closest('td'),
        trigger: 'click',
        placement: 'top',
        html: true,
        title: function() { return ''; },
        content: this.renderPartialHtml(resolutionPopoverTemplate, {
          relation: resolutionInfo.relation,
          data: resolutionInfo.model.toJSON(),
          url: resolutionInfo.model.genClientUrl()
        })
      });

      $btn.popover('show');

      this.$resolutionPopover = $btn;
    },

    hideResolutionPopover: function()
    {
      if (this.$resolutionPopover)
      {
        this.$resolutionPopover.popover('destroy');
        this.$resolutionPopover = null;
      }
    },

    resetResolution: function($observation)
    {
      const resolutionInfo = this.getResolutionInfo($observation);

      if (resolutionInfo.$id.val() !== '0')
      {
        this.checkDuplicateRid();
      }

      resolutionInfo.$id.val('0');
      resolutionInfo.$rid[0].setCustomValidity('');

      this.hideResolutionPopover();
    },

    loadResolution: function($observation, showPopover)
    {
      const resolutionInfo = this.getResolutionInfo($observation);
      const rid = this.prepareRid(resolutionInfo.$rid.val(), resolutionInfo.relation.type);

      this.resetResolution($observation);

      resolutionInfo.$rid.val(rid);

      if (!rid)
      {
        return;
      }

      const duplicateRidEls = this.checkDuplicateRid(rid);

      if (duplicateRidEls.length > 1)
      {
        _.last(duplicateRidEls).reportValidity();

        return;
      }

      if (this.isDuplicateRid(resolutionInfo.$rid[0]))
      {
        resolutionInfo.$rid[0].setCustomValidity(this.t('FORM:resolution:error:duplicate'));
        resolutionInfo.$rid[0].reportValidity();

        return;
      }

      if (this.loadedResolutions[rid])
      {
        resolutionInfo.$id.val(this.loadedResolutions[rid].id);

        return;
      }

      viewport.msg.loading();

      resolutionInfo.$rid.prop('disabled', true);
      resolutionInfo.$rid[0].setCustomValidity(this.t('FORM:resolution:error:loading'));
      resolutionInfo.$buttons.prop('disabled', true);
      resolutionInfo.$actions.prop('disabled', true);

      const req = this.resolutionReq = this.ajax({
        url: `/osh/${dictionaries.TYPE_TO_MODULE[resolutionInfo.relation.type]}?rid=${rid}&exclude(changes)&limit(1)`
      });

      req.fail(() =>
      {
        viewport.msg.loadingFailed();

        resolutionInfo.$rid[0].setCustomValidity(this.t('FORM:resolution:error:failure'));
      });

      req.done(res =>
      {
        viewport.msg.loaded();

        if (!res.collection || !res.collection.length)
        {
          resolutionInfo.$rid[0].setCustomValidity(this.t('FORM:resolution:error:notFound'));

          return;
        }

        const data = res.collection[0];

        if (data.status === 'finished' && !Observation.can.assignFinished(this.model))
        {
          resolutionInfo.$rid[0].setCustomValidity(this.t('FORM:resolution:error:finished'));

          return;
        }

        const Entry = dictionaries.TYPE_TO_MODEL[resolutionInfo.relation.type];
        const entry = new Entry(data);

        this.loadedResolutions[rid] = entry;

        resolutionInfo.$id.val(entry.id);
        resolutionInfo.$rid[0].setCustomValidity('');

        if (showPopover)
        {
          this.showResolutionPopover($observation);
        }
      });

      req.always(() =>
      {
        if (req === this.resolutionReq)
        {
          resolutionInfo.$actions.prop('disabled', false);

          this.resolutionReq = null;
        }

        resolutionInfo.$rid.prop('disabled', false);
        resolutionInfo.$buttons.prop('disabled', false);

        if (!resolutionInfo.$rid[0].checkValidity())
        {
          resolutionInfo.$rid[0].reportValidity();
        }
      });
    },

    checkDuplicateRid: function(ridToCheck)
    {
      const grouped = new Map();

      this.$('input[name$="resolution.rid"]').each((i, ridEl) =>
      {
        const rid = ridEl.value;

        if (rid.length)
        {
          if (!grouped.has(rid))
          {
            grouped.set(rid, []);
          }

          grouped.get(rid).push(ridEl);
        }
      });

      const duplicateError = this.t('FORM:resolution:error:duplicate');

      grouped.forEach(ridEls =>
      {
        ridEls.forEach(ridEl =>
        {
          if (ridEl.validationMessage === duplicateError)
          {
            ridEl.setCustomValidity('');
          }
        });

        if (ridEls.length === 1)
        {
          return;
        }

        const lastRidEl = _.last(ridEls);

        if (lastRidEl.checkValidity())
        {
          lastRidEl.setCustomValidity(duplicateError);
        }
      });

      return grouped.get(ridToCheck) || [];
    },

    isDuplicateRid: function(checkedRidEl)
    {
      let duplicate = false;

      this.$('input[name$="resolution.rid"]').each((i, candidateRidEl) =>
      {
        if (duplicate || candidateRidEl === checkedRidEl)
        {
          return;
        }

        duplicate = candidateRidEl.value === checkedRidEl.value;
      });

      return duplicate;
    },

    prepareRid: function(rid, type)
    {
      const matches = rid.trim().match(/([zkZK]-)?([0-9]{4}-)?([0-9]{1,6})/);

      rid = '';

      if (matches)
      {
        rid += (matches[1] || dictionaries.TYPE_TO_PREFIX[type]).charAt(0).toUpperCase();
        rid += '-' + (matches[2] || time.format(Date.now(), 'YYYY')).substring(0, 4);
        rid += '-' + matches[3].padStart(6, '0');
      }

      return rid;
    },

    getResolutionInfo: function($observation)
    {
      const $resolution = $observation.find('.osh-observations-form-resolution');
      const $id = $resolution.find('input[name$="_id"]');
      const $rid = $resolution.find('input[name$="rid"]');
      const $type = $resolution.find('input[name$="type"]');
      const rid = $rid.val();

      return {
        $observation,
        $resolution,
        $id,
        $rid,
        $type,
        $buttons: $resolution.find('.btn'),
        $actions: this.$('.form-actions').find('.btn'),
        model: this.loadedResolutions[rid] || null,
        relation: {
          _id: +$id.val(),
          rid,
          type: $type.val()
        }
      };
    },

    onDocumentClick: function(e)
    {
      if (!this.$resolutionPopover)
      {
        return;
      }

      const $resolutionTd = this.$(e.target).closest('.osh-observations-form-resolution');

      if ($resolutionTd.length
        && $resolutionTd[0] === this.$resolutionPopover.closest('.osh-observations-form-resolution')[0])
      {
        return;
      }

      this.hideResolutionPopover();
    },

    onDocumentKeyDown: function(e)
    {
      if (e.key === 'Escape' && this.$resolutionPopover)
      {
        this.hideResolutionPopover();

        return false;
      }
    }

  });
});
