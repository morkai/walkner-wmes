// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/time',
  'app/viewport',
  'app/core/util/formatResultWithDescription',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/Resolution',
  'app/wmes-osh-common/util/userInfoDecorator',
  'app/wmes-osh-common/views/FormView',
  'app/wmes-osh-kaizens/Kaizen',
  'app/wmes-osh-kaizens/views/FormView',
  '../Action',
  './ParticipantFinderView',
  'app/wmes-osh-actions/templates/form/form',
  'app/wmes-osh-actions/templates/form/resolutionRow'
], function(
  _,
  currentUser,
  time,
  viewport,
  formatResultWithDescription,
  setUpUserSelect2,
  dictionaries,
  Resolution,
  userInfoDecorator,
  FormView,
  Kaizen,
  KaizenFormView,
  Action,
  ParticipantFinderView,
  template,
  resolutionRowTemplate
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

      'change input[name="kind[]"]': function()
      {
        const oldActivityKind = this.$id('activityKind').val();

        this.$id('activityKind').val('');

        this.setUpActivityKindSelect2(oldActivityKind);
        this.toggleActivityKind();

        this.$('input[name="kind[]"]').first()[0].required = !this.$('input[name="kind[]"]:checked').length;
      },

      'change #-activityKind': function()
      {
        this.toggleActivityKind();
      },

      'change textarea[name*="why"]': function()
      {
        this.checkWhyValidity();
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

      'keydown #-resolutionRid': function(e)
      {
        e.currentTarget.setCustomValidity('');

        if (e.key === 'Enter')
        {
          e.preventDefault();
        }
      },

      'keyup #-resolutionRid': function(e)
      {
        if (e.key === 'Enter')
        {
          this.linkResolution();
        }
      },

      'click #-linkResolution': function()
      {
        this.linkResolution();
      },

      'click .btn[data-action="removeResolution"]': function(e)
      {
        this.resolutions.remove(this.$(e.target).closest('tr')[0].dataset.id);
      },

      'click #-addKaizenResolution': function()
      {
        this.showAddResolutionDialog('kaizen');
      },

      'click #-addActionResolution': function()
      {
        this.showAddResolutionDialog('action');
      },

      'click #-showParticipantFinder': function()
      {
        this.showParticipantFinderDialog();
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.resolutionsI = 0;
      this.newStatus = this.options.newStatus || null;

      this.once('afterRender', () =>
      {
        this.listenTo(this.resolutions, 'add', this.addResolution);
        this.listenTo(this.resolutions, 'remove', this.removeResolution);
      });
    },

    getTemplateData: function()
    {
      return {
        today: time.getMoment().format('YYYY-MM-DD'),
        kinds: dictionaries.kinds.serialize('action', this.model.get('kind')),
        can: {
          inProgress: Action.can.inProgress(this.model),
          verification: Action.can.verification(this.model),
          finished: Action.can.finished(this.model),
          paused: Action.can.paused(this.model),
          cancelled: Action.can.cancelled(this.model)
        },
        relation: !!this.relation,
        rootCauses: this.serializeRootCauses()
      };
    },

    getKinds: function()
    {
      const $kinds = this.$('input[name="kind[]"]');

      if ($kinds.length)
      {
        return $kinds.filter(':checked').get().map(el => +el.value);
      }

      return this.model.get('kind') || [];
    },

    serializeRootCauses: function()
    {
      const rootCauses = this.model.get('rootCauses');

      if (rootCauses && rootCauses.length)
      {
        return rootCauses.map(rootCause =>
        {
          const category = dictionaries.rootCauseCategories.get(rootCause.category);

          if (!category)
          {
            return {
              category: rootCause.category,
              label: `?${rootCause.category}?`,
              description: false,
              why: rootCause.why
            };
          }

          return {
            category: category.id,
            label: category.getLabel({long: true}),
            description: !!category.get('description'),
            why: rootCause.why
          };
        });
      }

      return dictionaries.rootCauseCategories.map(category =>
      {
        return {
          category: category.id,
          label: category.getLabel({long: true}),
          description: !!category.get('description'),
          why: ['', '', '', '', '']
        };
      });
    },

    serializeToForm: function()
    {
      const formData = this.model.toJSON();

      if (formData.plannedAt)
      {
        formData.plannedAt = time.utc.format(formData.plannedAt, 'YYYY-MM-DD');
      }

      formData.rootCauses = this.serializeRootCauses().map(rootCause =>
      {
        return {
          category: rootCause.category,
          why: rootCause.why
        };
      });

      delete formData.coordinators;
      delete formData.attachments;
      delete formData.users;
      delete formData.changes;

      return formData;
    },

    serializeForm: function(formData)
    {
      const features = this.getActivityFeatures();
      const userWorkplace = this.$id('userWorkplace').select2('data');

      formData.userDivision = userWorkplace.model.get('division');
      formData.userWorkplace = userWorkplace.id;
      formData.userDepartment = this.$id('userDepartment').select2('data').id;
      formData.activityKind = this.$id('activityKind').select2('data').id;

      if (this.relation)
      {
        formData.relation = this.relation.getRelation();
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

      if (features.rootCauses)
      {
        formData.rootCauses.forEach(rootCause =>
        {
          rootCause.category = +rootCause.category;

          if (!rootCause.why)
          {
            rootCause.why = [];
          }

          while (rootCause.why.length < 5)
          {
            rootCause.why.push('');
          }
        });

        formData.reason = '';
        formData.suggestion = '';
      }
      else
      {
        formData.rootCauses = null;
      }

      if (features.resolutions)
      {
        formData.status = 'inProgress';

        if (!formData.resolutions)
        {
          formData.resolutions = [];
        }

        formData.resolutions.forEach(resolution =>
        {
          resolution._id = +resolution._id;
        });

        formData.solution = '';
      }
      else
      {
        formData.resolutions = null;
      }

      if (features.implementers)
      {
        formData.status = this.newStatus || this.model.get('status') || 'new';
        formData.implementers = setUpUserSelect2.getUserInfo(this.$id('implementers'));
        formData.plannedAt = time.utc.getMoment(this.$id('plannedAt').val(), 'YYYY-MM-DD').toISOString();
      }
      else
      {
        formData.implementers = null;
        formData.plannedAt = null;
      }

      if (features.participants)
      {
        formData.participants = setUpUserSelect2.getUserInfo(this.$id('participants'));
      }
      else
      {
        formData.participants = null;
      }

      if (!formData.status)
      {
        formData.status = 'finished';
      }

      if (Array.isArray(formData.kind))
      {
        formData.kind = formData.kind.map(id => +id);
      }

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpUserWorkplaceSelect2();
      this.setUpUserDepartmentSelect2();
      this.setUpDivisionSelect2();
      this.setUpWorkplaceSelect2();
      this.setUpDepartmentSelect2();
      this.setUpBuildingSelect2();
      this.setUpLocationSelect2();
      this.setUpStationSelect2();
      this.setUpActivityKindSelect2();
      this.setUpImplementersSelect2();
      this.setUpParticipantsSelect2();
      this.setUpRootCauseCategoryPopover();
      this.toggleKind();
      this.toggleActivityKind();

      if (this.options.editMode)
      {
        this.resolutions.forEach(resolution => this.addResolution(resolution, this.resolutions, {}));
      }
    },

    setUpActivityKindSelect2: function(oldId)
    {
      const $input = this.$id('activityKind');
      const kinds = this.getKinds();
      const map = {};
      const anyType = this.options.editMode
        || Action.can.manage()
        || dictionaries.isCoordinator();
      const relationType = this.relation ? this.relation.getModelType() : null;
      const forcedActivityKind = dictionaries.activityKinds.get(this.options.forcedActivityKind);

      dictionaries.activityKinds.forEach(model =>
      {
        if (forcedActivityKind)
        {
          if (forcedActivityKind !== model)
          {
            return;
          }
        }
        else
        {
          if (!model.get('active') || !model.hasKind(kinds))
          {
            return;
          }

          if (this.relation)
          {
            if (model.get('resolution') !== 'implementers')
            {
              return;
            }

            if (!anyType && model.get('allowedTypes').includes(relationType))
            {
              return;
            }
          }
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          description: model.get('description'),
          model
        };
      });

      const currentId = this.model.get('activityKind');
      const currentModel = dictionaries.activityKinds.get(currentId);

      if (currentId && !map[currentId])
      {
        if (!currentModel)
        {
          map[currentId] = {
            id: currentId,
            text: `?${currentId}?`
          };
        }
        else if (currentModel.hasKind(kinds))
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

      if (oldId && map[oldId])
      {
        $input.val(oldId).select2('data', map[oldId]);
      }
      else if (data.length === 1)
      {
        $input.val(data[0].id).select2('data', data[0]);
      }
    },

    setUpImplementersSelect2: function()
    {
      const $input = this.$id('implementers');
      const privileged = this.model.isCoordinator() || Action.can.manage();

      setUpUserSelect2($input, {
        width: '100%',
        multiple: true,
        maximumSelectionSize: privileged ? 10 : 2,
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

    setUpParticipantsSelect2: function()
    {
      setUpUserSelect2(this.$id('participants'), {
        width: '100%',
        multiple: true,
        userInfoDecorators: [userInfoDecorator],
        noPersonnelId: true,
        currentUserInfo: this.model.get('participants') || []
      });
    },

    setUpRootCauseCategoryPopover: function()
    {
      const $rootCauses = this.$id('rootCauses');

      $rootCauses.popover({
        selector: '.control-label',
        container: this.$id('rootCausesGroup'),
        className: 'osh-actions-form-rootCause-popover',
        placement: 'bottom',
        trigger: 'click',
        html: true,
        content: function()
        {
          const category = dictionaries.rootCauseCategories.get(+this.previousElementSibling.value);

          if (category)
          {
            return category.get('description');
          }
        }
      });

      $rootCauses.on('show.bs.popover', function()
      {
        $rootCauses.find('.control-label[aria-describedby^="popover"]').popover('hide');
      });
    },

    toggleKind: function()
    {
      const $kinds = this.$('input[name="kind[]"]');

      if ($kinds.length && !$kinds.filter(':checked').length)
      {
        $kinds.first().click();
      }

      $kinds.prop('disabled', !Action.can.editKind(this.model, this.options.editMode));
    },

    getActivityFeatures: function()
    {
      const activityKind = dictionaries.activityKinds.get(+this.$id('activityKind').val());
      const features = {
        resolution: 'none',
        participants: false,
        rootCauses: false,
        implementers: false,
        resolutions: false
      };

      if (activityKind)
      {
        Object.assign(features, activityKind.pick([
          'participants',
          'rootCauses',
          'resolution'
        ]));
      }

      features.implementers = features.resolution === 'implementers';
      features.resolutions = features.resolution === 'resolutions';

      return features;
    },

    toggleActivityKind: function()
    {
      const features = this.getActivityFeatures();

      this.toggleRootCausesFeature(features);
      this.toggleResolutionsFeature(features);
      this.toggleImplementersFeature(features);
      this.toggleParticipantsFeature(features);

      viewport.adjustDialogBackdrop();
    },

    toggleParticipantsFeature: function(features)
    {
      this.$id('participants')
        .prop('required', features.participants)
        .closest('.form-group')
        .toggleClass('has-required-select2', features.participants)
        .closest('.row')
        .toggleClass('hidden', !features.participants);
    },

    toggleRootCausesFeature: function(features)
    {
      this.$id('problem')
        .closest('.form-group')
        .removeClass('col-lg-4 col-lg-12')
        .addClass(`col-lg-${features.rootCauses ? 12 : 4}`);

      this.$id('rootCausesGroup')
        .toggleClass('hidden', !features.rootCauses);

      this.$id('reason')
        .closest('.form-group')
        .toggleClass('hidden', features.rootCauses);

      this.$id('suggestion')
        .closest('.form-group')
        .toggleClass('hidden', features.rootCauses);

      this.checkWhyValidity();
    },

    toggleResolutionsFeature: function(features)
    {
      this.$id('solution')
        .closest('.form-group')
        .toggleClass('hidden', features.resolutions);

      this.$id('resolutionsGroup')
        .toggleClass('hidden', !features.resolutions);

      this.$id('addResolution')
        .prop('disabled', viewport.currentDialog === this);
    },

    toggleImplementersFeature: function(features)
    {
      this.$id('plannedAt')
        .prop('required', features.implementers);

      this.$id('implementers')
        .prop('required', features.implementers)
        .closest('.form-group')
        .toggleClass('has-required-select2', features.implementers)
        .closest('.row')
        .toggleClass('hidden', !features.implementers);

      this.$id('problem')
        .prop('required', features.implementers)
        .closest('.form-group')
        .find('.control-label')
        .toggleClass('is-required', features.implementers);
    },

    checkWhyValidity: function()
    {
      let required = false;

      if (this.getActivityFeatures().rootCauses)
      {
        required = true;

        this.$id('rootCauses').find('textarea').each(function()
        {
          let value = this.value.trim();

          if (/^[^a-zA-Z]+$/.test(value))
          {
            value = '';
          }

          if (value.length)
          {
            required = false;
          }

          this.value = value;
        });
      }

      this.$('textarea[name="rootCauses[0].why[0]"]').prop('required', required);
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
    },

    linkResolution: function()
    {
      const $rid = this.$id('resolutionRid');

      $rid[0].setCustomValidity('');

      if (!$rid[0].checkValidity())
      {
        $rid[0].reportValidity();

        return;
      }

      if (!$rid.val().length)
      {
        $rid.focus();

        return;
      }

      const parts = $rid.val().toUpperCase().split('-');
      const prefix = parts[0];
      const relationType = dictionaries.PREFIX_TO_TYPE[prefix];
      const rid = `${prefix}-${parts[1]}-${parts[2].padStart(6, '0')}`;

      if (rid === this.model.get('rid'))
      {
        $rid.val('').focus();

        return;
      }

      $rid.val(rid);

      const $existingRow = this.$id('resolutions').find(`tr[data-id="${rid}"]`);

      if ($existingRow.length)
      {
        $rid.val('');
        $existingRow.removeClass('highlight');
        $existingRow.addClass('highlight');

        clearTimeout(this.timers[`highlight:${rid}`]);
        this.timers[`highlight:${rid}`] = setTimeout(() => $existingRow.removeClass('highlight'), 1000);

        return;
      }

      viewport.msg.loading();

      const $actions = this.$id('resolutionsActions')
        .find('input, button')
        .prop('disabled', true);

      const req = this.ajax({
        url: `/osh/${dictionaries.TYPE_TO_MODULE[relationType]}?rid=${rid}&exclude(changes)&limit(1)`
      });

      req.fail(() =>
      {
        viewport.msg.loadingFailed();

        $rid[0].setCustomValidity(this.t('resolutions:error:failure'));
      });

      req.done(res =>
      {
        viewport.msg.loaded();

        if (!res.collection || !res.collection.length)
        {
          $rid[0].setCustomValidity(this.t('resolutions:error:notFound'));

          return;
        }

        const data = res.collection[0];

        if (data.status === 'finished' && !(this.model.get('resolutions') || []).some(r => r.rid === data.rid))
        {
          $rid[0].setCustomValidity(this.t('resolutions:error:finished'));

          return;
        }

        $rid.val('');

        this.resolutions.add(data, {highlight: true});
      });

      req.always(() =>
      {
        $actions.prop('disabled', false);

        this.$id('addResolution')
          .prop('disabled', viewport.currentDialog === this);

        if (!$rid[0].checkValidity())
        {
          $rid[0].reportValidity();
        }
      });
    },

    addResolution: function(resolution, resolutions, {highlight})
    {
      const $row = this.renderPartial(resolutionRowTemplate, {
        i: this.resolutionsI++,
        entry: resolution.serializeRow(),
        resolution: resolution.getRelation()
      });

      this.$id('resolutions').append($row);

      if (highlight)
      {
        $row.addClass('highlight');

        this.timers[`highlight:${resolution.id}`] = setTimeout(() => $row.removeClass('highlight'), 1000);
      }
    },

    removeResolution: function(resolution)
    {
      this.$id('resolutions').find(`tr[data-id="${resolution.id}"]`).remove();
    },

    showAddResolutionDialog: function(type)
    {
      if (!this.el.checkValidity())
      {
        return this.$id('save').click();
      }

      const formData = Object.assign(this.model.toJSON(), this.getFormData());
      let dialogView = null;

      if (type === 'kaizen')
      {
        dialogView = new KaizenFormView({
          relation: this.model,
          model: new Kaizen({
            kind: formData.kind,
            division: formData.division,
            workplace: formData.workplace,
            department: formData.department,
            building: formData.building,
            location: formData.location,
            station: formData.station
          })
        });
      }
      else if (type === 'action')
      {
        const ActionFormView = this.constructor;

        dialogView = new ActionFormView({
          relation: this.model,
          model: new Action({
            kind: formData.kind,
            division: formData.division,
            workplace: formData.workplace,
            department: formData.department,
            building: formData.building,
            location: formData.location,
            station: formData.station
          })
        });
      }
      else
      {
        return;
      }

      viewport.showDialog(dialogView, this.t(`resolutions:title:${type}`));

      dialogView.handleSuccess = () =>
      {
        this.resolutions.add(dialogView.model.toJSON(), {highlight: true});

        viewport.closeDialog();
      };
    },

    showParticipantFinderDialog: function()
    {
      const dialogView = new ParticipantFinderView();

      viewport.showDialog(dialogView, this.t('participantFinder:title'));

      this.listenToOnce(dialogView, 'users', newUsers =>
      {
        viewport.closeDialog();

        if (newUsers.length === 0)
        {
          return;
        }

        const $participants = this.$id('participants');
        const users = new Map();

        $participants.select2('data').forEach(user =>
        {
          users.set(user.id, user);
        });

        newUsers.forEach(user =>
        {
          users.set(user.id, {id: user.id, text: user.label});
        });

        const data = Array.from(users.values()).sort((a, b) => a.text.localeCompare(b.text));

        $participants.select2('data', data);
      });
    }

  });
});
