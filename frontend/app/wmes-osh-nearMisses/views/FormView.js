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
  '../NearMiss',
  'app/wmes-osh-nearMisses/templates/form'
], function(
  _,
  currentUser,
  time,
  viewport,
  FormView,
  formatResultWithDescription,
  setUpUserSelect2,
  dictionaries,
  NearMiss,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    events: Object.assign({

      'change #-anonymous': function()
      {
        this.setUpUserWorkplaceSelect2();
        this.setUpUserDivisionSelect2();
        this.toggleImplement();
        this.toggleCreator();
      },

      'change #-selfImplement': function()
      {
        this.toggleImplement();
      },

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

        this.setUpDivisionSelect2();
        this.setUpBuildingSelect2();
        this.setUpLocationSelect2();
      },

      'change #-division': function()
      {
        this.$id('building').val('');
        this.$id('location').val('');

        this.setUpBuildingSelect2();
        this.setUpLocationSelect2();
      },

      'change #-building': function()
      {
        this.$id('location').val('');

        this.setUpLocationSelect2();
      },

      'change input[name="kind"]': function()
      {
        this.$id('eventCategory').val('');
        this.$id('reasonCategory').val('');

        this.setUpEventCategorySelect2();
        this.setUpReasonCategorySelect2();
        this.togglePriority();
      },

      'change #-eventCategory': function()
      {
        this.$id('reasonCategory').val('');

        this.setUpReasonCategorySelect2();
      },

      'change #-attachments': function()
      {
        const $attachments = this.$id('attachments');
        const max = this.options.editMode ? 5 : 2;

        $attachments[0].setCustomValidity(
          $attachments[0].files.length > max ? this.t('FORM:ERROR:tooManyFiles', {max}) : ''
        );
      },

      'click #-todo': function()
      {
        this.newStatus = 'inProgress';

        const $implementer = this.$id('implementer');
        const $plannedAt = this.$id('plannedAt');

        if (!$implementer.select2('data') || !$plannedAt.val())
        {
          const oldRequiredImplementer = $implementer.prop('required');
          const oldRequiredPlannedAt = $plannedAt.prop('required');

          const cleanup = _.once(() =>
          {
            if (!oldRequiredImplementer)
            {
              $implementer.prop('required', false)
                .closest('.form-group')
                .removeClass('has-required-select2');
            }

            $plannedAt.prop('required', oldRequiredPlannedAt);
          });

          $implementer.prop('required', true)
            .one('select2-blur', cleanup)
            .closest('.form-group')
            .addClass('has-required-select2');

          $plannedAt.prop('required', true)
            .one('blur', cleanup);
        }

        this.$id('save').click();

        setTimeout(() => this.newStatus = null);
      },

      'click #-pause': function()
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

      'click #-cancel': function()
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
        priorities: dictionaries.priorities.map(priority => ({
          value: priority,
          label: dictionaries.getLabel('priority', priority)
        })),
        can: {
          todo: NearMiss.can.todo(this.model),
          pause: NearMiss.can.pause(this.model),
          cancel: NearMiss.can.cancel(this.model)
        }
      };
    },

    serializeToForm: function()
    {
      const formData = this.model.toJSON();

      if (this.options.editMode)
      {
        const eventDate = time.utc.getMoment(formData.eventDate);

        formData.eventDate = eventDate.format('YYYY-MM-DD');
        formData.eventTime = eventDate.format('H');
      }
      else
      {
        const now = time.getMoment();

        formData.eventDate = now.format('YYYY-MM-DD');
        formData.eventTime = now.format('H');
      }

      if (formData.plannedAt)
      {
        formData.plannedAt = time.utc.format(formData.plannedAt, 'YYYY-MM-DD');
      }

      if (!(formData.priority >= 0))
      {
        formData.priority = 1;
      }

      return formData;
    },

    serializeForm: function(formData)
    {
      if (this.newStatus)
      {
        formData.status = this.newStatus;
      }

      formData.workplace = this.$id('workplace').select2('data').id;
      formData.division = this.$id('division').select2('data').id;
      formData.building = this.$id('building').select2('data').id;
      formData.location = this.$id('location').select2('data').id;

      const division = dictionaries.divisions.get(formData.division);

      formData.manager = division.get('manager') || null;

      formData.eventDate = time.utc.getMoment(
        `${formData.eventDate} ${(formData.eventTime || '00').padStart(2, '0')}:00:00`,
        'YYYY-MM-DD HH:mm:ss'
      ).toISOString();

      const eventCategory = dictionaries.eventCategories.get(formData.eventCategory);
      const reasonCategory = dictionaries.reasonCategories.get(formData.reasonCategory);

      formData.eventCategory = eventCategory.id;
      formData.reasonCategory = reasonCategory ? reasonCategory.id : null;
      formData.materialLoss = eventCategory.get('materialLoss');

      if (this.options.editMode)
      {
        formData.implementer = setUpUserSelect2.getUserInfo(this.$id('implementer'));
      }
      else
      {
        formData.implementer = formData.selfImplement && !formData.anonymous ? currentUser.getInfo() : null;
        formData.selfImplement = undefined;
      }

      if (this.$id('plannedAt').prop('disabled'))
      {
        delete formData.plannedAt;
      }
      else if (formData.plannedAt)
      {
        formData.plannedAt = time.utc.getMoment(formData.plannedAt, 'YYYY-MM-DD').toISOString();
      }
      else
      {
        formData.plannedAt = null;
      }

      if (typeof formData.priority === 'string')
      {
        formData.priority = +formData.priority;
      }

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
      this.setUpImplementerSelect2();
      this.setUpEventCategorySelect2();
      this.setUpReasonCategorySelect2();
      this.togglePriority();
      this.toggleImplement();

      const $kinds = this.$('input[name="kind"]');

      if ($kinds.length && !$kinds.filter(':checked').length)
      {
        $kinds.first().click();
      }
    },

    isAnonymous: function()
    {
      return this.$id('anonymous').prop('checked');
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

      if (this.isAnonymous())
      {
        $input.val('').select2({
          width: '100%',
          placeholder: ' ',
          data: []
        });

        $input
          .select2('enable', false)
          .prop('required', false)
          .closest('.form-group')
          .removeClass('has-required-select2')
          .find('.control-label')
          .removeClass('is-required');

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

      if (this.isAnonymous())
      {
        $input.val('').select2({
          width: '100%',
          placeholder: ' ',
          data: []
        });

        $input
          .select2('enable', false)
          .prop('required', false)
          .closest('.form-group')
          .removeClass('has-required-select2')
          .find('.control-label')
          .removeClass('is-required');

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

      $input.select2('enable', !!currentWorkplaceId);
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

      $input.select2('enable', !!currentDivisionId);
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

      $input.select2('enable', !!currentBuildingId);
    },

    setUpImplementerSelect2: function()
    {
      const $input = this.$id('implementer');

      setUpUserSelect2($input, {
        width: '100%'
      });

      const current = this.model.get('implementer');

      if (current)
      {
        $input.select2('data', {
          id: current.id,
          text: current.label
        });
      }
    },

    setUpEventCategorySelect2: function()
    {
      const $input = this.$id('eventCategory');
      const kind = this.options.editMode
        ? this.model.get('kind')
        : this.$('input[name="kind"]:checked').val();
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

    setUpReasonCategorySelect2: function()
    {
      const $input = this.$id('reasonCategory');
      const eventCategory = this.$id('eventCategory').val() || null;
      const map = {};

      dictionaries.reasonCategories.forEach(model =>
      {
        if (!model.get('active') || !model.hasEventCategory(eventCategory))
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

      const currentId = this.model.get('reasonCategory');
      const currentModel = dictionaries.reasonCategories.get(currentId);

      if (currentId && !map[currentId])
      {
        if (!currentModel)
        {
          map[currentId] = {
            id: currentId,
            text: `?${currentId}?`
          };
        }
        else if (currentModel.hasEventCategory(eventCategory))
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
      let placeholder = ' ';

      if (!eventCategory && data.length === 0)
      {
        placeholder = this.t('FORM:placeholder:noEventCategory');
      }

      $input.select2({
        width: '100%',
        allowClear: true,
        placeholder,
        data,
        dropdownCssClass: 'select2-with-description',
        formatResult: formatResultWithDescription.bind(null, 'text', 'description')
      });

      $input.select2('enable', data.length !== 0);
    },

    togglePriority: function()
    {
      const $priorities = this.$('input[name="priority"]');
      const kind = dictionaries.kinds.get(+this.$('input[name="kind"]:checked').val() || this.model.get('kind'));
      const type = kind ? kind.get('type') : null;
      const enabled = this.options.editMode && (this.model.isCoordinator() || NearMiss.can.manage());
      let value = +$priorities.filter(':checked').val();

      if (!this.options.editMode)
      {
        if (type === 'osh')
        {
          value = 3;
        }
        else
        {
          value = 1;
        }
      }

      $priorities
        .prop('disabled', !enabled)
        .filter(`input[value="${value}"]`)
        .prop('checked', true);

      $priorities
        .closest('.form-group')
        .toggleClass('hidden', !enabled);
    },

    toggleCreator: function()
    {
      this.$id('creator').text(
        this.$id('anonymous').prop('checked') ? this.t('wmes-osh-common', 'anonymous:label') : currentUser.getLabel()
      );
    },

    toggleImplement: function()
    {
      const anonymous = !!this.$id('anonymous').prop('checked');
      const $selfImplement = this.$id('selfImplement');
      const $implementer = this.$id('implementer');
      const $plannedAt = this.$id('plannedAt');

      if ($selfImplement.length)
      {
        if ($selfImplement.prop('checked') && anonymous)
        {
          $selfImplement.prop('checked', false);
        }

        $selfImplement.prop('disabled', anonymous);
        $selfImplement.closest('label').toggleClass('disabled', anonymous);
      }

      const canManage = NearMiss.can.manage();
      const isImplementer = this.model.isImplementer();
      const isCoordinator = this.model.isCoordinator();

      if ($implementer.length)
      {
        $implementer.select2('enable', canManage || isCoordinator);
      }

      if (this.options.editMode)
      {
        $plannedAt.prop('disabled', !canManage && !isImplementer && !isCoordinator);
      }
      else
      {
        $plannedAt.val('').prop('disabled', !$selfImplement.prop('checked'));
      }
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

      if (this.$id('anonymous').prop('checked'))
      {
        uploadFormData.append('anonymous', '1');
      }

      view.$('input[type="file"]').each(function()
      {
        for (let i = 0; i < this.files.length; ++i)
        {
          uploadFormData.append('file', this.files[i]);

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

        view.showErrorMessage(view.t('FORM:ERROR:upload'));

        $submitEl.attr('disabled', false);
      });
    }

  });
});
