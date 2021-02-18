// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/templates/coordinators/form'
], function(
  View,
  setUpUserSelect2,
  dictionaries,
  template
) {
  'use strict';

  return View.extend({

    template,

    nlsDomain: 'wmes-osh-common',

    events: {

      'click #-add': function()
      {
        this.add({
          types: [],
          kinds: [],
          users: []
        });
      },

      'click .btn[data-action="remove"]': function(e)
      {
        const $row = this.$(e.target).closest('tr');

        $row.fadeOut('fast', () => $row.find('input').select2('destroy'));
      }

    },

    getTemplateData: function()
    {
      return {
        kinds: this.options.kinds !== false
      };
    },

    serializeForm: function()
    {
      return this.$('tbody').children()
        .map((i, el) =>
        {
          const $row = this.$(el);

          return {
            types: $row.find('input[name$="types"]').select2('data').map(item => item.id),
            kinds: this.options.kinds === false
              ? []
              : $row.find('input[name$="kinds"]').select2('data').map(item => item.id),
            users: setUpUserSelect2.getUserInfo($row.find('input[name$="users"]'))
          };
        })
        .get()
        .filter(coordinators => coordinators.users.length > 0);
    },

    afterRender: function()
    {
      this.model.get('coordinators').forEach(this.add, this);

      this.$id('add').click();
    },

    add: function({types, kinds, users})
    {
      if (!this.$tpl)
      {
        this.$tpl = this.$('tbody').children().first().detach();
      }

      const $row = this.$tpl.clone();

      this.$('tbody').append($row);

      $row.find('input[name$="types"]').val(types.join(',')).select2({
        width: '370px',
        multiple: true,
        allowClear: true,
        placeholder: this.t('coordinators:all'),
        data: dictionaries.entryTypes.map(id => ({id, text: this.t(`type:${id}`)}))
      });

      if (this.options.kinds !== false)
      {
        $row.find('input[name$="kinds"]').select2({
          width: '370px',
          multiple: true,
          allowClear: true,
          placeholder: this.t('coordinators:all'),
          data: dictionaries.kinds.map(kind => ({id: kind.id, text: kind.getLabel()}))
        }).select2('data', kinds.map(id => ({id, text: dictionaries.kinds.getLabel(id)})));
      }

      setUpUserSelect2($row.find('input[name$="users"]'), {
        width: 'auto',
        multiple: true,
        currentUserInfo: users
      });
    }

  });
});
