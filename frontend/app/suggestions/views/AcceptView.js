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

    dialogClassName: 'suggestions-accept-dialog',

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
      },

      'change #-kaizenOwners-1': function(e)
      {
        this.toggleRequired(this.$id('kaizenSuperiors-1'), !!e.currentTarget.value);
      }

    }, FormView.prototype.events),

    afterRender: function()
    {
      var view = this;

      FormView.prototype.afterRender.apply(view, arguments);

      var kaizenOwners = [].concat(view.model.get('kaizenOwners'));
      var kaizenSuperiors = [].concat(view.model.get('kaizenSuperiors'));

      if (!Array.isArray(kaizenOwners) || kaizenOwners.length === 0)
      {
        kaizenOwners = [].concat(view.model.get('suggestionOwners'));
        kaizenSuperiors = [].concat(view.model.get('suggestionSuperiors'));
      }

      while (kaizenOwners.length < 2)
      {
        kaizenOwners.push(null);
        kaizenSuperiors.push(null);
      }

      kaizenOwners.forEach(function(owner, i)
      {
        var $owner = setUpUserSelect2(view.$id('kaizenOwners-' + i), {
          activeOnly: true,
          noPersonnelId: true,
          currentUserInfo: owner
        });

        view.toggleRequired($owner, i === 0);

        var $superior = setUpUserSelect2(view.$id('kaizenSuperiors-' + i), {
          activeOnly: true,
          noPersonnelId: true,
          currentUserInfo: kaizenSuperiors[i],
          rqlQueryDecorator: function(rqlQuery)
          {
            var superiorFuncs = kaizenDictionaries.settings.getValue('superiorFuncs');

            if (Array.isArray(superiorFuncs) && superiorFuncs.length)
            {
              rqlQuery.selector.args.push({
                name: 'in',
                args: ['prodFunction', superiorFuncs]
              });
            }
          }
        });

        view.toggleRequired($superior, !!owner);
      });
    },

    toggleRequired: function($input, required)
    {
      $input
        .prop('required', required)
        .closest('.form-group')
        .toggleClass('has-required-select2', required)
        .find('.control-label')
        .toggleClass('is-required', required);
    },

    serializeToForm: function()
    {
      return {

      };
    },

    serializeForm: function(formData)
    {
      var view = this;
      var owners = [];
      var superiors = [];

      view.$('input[name^="kaizenOwners"]').each(function(i)
      {
        var owner = setUpUserSelect2.getUserInfo(view.$(this));
        var superior = setUpUserSelect2.getUserInfo(view.$id('kaizenSuperiors-' + i));

        if (!owner || !superior)
        {
          return;
        }

        owners.push(owner);
        superiors.push(superior);
      });

      return {
        status: this.status,
        kaizenOwners: owners,
        kaizenSuperiors: superiors,
        kaizenStartDate: view.status === 'inProgress' ? time.getMoment().startOf('day').toISOString() : null,
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
      var view = this;
      var max = 3;
      var error = '';
      var owners = {};

      view.model.get('suggestionOwners').forEach(function(owner)
      {
        owners[owner.id] = 1;
      });

      view.$('input[name^="kaizenOwners"]').each(function()
      {
        var owner = setUpUserSelect2.getUserInfo(view.$(this));

        if (owner)
        {
          owners[owner.id] = 1;
        }
      });

      var count = Object.keys(owners).length;

      if (count > max)
      {
        error = view.t('FORM:owners:tooMany:overall', {max: max});
      }

      view.$id('kaizenOwners-0')[0].setCustomValidity(error);
    }

  });
});
