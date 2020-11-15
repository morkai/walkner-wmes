// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-brigades/templates/form'
], function(
  user,
  time,
  viewport,
  FormView,
  setUpUserSelect2,
  dictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    events: Object.assign({

      'change #-date': 'loadExisting',
      'change #-leader': 'loadExisting'

    }, FormView.prototype.events),

    getTemplateData: function()
    {
      return {

      };
    },

    serializeToForm: function()
    {
      const date = this.model.get('date');

      return {
        date: date ? time.utc.format(date, 'YYYY-MM') : ''
      };
    },

    serializeForm: function(formData)
    {
      if (!this.options.editMode)
      {
        formData.date += '-01T00:00:00Z';
        formData.leader = setUpUserSelect2.getUserInfo(this.$id('leader'));
      }

      formData.members = setUpUserSelect2.getUserInfo(this.$id('members'));

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpLeaderSelect2();
      this.setUpMembersSelect2();
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
        currentUserInfo: current,
        noPersonnelId: true
      });

      if (!manager)
      {
        $leader.select2('enable', false);
      }
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
    }

  });
});
