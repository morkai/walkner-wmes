// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/core/util/buttonGroup',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/util/userInfoDecorator',
  'app/wmes-osh-brigades/templates/form'
], function(
  user,
  time,
  viewport,
  FormView,
  buttonGroup,
  setUpUserSelect2,
  dictionaries,
  userInfoDecorator,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    events: Object.assign({

      'change #-date': 'loadExisting',
      'change #-leader': function()
      {
        this.updateOrgUnits();
        this.loadExisting();
      },

      'change #-workplace': function()
      {
        this.$id('department').val('');

        this.setUpDepartmentSelect2();
      }

    }, FormView.prototype.events),

    serializeToForm: function()
    {
      const date = this.model.get('date');
      const leader = this.model.get('leader');

      return {
        date: date ? time.utc.format(date, 'YYYY-MM') : '',
        shift: this.model.get('shift') || 1,
        workplace: leader ? leader.oshWorkplace : '',
        department: leader ? leader.oshDepartment : ''
      };
    },

    serializeForm: function(formData)
    {
      if (this.options.editMode)
      {
        formData.leader = this.model.get('leader');
      }
      else
      {
        formData.date += '-01T00:00:00Z';
        formData.leader = setUpUserSelect2.getUserInfo(this.$id('leader'));
      }

      const workplace = this.$id('workplace').select2('data').model;
      const department = this.$id('department').select2('data').model;

      formData.leader.oshDivision = workplace.get('division');
      formData.leader.oshWorkplace = workplace.id;
      formData.leader.oshDepartment = department.id;

      formData.members = setUpUserSelect2.getUserInfo(this.$id('members'));

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpLeaderSelect2();
      this.setUpWorkplaceSelect2();
      this.setUpDepartmentSelect2();
      this.setUpMembersSelect2();

      buttonGroup.toggle(this.$id('shift'));
    },

    setUpLeaderSelect2: function()
    {
      const manager = user.isAllowedTo('OSH:HR:MANAGE');
      let current = this.model.get('leader');

      if (!current && !manager)
      {
        current = {
          id: user.data._id,
          label: user.getLabel(),
          user: user.data
        };
      }

      const $leader = setUpUserSelect2(this.$id('leader'), {
        width: '100%',
        allowClear: false,
        currentUserInfo: current,
        noPersonnelId: true,
        userInfoDecorators: [userInfoDecorator]
      });

      if (!manager)
      {
        $leader.select2('enable', false);
      }
    },

    setUpWorkplaceSelect2: function()
    {
      const $input = this.$id('workplace');

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

      $input.select2('enable', !!data.length);
    },

    setUpMembersSelect2: function()
    {
      setUpUserSelect2(this.$id('members'), {
        width: '100%',
        multiple: true,
        currentUserInfo: this.model.get('members'),
        noPersonnelId: true
      });
    },

    loadExisting: function()
    {
      const date = this.$id('date').val();

      if (!date)
      {
        return;
      }

      const moment = time.utc.getMoment(`${this.$id('date').val()}-01`, 'YYYY-MM-DD');

      if (!moment.isValid())
      {
        return;
      }

      const leader = this.$id('leader').val();

      if (!leader.length)
      {
        return;
      }

      const userInfo = setUpUserSelect2.getUserInfo(this.$id('leader'));

      viewport.msg.loading();

      const req = this.ajax({
        url: `/osh/brigades?date<=${moment.valueOf()}&leader.id=${leader}&sort(-date)&limit(1)`
      });

      req.fail(() =>
      {
        viewport.msg.loadingFailed();
      });

      req.done(res =>
      {
        viewport.msg.loaded();

        const data = res.collection && res.collection[0] || {};

        if (data.date !== moment.toISOString())
        {
          data._id = undefined;
        }

        data.date = moment.toISOString();
        data.leader = userInfo;

        this.model.set(data, {silent: true});
        this.render();
      });
    },

    updateOrgUnits: function()
    {
      const userInfo = setUpUserSelect2.getUserInfo(this.$id('leader')) || {
        oshWorkplace: '',
        oshDepartment: ''
      };

      this.$id('workplace').val(userInfo.oshWorkplace || '');
      this.$id('department').val(userInfo.oshDepartment || '');

      this.setUpWorkplaceSelect2();
      this.setUpDepartmentSelect2();
    }

  });
});
