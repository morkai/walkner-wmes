// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/time',
  'app/viewport',
  'app/core/util/formatResultWithDescription',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/util/userInfoDecorator',
  'app/wmes-osh-common/views/FormView',
  'app/wmes-osh-kaizens/Kaizen',
  'app/wmes-osh-kaizens/views/FormView',
  'app/wmes-osh-actions/Action',
  'app/wmes-osh-actions/views/FormView',
  '../NearMiss',
  'app/wmes-osh-nearMisses/templates/form',
  'app/wmes-osh-nearMisses/templates/resolutionPopover'
], function(
  _,
  $,
  currentUser,
  time,
  viewport,
  formatResultWithDescription,
  setUpUserSelect2,
  dictionaries,
  userInfoDecorator,
  FormView,
  Kaizen,
  KaizenFormView,
  Action,
  ActionFormView,
  NearMiss,
  template,
  resolutionPopoverTemplate
) {
  'use strict';

  return FormView.extend({

    template,

    dialogClassName: 'osh-entries-form-dialog',

    events: Object.assign({

      'change #-anonymous': function()
      {
        this.setUpUserWorkplaceSelect2();
        this.setUpUserDepartmentSelect2();
        this.toggleImplement();
        this.toggleCreator();
      },

      'change #-selfImplement': function()
      {
        this.toggleImplement();
      },

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
        this.toggleActionResolution();
      },

      'change #-attachments': function()
      {
        const $attachments = this.$id('attachments');
        const max = this.options.editMode ? 5 : 2;

        $attachments[0].setCustomValidity(
          $attachments[0].files.length > max ? this.t('FORM:ERROR:tooManyFiles', {max}) : ''
        );
      },

      'click #-inProgress': function()
      {
        this.newStatus = 'inProgress';

        const $implementer = this.$id('implementer');
        const $plannedAt = this.$id('plannedAt');
        const $resolutionTypes = this.$('input[name="resolution.type"]');

        if (!$implementer.select2('data')
          || !$plannedAt.val()
          || $resolutionTypes.filter(':checked').val() === 'unspecified')
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

            $resolutionTypes.first()[0].setCustomValidity('');
          });

          $implementer.prop('required', true)
            .one('select2-blur', cleanup)
            .closest('.form-group')
            .addClass('has-required-select2');

          $plannedAt.prop('required', true)
            .one('blur', cleanup);

          $resolutionTypes.first()[0].setCustomValidity(this.t('FORM:resolution:required'));
          $resolutionTypes.one('blur', cleanup);
        }

        this.$id('save').click();

        setTimeout(() => this.newStatus = null);
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

      'change input[name="resolution.type"]': function()
      {
        this.setUpResolution();
      },

      'mousedown #-showResolution': function(e)
      {
        if (e.button === 1)
        {
          e.preventDefault();
        }
      },

      'mouseup #-showResolution': function(e)
      {
        if (e.button !== 1)
        {
          return;
        }

        if (this.resolution._id)
        {
          window.open(`/#osh/${this.resolution.type}s/${this.resolution._id}`, '_blank');
        }
        else if (this.resolution.rid)
        {
          this.$id('save').click();
        }

        return false;
      },

      'click #-showResolution': function(e)
      {
        if (e.ctrlKey && this.resolution._id)
        {
          window.open(`/#osh/${this.resolution.type}s/${this.resolution._id}`, '_blank');

          return;
        }

        this.showResolutionPopover(
          this.getResolutionType(),
          this.$id('resolutionId').val().trim()
        );
      },

      'input #-resolutionId': function()
      {
        this.resetResolution();
      },

      'change #-resolutionId': function()
      {
        this.loadResolution();
      },

      'click #-addResolution': function()
      {
        this.showAddResolutionDialog();
      },

      'change input[name="eventTime"]': function()
      {
        const $eventTime = this.$id('eventTime');
        const matches = $eventTime.val().match(/([0-9]{1,2})(?::([0-9]{1,2}))/) || [null, '00', '00'];
        const h = parseInt(matches[1], 10);
        const m = parseInt(matches[2], 10);
        const hh = h >= 0 && h < 24 ? h.toString().padStart(2, '0') : '00';
        const mm = m >= 0 && m < 60 ? m.toString().padStart(2, '0') : '00';

        $eventTime.val(`${hh}:${mm}`);
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.resolution = {
        added: {},
        type: 'unspecified',
        _id: 0,
        rid: '',
        data: null,
        req: null
      };

      this.listenToOnce(this.model, 'change:resolution', () =>
      {
        Object.assign(this.resolution, this.model.get('resolution'));
      });

      $(document)
        .on(`click.${this.idPrefix}`, this.onDocumentClick.bind(this))
        .on(`keydown.${this.idPrefix}`, this.onDocumentKeyDown.bind(this));
    },

    destroy: function()
    {
      FormView.prototype.destroy.apply(this, arguments);

      $(document).off(`.${this.idPrefix}`);

      this.resetResolution();
    },

    getResolutionType: function()
    {
      return this.$('input[name="resolution.type"]:checked').val() || 'unspecified';
    },

    getTemplateData: function()
    {
      return {
        today: time.getMoment().format('YYYY-MM-DD'),
        kinds: dictionaries.kinds.serialize('nearMiss', this.model.get('kind')),
        priorities: dictionaries.priorities.map(priority => ({
          value: priority,
          label: dictionaries.getLabel('priority', priority)
        })),
        resolutionTypes: this.getResolutionTypes(),
        can: {
          inProgress: NearMiss.can.inProgress(this.model),
          paused: NearMiss.can.paused(this.model),
          cancelled: NearMiss.can.cancelled(this.model),
          editResolutionType: NearMiss.can.editResolutionType(this.model),
          editResolutionId: NearMiss.can.editResolutionId(this.model)
        },
        relation: this.options.relation
      };
    },

    getResolutionTypes: function()
    {
      if (!this.options.editMode)
      {
        return [];
      }

      const resolutionTypes = ['action', 'kaizen'];

      if (this.model.get('status') === 'new')
      {
        resolutionTypes.unshift('unspecified');
      }

      return resolutionTypes;
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

      if (formData.plannedAt)
      {
        formData.plannedAt = time.utc.format(formData.plannedAt, 'YYYY-MM-DD');
      }

      if (!(formData.priority >= 0))
      {
        formData.priority = 1;
      }

      if (!formData.resolution)
      {
        formData.resolution = {
          _id: 0,
          rid: '',
          type: 'unspecified'
        };
      }
      else
      {
        formData.resolution = _.clone(formData.resolution);
      }

      if (!formData.resolution.rid)
      {
        formData.resolution.rid = '';
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

      formData.eventDate = time.utc.getMoment(
        `${formData.eventDate} ${formData.eventTime || '00:00'}:00`,
        'YYYY-MM-DD HH:mm:ss'
      ).toISOString();

      delete formData.eventTime;

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
        formData.implementer = formData.selfImplement && !formData.anonymous
          ? userInfoDecorator(currentUser.getInfo(), currentUser.data)
          : null;
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

      const resolution = this.model.get('resolution') || {
        _id: 0,
        rid: '',
        type: 'unspecified'
      };

      if (NearMiss.can.editResolutionType(this.model))
      {
        resolution.type = this.getResolutionType();
      }

      if (NearMiss.can.editResolutionId(this.model))
      {
        resolution._id = this.resolution._id;
        resolution.rid = this.resolution.rid;
      }

      formData.resolution = resolution;

      if (formData.kind)
      {
        formData.kind = parseInt(formData.kind, 10);
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
      this.setUpImplementerSelect2();
      this.setUpEventCategorySelect2();
      this.setUpReasonCategorySelect2();
      this.setUpResolution();
      this.setUpEventDate();
      this.togglePriority();
      this.toggleImplement();
      this.toggleKind();
    },

    onDialogShown: function()
    {
      this.$id('subject').select();
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
        !this.options.editMode || NearMiss.can.manage() || this.model.isCoordinator()
      );
    },

    setUpDepartmentSelect2: function()
    {
      const $input = this.$id('department');

      const currentWorkplaceId = +this.$id('workplace').val();
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
          && (!this.options.editMode || NearMiss.can.manage() || this.model.isCoordinator())
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
          && (!this.options.editMode || NearMiss.can.manage() || this.model.isCoordinator())
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
          && (!this.options.editMode || NearMiss.can.manage() || this.model.isCoordinator())
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
          && (!this.options.editMode || NearMiss.can.manage() || this.model.isCoordinator())
      );
    },

    setUpImplementerSelect2: function()
    {
      setUpUserSelect2(this.$id('implementer'), {
        width: '100%',
        noPersonnelId: true,
        userInfoDecorators: [userInfoDecorator],
        currentUserInfo: this.model.get('implementer')
      });
    },

    setUpEventCategorySelect2: function()
    {
      const $input = this.$id('eventCategory');
      const kind = this.$('input[name="kind"]:checked').val();
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

    setUpResolution: function()
    {
      if (!this.options.editMode)
      {
        return;
      }

      this.hideResolutionPopover();

      const resolution = this.model.get('resolution');
      const resolutionType = this.getResolutionType();
      const $group = this.$id('resolutionGroup');

      let id = '';
      let enabled = NearMiss.can.editResolutionId(this.model);

      if (enabled && resolutionType === 'unspecified')
      {
        enabled = false;
      }

      $group.find('.control-label').text(this.t(`FORM:resolution:${resolutionType}`));
      $group.find('input, button').prop('disabled', !enabled);

      if (enabled && this.resolution.added[resolutionType])
      {
        id = this.resolution.added[resolutionType].toString();
      }
      else if (resolutionType === resolution.type && resolution.rid)
      {
        id = resolution.rid;
      }

      this.$id('resolutionId').val(id)[0].setCustomValidity('');

      this.toggleActionResolution();
    },

    toggleActionResolution: function()
    {
      const $type = this.$('input[name="resolution.type"][value="action"]');

      if (!$type.length)
      {
        return;
      }

      const eventCategory = dictionaries.eventCategories.get(+this.$id('eventCategory').val());
      let label = this.t('resolution:desc:action');

      if (eventCategory && eventCategory.get('activityKind'))
      {
        const activityKind = dictionaries.activityKinds.get(eventCategory.get('activityKind'));

        if (activityKind)
        {
          label = activityKind.getLabel({long: true});
        }
      }

      $type[0].nextSibling.textContent = label;
    },

    setUpEventDate: function()
    {
      clearTimeout(this.timers.maxEventDate);

      const delay = time.getMoment().add(1, 'days').startOf('day').valueOf() - Date.now() + 1000;

      this.timers.maxEventDate = setTimeout(
        () =>
        {
          this.$id('eventDate').prop('max', time.format(Date.now(), 'YYYY-MM-DD'));
          this.setUpEventDate();
        },
        Math.min(delay, 60000)
      );
    },

    toggleKind: function()
    {
      const $kinds = this.$('input[name="kind"]');

      if ($kinds.length && !$kinds.filter(':checked').length)
      {
        $kinds.first().click();
      }

      $kinds.prop('disabled', !NearMiss.can.editKind(this.model, this.options.editMode));
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
      const isCoordinator = this.model.isCoordinator();

      if ($implementer.length)
      {
        $implementer.select2('enable', canManage || isCoordinator);
      }

      if (this.options.editMode)
      {
        $plannedAt.prop('disabled', !canManage && !isCoordinator);
      }
      else
      {
        $plannedAt.val('').prop('disabled', !$selfImplement.prop('checked'));
      }
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

        view.showErrorMessage(view.t('wmes-osh-common', 'FORM:ERROR:upload'));

        $submitEl.attr('disabled', false);
      });
    },

    toggleActions: function(enabled)
    {
      this.$('.form-actions .btn').prop('disabled', !enabled);
    },

    showResolutionPopover: function(type, rid)
    {
      if (type !== this.resolution.type
        || rid !== this.resolution.rid
        || !this.resolution.data)
      {
        return this.loadResolution(type, rid, true);
      }

      if (!this.resolution.rid)
      {
        this.$id('resolutionId').focus();

        return;
      }

      if (!this.resolution.data)
      {
        this.$id('save').click();

        return;
      }

      if (this.$id('showResolution').data('bs.popover'))
      {
        return;
      }

      const $btn = this.$id('showResolution').popover({
        container: this.$id('resolutionGroup'),
        trigger: 'click',
        placement: 'top',
        html: true,
        title: function() { return ''; },
        content: this.renderPartialHtml(resolutionPopoverTemplate, this.resolution)
      }).popover('show');

      $btn.prop('title', $btn[0].dataset.originalTitle);
    },

    hideResolutionPopover: function()
    {
      this.$id('showResolution').popover('destroy');
    },

    resetResolution: function()
    {
      if (!this.options.editMode)
      {
        return;
      }

      this.$id('resolutionId')[0].setCustomValidity('');
      this.hideResolutionPopover();

      const req = this.resolution.req;

      this.resolution.type = 'unspecified';
      this.resolution._id = 0;
      this.resolution.rid = '';
      this.resolution.data = null;
      this.resolution.req = null;

      if (req)
      {
        req.abort();
      }
    },

    loadResolution: function(type, rid, show)
    {
      if (!type)
      {
        type = this.getResolutionType();
      }

      if (!rid)
      {
        rid = this.$id('resolutionId').val();
      }

      const matches = rid.trim().match(/([akAK]-)?([0-9]{4}-)?([0-9]{1,6})/);

      rid = '';

      if (matches)
      {
        rid += (matches[1] || type).charAt(0).toUpperCase();
        rid += '-' + (matches[2] || time.format(Date.now(), 'YYYY')).substring(0, 4);
        rid += '-' + matches[3].padStart(6, '0');

        this.$id('resolutionId').val(rid);
      }

      this.resetResolution();

      if (!rid)
      {
        this.$id('resolutionId').val('');

        return;
      }

      const $btn = this.$id('showResolution').prop('disabled', true);

      this.toggleActions(false);

      const req = this.resolution.req = this.ajax({
        url: `/osh/${dictionaries.TYPE_TO_MODULE[type]}/${rid}?select(subject,status)`
      });

      req.fail(() =>
      {
        if (req.status !== 404)
        {
          this.$id('resolutionId')[0].setCustomValidity(this.t('FORM:resolution:failure'));

          return viewport.msg.loadingFailed();
        }

        viewport.msg.loaded();

        this.resolution.type = type;
        this.resolution.rid = rid;

        this.$id('resolutionId')[0].setCustomValidity(this.t('FORM:resolution:notFound'));
      });

      req.done(data =>
      {
        viewport.msg.loaded();

        this.$id('resolutionId')[0].setCustomValidity('');

        this.resolution.type = type;
        this.resolution._id = data._id;
        this.resolution.rid = rid;
        this.resolution.data = data;

        if (show)
        {
          this.showResolutionPopover(type, rid);
        }
      });

      req.always(() =>
      {
        if (this.resolution.req === req)
        {
          this.resolution.req = null;

          $btn.prop('disabled', false);

          this.toggleActions(true);
        }
      });
    },

    showAddResolutionDialog: function()
    {
      if (!this.el.checkValidity())
      {
        return this.$id('save').click();
      }

      const formData = Object.assign(this.model.toJSON(), this.getFormData());
      const type = this.getResolutionType();

      let dialogView = null;

      if (type === 'kaizen')
      {
        dialogView = new KaizenFormView({
          relation: this.model,
          newStatus: 'inProgress',
          model: new Kaizen({
            subject: formData.subject,
            kind: formData.kind,
            division: formData.division,
            workplace: formData.workplace,
            department: formData.department,
            building: formData.building,
            location: formData.location,
            station: formData.station,
            eventCategory: formData.eventCategory,
            problem: formData.problem,
            reason: formData.reason,
            suggestion: formData.suggestion,
            plannedAt: formData.plannedAt,
            implementers: formData.implementer ? [formData.implementer] : []
          })
        });
      }
      else if (type === 'action')
      {
        dialogView = new ActionFormView({
          relation: this.model,
          newStatus: 'inProgress',
          forcedActivityKind: dictionaries.eventCategories.get(formData.eventCategory).get('activityKind'),
          model: new Action({
            subject: formData.subject,
            kind: formData.kind,
            division: formData.division,
            workplace: formData.workplace,
            department: formData.department,
            building: formData.building,
            location: formData.location,
            station: formData.station,
            problem: formData.problem,
            reason: formData.reason,
            suggestion: formData.suggestion,
            plannedAt: formData.plannedAt,
            implementers: formData.implementer ? [formData.implementer] : []
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
        this.resolution.added[type] = dialogView.model.get('rid');
        this.resolution.type = type;
        this.resolution._id = dialogView.model.id;
        this.resolution.rid = dialogView.model.get('rid');
        this.resolution.data = dialogView.model.toJSON();

        this.$id('resolutionId').val(this.resolution.rid).trigger('change');

        viewport.closeDialog();
      };
    },

    onDocumentClick: function(e)
    {
      if (!this.$(e.target).closest(`#${this.idPrefix}-resolutionGroup`).length)
      {
        this.hideResolutionPopover();
      }
    },

    onDocumentKeyDown: function(e)
    {
      if (e.key === 'Escape')
      {
        if (this.$id('showResolution').data('bs.popover'))
        {
          this.hideResolutionPopover();

          return false;
        }
      }
    }

  });
});
