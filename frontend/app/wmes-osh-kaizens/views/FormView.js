// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/core/util/formatResultWithDescription',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  '../Kaizen',
  'app/wmes-osh-kaizens/templates/form'
], function(
  _,
  currentUser,
  time,
  viewport,
  FormView,
  formatResultWithDescription,
  setUpUserSelect2,
  dictionaries,
  Kaizen,
  template
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

      'change input[name="kind"]': function()
      {
        this.$id('eventCategory').val('');

        this.setUpEventCategorySelect2();
      },

      'change input[type="file"][data-max]': function(e)
      {
        const inputEl = e.currentTarget;
        const max = +inputEl.dataset.max;

        inputEl.setCustomValidity(
          inputEl.files.length > max ? this.t('wmes-osh-common', 'FORM:ERROR:tooManyFiles', {max}) : ''
        );
      },

      'click #-inProgress': function()
      {
        this.newStatus = 'inProgress';

        const $comment = this.$id('comment');

        if (this.model.get('status') === 'verification'
          && !$comment.val().trim().replace(/[^a-zA-Z]+/g, '').length)
        {
          const cleanup = () =>
          {
            $comment.prop('required', false);
          };

          $comment.prop('required', true);
          $comment.one('blur', cleanup);
        }

        this.$id('save').click();

        setTimeout(() => this.newStatus = null);
      },

      'click #-verification': function()
      {
        this.newStatus = 'verification';

        const $solution = this.$id('solution');

        if (!$solution.val().trim().replace(/[^a-zA-Z]+/g, '').length)
        {
          const cleanup = () =>
          {
            $solution.prop('required', false);
          };

          $solution.prop('required', true);
          $solution.one('blur', cleanup);
        }

        this.$id('save').click();

        setTimeout(() => this.newStatus = null, 1);
      },

      'click #-finished': function()
      {
        this.newStatus = 'finished';

        const $solution = this.$id('solution');

        if (!$solution.val().trim().replace(/[^a-zA-Z]+/g, '').length)
        {
          const cleanup = () =>
          {
            $solution.prop('required', false);
          };

          $solution.prop('required', true);
          $solution.one('blur', cleanup);
        }

        this.$id('save').click();

        setTimeout(() => this.newStatus = null, 1);
      },

      'click #-paused': function()
      {
        this.newStatus = 'paused';

        const $comment = this.$id('comment');

        if (!$comment.val().trim().replace(/[^a-zA-Z]+/g, '').length)
        {
          const cleanup = () =>
          {
            $comment.prop('required', false);
          };

          $comment.prop('required', true);
          $comment.one('blur', cleanup);
        }

        this.$id('save').click();

        setTimeout(() => this.newStatus = null, 1);
      },

      'click #-cancelled': function()
      {
        this.newStatus = 'cancelled';

        const $comment = this.$id('comment');

        if (!$comment.val().trim().replace(/[^a-zA-Z]+/g, '').length)
        {
          const cleanup = () =>
          {
            $comment.prop('required', false);
          };

          $comment.prop('required', true);
          $comment.one('blur', cleanup);
        }

        this.$id('save').click();

        setTimeout(() => this.newStatus = null, 1);
      }

    }, FormView.prototype.events),

    getTemplateData: function()
    {
      return {
        today: time.getMoment().format('YYYY-MM-DD'),
        kinds: dictionaries.kinds.map(kind => ({
          value: kind.id,
          label: kind.getLabel({long: true}),
          title: kind.get('description')
        })).sort((a, b) => a.label.localeCompare(b.label)),
        can: {
          inProgress: Kaizen.can.inProgress(this.model),
          verification: Kaizen.can.verification(this.model),
          finished: Kaizen.can.finished(this.model),
          paused: Kaizen.can.paused(this.model),
          cancelled: Kaizen.can.cancelled(this.model)
        },
        relation: this.options.relation
      };
    },

    serializeToForm: function()
    {
      const formData = this.model.toJSON();

      if (formData.plannedAt)
      {
        formData.plannedAt = time.utc.format(formData.plannedAt, 'YYYY-MM-DD');
      }

      delete formData.coordinators;
      delete formData.attachments;
      delete formData.users;
      delete formData.changes;

      return formData;
    },

    serializeForm: function(formData)
    {
      if (this.newStatus)
      {
        formData.status = this.newStatus;
      }

      formData.userWorkplace = this.$id('userWorkplace').select2('data').id;
      formData.userDivision = this.$id('userDivision').select2('data').id;
      formData.implementers = setUpUserSelect2.getUserInfo(this.$id('implementers'));

      const relation = this.options.relation;

      if (relation)
      {
        formData.relation = {
          _id: relation.id,
          rid: relation.get('rid'),
          type: relation.getModelType()
        };
      }
      else
      {
        formData.workplace = this.$id('workplace').select2('data').id;
        formData.division = this.$id('division').select2('data').id;
        formData.building = this.$id('building').select2('data').id;
        formData.location = this.$id('location').select2('data').id;
        formData.station = parseInt(this.$id('station').val(), 10) || null;
      }

      const $plannedAt = this.$id('plannedAt');

      if ($plannedAt.length && !$plannedAt.prop('disabled'))
      {
        formData.plannedAt = formData.plannedAt
          ? time.utc.getMoment(formData.plannedAt, 'YYYY-MM-DD').toISOString()
          : null;
      }
      else
      {
        delete formData.plannedAt;
      }

      return formData;
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
      this.setUpEventCategorySelect2();
      this.setUpImplementersSelect2();
      this.toggleKind();
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
        !this.options.editMode || Kaizen.can.manage() || this.model.isCoordinator()
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
          && (!this.options.editMode || Kaizen.can.manage() || this.model.isCoordinator())
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
          && (!this.options.editMode || Kaizen.can.manage() || this.model.isCoordinator())
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
          && (!this.options.editMode || Kaizen.can.manage() || this.model.isCoordinator())
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
          && (!this.options.editMode || Kaizen.can.manage() || this.model.isCoordinator())
      );
    },

    setUpEventCategorySelect2: function()
    {
      const $input = this.$id('eventCategory');
      const kind = +this.$('input[name="kind"]:checked').val() || this.model.get('kind');
      const map = {};

      dictionaries.eventCategories.forEach(model =>
      {
        if (!model.get('active') || !model.hasKind(kind))
        {
          return;
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          description: model.get('description'),
          model
        };
      });

      const currentId = this.model.get('eventCategory');
      const currentModel = dictionaries.eventCategories.get(currentId);

      if (currentId && !map[currentId])
      {
        if (!currentModel)
        {
          map[currentId] = {
            id: currentId,
            text: `?${currentId}?`
          };
        }
        else if (currentModel.hasKind(kind))
        {
          map[currentId] = {
            id: currentId,
            text: currentModel.getLabel({long: true}),
            description: currentModel.get('description'),
            model: currentModel
          };
        }
      }

      const data = Object.values(map).sort((a, b) => a.text.localeCompare(b.text));

      $input.select2({
        width: '100%',
        allowClear: false,
        placeholder: ' ',
        data,
        dropdownCssClass: 'select2-with-description',
        formatResult: formatResultWithDescription.bind(null, 'text', 'description')
      });

      if (data.length === 1)
      {
        $input.val(data[0].id).select2('data', data[0]);
      }
    },

    setUpImplementersSelect2: function()
    {
      const privileged = this.model.isCoordinator() || Kaizen.can.manage();
      const $input = this.$id('implementers');

      setUpUserSelect2($input, {
        width: '100%',
        multiple: true,
        maximumSelectionSize: 2
      });

      const creator = this.model.get('creator') || currentUser.getInfo();
      const helper = (this.model.get('implementers') || []).find(u => u.id !== creator.id);

      const data = [{
        id: creator.id,
        text: creator.label,
        locked: !privileged
      }];

      if (helper)
      {
        data.push({
          id: helper.id,
          text: helper.label
        });
      }

      $input
        .select2('data', data)
        .select2('enable', !this.options.editMode || privileged);

      const $plannedAt = this.$id('plannedAt');

      if ($plannedAt.length)
      {
        $plannedAt.prop('disabled', !!$plannedAt.val() && !privileged);
      }
    },

    toggleKind: function()
    {
      const $kinds = this.$('input[name="kind"]');

      if ($kinds.length && !$kinds.filter(':checked').length)
      {
        $kinds.first().click();
      }

      $kinds.prop('disabled', !Kaizen.can.editKind(this.model, this.options.editMode));
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

    onDialogShown: function()
    {
      this.$id('subject').focus();
    }

  });
});
