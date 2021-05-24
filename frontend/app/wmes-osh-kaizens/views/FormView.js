// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/time',
  'app/viewport',
  'app/core/util/formatResultWithDescription',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/util/userInfoDecorator',
  'app/wmes-osh-common/views/FormView',
  '../Kaizen',
  'app/wmes-osh-kaizens/templates/form'
], function(
  _,
  currentUser,
  time,
  viewport,
  formatResultWithDescription,
  setUpUserSelect2,
  dictionaries,
  userInfoDecorator,
  FormView,
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
        this.$id('userDepartment').val('');

        this.setUpUserDepartmentSelect2();
      },

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

      'change input[name="kind"]': function()
      {
        this.$id('kaizenCategory').val('');

        this.setUpKaizenCategorySelect2();
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
      },

      'change input[name="kom"]': function(e)
      {
        if (e.target.checked)
        {
          this.$(`input[name="kom"][value="${e.target.value === '1' ? 2 : 1}"]`).prop('checked', false);
        }

        this.updateRewardPlaceholder();

        this.$id('reward').val('').focus();
      }

    }, FormView.prototype.events),

    getTemplateData: function()
    {
      return {
        today: time.getMoment().format('YYYY-MM-DD'),
        kinds: dictionaries.kinds.serialize('kaizen', this.model.get('kind')),
        can: {
          inProgress: Kaizen.can.inProgress(this.model),
          verification: Kaizen.can.verification(this.model),
          finished: Kaizen.can.finished(this.model),
          paused: Kaizen.can.paused(this.model),
          cancelled: Kaizen.can.cancelled(this.model)
        },
        relation: this.options.relation,
        komIcons: Kaizen.KOM_ICONS
      };
    },

    serializeToForm: function()
    {
      const formData = this.model.toJSON();

      if (formData.plannedAt)
      {
        formData.plannedAt = time.utc.format(formData.plannedAt, 'YYYY-MM-DD');
      }

      if (!formData.reward)
      {
        formData.reward = '';
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

      const userWorkplace = this.$id('userWorkplace').select2('data');

      formData.userDivision = userWorkplace.model.get('division');
      formData.userWorkplace = userWorkplace.id;
      formData.userDepartment = this.$id('userDepartment').select2('data').id;
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
        const workplace = this.$id('workplace').select2('data');

        formData.division = workplace.model.get('division');
        formData.workplace = workplace.id;
        formData.department = this.$id('department').select2('data').id;
        formData.building = this.$id('building').select2('data').id;
        formData.location = this.$id('location').select2('data').id;
        formData.station = parseInt(this.$id('station').val(), 10) || 0;
      }

      formData.kaizenCategory = this.$id('kaizenCategory').select2('data').id;

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

      if (formData.kind)
      {
        formData.kind = parseInt(formData.kind, 10);
      }

      if (this.$('input[name="kom"]').length)
      {
        formData.kom = parseInt(formData.kom, 10) || 0;

        if (formData.reward >= 0)
        {
          formData.reward = (Math.round(parseFloat(formData.reward) * 100) / 100);
        }
        else
        {
          formData.reward = this.getDefaultRewardAmount();
        }
      }
      else
      {
        formData.kom = 0;
        formData.reward = 0;
      }

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpUserWorkplaceSelect2();
      this.setUpUserDepartmentSelect2();
      this.setUpWorkplaceSelect2();
      this.setUpDepartmentSelect2();
      this.setUpBuildingSelect2();
      this.setUpLocationSelect2();
      this.setUpStationSelect2();
      this.setUpKaizenCategorySelect2();
      this.setUpImplementersSelect2();
      this.toggleKind();
      this.updateRewardPlaceholder();
    },

    setUpUserWorkplaceSelect2: function()
    {
      const $input = this.$id('userWorkplace');

      if (this.options.editMode)
      {
        const currentId = this.model.get('creator').oshWorkplace;
        const current = dictionaries.workplaces.get(currentId);

        $input.val(currentId).select2({
          width: '100%',
          placeholder: ' ',
          data: !current ? [] : [{
            id: currentId,
            text: current ? current.getLabel({long: true}) : `?${currentId}?`,
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

    setUpUserDepartmentSelect2: function()
    {
      const $input = this.$id('userDepartment');

      if (this.options.editMode)
      {
        const currentId = this.model.get('creator').oshDepartment;
        const current = dictionaries.departments.get(currentId);

        $input.val(currentId).select2({
          width: '100%',
          placeholder: ' ',
          data: !current ? [] : [{
            id: currentId,
            text: current ? current.getLabel({long: true}) : `?${currentId}?`,
            model: current
          }]
        });

        $input.select2('enable', false);

        return;
      }

      const currentWorkplaceId = +this.$id('userWorkplace').val();
      let currentDepartment = dictionaries.departments.get(+$input.val());

      if (currentDepartment)
      {
        currentDepartment = {
          id: currentDepartment.id,
          text: currentDepartment.getLabel({long: true}),
          model: currentDepartment
        };
      }

      const map = {};

      dictionaries.departments.forEach(model =>
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

      if (currentDepartment
        && !map[currentDepartment.id]
        && currentDepartment.model.get('workplace') === currentWorkplaceId)
      {
        map[currentDepartment.id] = currentDepartment;
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

      const userDepartment = dictionaries.departments.get(currentUser.data.oshDepartment);

      if (this.options.editMode && currentDepartment)
      {
        $input.select2('enable', false).select2('data', currentDepartment);

        return;
      }

      if (userDepartment)
      {
        $input.select2('enable', false).select2('data', {
          id: userDepartment.id,
          text: userDepartment.getLabel({long: true}),
          model: userDepartment
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

      if (!$input.val() && currentUser.data.oshWorkplace && !this.options.editMode)
      {
        $input.val(currentUser.data.oshWorkplace);
      }

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

    setUpDepartmentSelect2: function()
    {
      const $input = this.$id('department');

      if (!$input.val() && currentUser.data.oshDepartment && !this.options.editMode)
      {
        $input.val(currentUser.data.oshDepartment);
      }

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

      $input.select2(
        'enable',
        !!currentWorkplaceId
          && (!this.options.editMode || Kaizen.can.manage() || this.model.isCoordinator())
      );
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
        data
      });

      if (data.length === 1)
      {
        $input.select2('data', data[0]);
      }

      $input.select2(
        'enable',
        !!currentDepartmentId
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

      if (!this.options.editMode && data.length === 1)
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

    setUpKaizenCategorySelect2: function()
    {
      const $input = this.$id('kaizenCategory');
      const kind = +this.$('input[name="kind"]:checked').val() || this.model.get('kind');
      const map = {};

      dictionaries.kaizenCategories.forEach(model =>
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

      const currentId = this.model.get('kaizenCategory');
      const currentModel = dictionaries.kaizenCategories.get(currentId);

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
        maximumSelectionSize: 2,
        noPersonnelId: true,
        userInfoDecorators: [userInfoDecorator]
      });

      const data = [];

      if (this.options.editMode)
      {
        (this.model.get('implementers') || []).forEach(user =>
        {
          data.push({
            id: user.id,
            text: user.label,
            user
          });
        });
      }
      else
      {
        const creator = this.model.get('creator') || userInfoDecorator(currentUser.getInfo(), currentUser.data);
        const helper = (this.model.get('implementers') || []).find(u => u.id !== creator.id);

        data.push({
          id: creator.id,
          text: creator.label,
          locked: !privileged,
          user: creator
        });

        if (helper)
        {
          data.push({
            id: helper.id,
            text: helper.label,
            user: helper
          });
        }
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

    updateRewardPlaceholder: function()
    {
      this.$id('reward').attr('placeholder', this.getDefaultRewardAmount().toLocaleString());
    },

    getDefaultRewardAmount: function()
    {
      const kom = this.$('input[name="kom"]:checked').val();
      const setting = kom === '1' ? 'nom' : kom === '2' ? 'kom' : 'default';
      const amount = dictionaries.settings.getValue(`rewards.kaizens.${setting}`, 0);

      return amount;
    },

    getFailureText: function(jqXhr)
    {
      const {code} = jqXhr.responseJSON && jqXhr.responseJSON.error || {};

      if (this.t.has(`FORM:ERROR:${code}`))
      {
        return this.t(`FORM:ERROR:${code}`);
      }

      return FormView.prototype.getFailureText.apply(this, arguments);
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
