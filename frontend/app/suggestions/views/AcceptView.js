// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  'app/suggestions/templates/accept'
], function(
  _,
  time,
  user,
  viewport,
  FormView,
  setUpUserSelect2,
  kaizenDictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'click #-accept': function()
      {
        this.status = 'inProgress';

        this.checkKaizenOwnersValidity();

        if (this.el.reportValidity())
        {
          this.submitForm();
        }
      },

      'click #-reject': function()
      {
        this.status = 'new';

        this.checkKaizenOwnersValidity();

        if (this.el.reportValidity())
        {
          this.submitForm();
        }
      },

      'click #-cancel': function()
      {
        this.status = 'cancelled';

        this.checkKaizenOwnersValidity();

        if (this.el.reportValidity())
        {
          this.submitForm();
        }
      }

    }, FormView.prototype.events),

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpKaizenOwnersSelect2();
    },

    setUpKaizenOwnersSelect2: function()
    {
      var $kaizenOwners = setUpUserSelect2(this.$id('kaizenOwners'), {
        multiple: true,
        activeOnly: true,
        noPersonnelId: true,
        maximumSelectionSize: 2
      });

      $kaizenOwners.select2('data', this.model.get('suggestionOwners').map(function(o)
      {
        return {
          id: o.id,
          text: o.label
        };
      }));
    },

    serializeToForm: function()
    {
      return {

      };
    },

    serializeForm: function(formData)
    {
      return {
        status: this.status,
        kaizenOwners: this.status === 'inProgress'
          ? setUpUserSelect2.getUserInfo(this.$id('kaizenOwners'))
          : [],
        kaizenStartDate: this.status === 'inProgress' ? time.getMoment().startOf('day').toISOString() : null,
        kaizenFinishDate: null,
        comment: formData.comment
      };
    },

    request: function(formData)
    {
      return this.ajax({
        method: 'PUT',
        url: this.model.url(),
        data: JSON.stringify(formData)
      });
    },

    getFailureText: function()
    {
      return this.t('accept:failure');
    },

    handleSuccess: function()
    {
      viewport.closeDialog();
    },

    checkKaizenOwnersValidity: function()
    {
      var $kaizenOwners = this.$id('kaizenOwners');
      var error = '';

      if (this.status === 'inProgress')
      {
        if ($kaizenOwners.val() === '')
        {
          error = this.t('accept:kaizenOwners:required');
        }
      }

      $kaizenOwners[0].setCustomValidity(error);
    }

  });
});
