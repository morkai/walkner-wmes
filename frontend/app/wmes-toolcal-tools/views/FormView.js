// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  '../dictionaries',
  '../Tool',
  'app/wmes-toolcal-tools/templates/form'
], function(
  _,
  $,
  t,
  time,
  user,
  buttonGroup,
  idAndLabel,
  FormView,
  setUpUserSelect2,
  dictionaries,
  Tool,
  template
) {
  'use strict';

  function formatUserSelect2Text(user, name)
  {
    return name;
  }

  return FormView.extend({

    template: template,

    events: _.assign({

      'change #-interval': function(e)
      {
        var matches = e.target.value.match(/([0-9]+)\s*([mwd])/i);

        if (matches)
        {
          e.target.value = this.t('interval:' + matches[2], {v: matches[1]});
        }
      }

    }, FormView.prototype.events),

    serialize: function()
    {
      return _.assign(FormView.prototype.serialize.call(this), {
        statuses: dictionaries.statuses
      });
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.lastDate = formData.lastDate ? time.format(formData.lastDate, 'YYYY-MM-DD') : '';

      var groupedUsers = this.model.groupUsers(false);

      _.forEach(groupedUsers, function(users, kind)
      {
        formData[kind + 'Users'] = _.pluck(users, 'id').join(',');
      });

      return formData;
    },

    serializeForm: function(formData)
    {
      var view = this;

      formData.users = [];

      ['individual', 'current'].forEach(function(kind)
      {
        var users = view.$id(kind + 'Users')
          .select2('data')
          .map(function(u) { return {id: u.id, label: u.text, kind: kind}; })
          .filter(function(u) { return !!u.id; });

        formData.users = formData.users.concat(users);
      });

      formData.interval = +formData.interval;

      var dateMoment = time.getMoment(formData.lastDate, 'YYYY-MM-DD');

      formData.lastDate = dateMoment.isValid() ? dateMoment.toISOString() : null;

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('type').select2({
        data: dictionaries.types.map(idAndLabel)
      });

      buttonGroup.toggle(this.$id('status'));

      this.setUpUsersSelect2('individual');
      this.setUpUsersSelect2('current');
    },

    setUpUsersSelect2: function(kind)
    {
      var isEditMode = this.options.editMode;
      var model = this.model;
      var data = [];

      if (isEditMode)
      {
        var users = model.get('users');

        if (Array.isArray(users) && users.length)
        {
          data = users
            .filter(function(u)
            {
              return u.kind === kind;
            })
            .map(function(u)
            {
              return {
                id: u.id,
                text: u.label
              };
            });
        }
      }

      setUpUserSelect2(this.$id(kind + 'Users'), {multiple: true, textFormatter: formatUserSelect2Text})
        .select2('data', data)
        .select2('enable', user.isAllowedTo('TOOLCAL:MANAGE'));
    }

  });
});
