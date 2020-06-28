// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/viewport',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  'app/suggestions/templates/coordinate'
], function(
  _,
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
        this.status = 'accepted';

        if (this.el.reportValidity())
        {
          this.submitForm();
        }
      },

      'click #-reject': function()
      {
        this.status = 'rejected';

        if (this.el.reportValidity())
        {
          this.submitForm();
        }
      }

    }, FormView.prototype.events),

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpSectionSelect2();
      this.setUpUserSelect2();
    },

    setUpSectionSelect2: function()
    {
      var canManage = this.model.canManage();
      var data = [];

      this.model.get('coordSections').forEach(function(coordSection)
      {
        var section = kaizenDictionaries.sections.get(coordSection._id);

        if (!section)
        {
          if (canManage)
          {
            data.push({
              id: coordSection._id,
              text: coordSection._id
            });
          }

          return;
        }

        if (canManage
          || _.any(section.get('coordinators'), function(coordinator) { return coordinator.id === user.data._id; }))
        {
          data.push({
            id: section.id,
            text: section.getLabel()
          });
        }
      });

      var $section = this.$id('section').select2({
        width: '100%',
        data: data
      });

      if (data.length === 1)
      {
        $section.select2('disable');
      }
    },

    setUpUserSelect2: function()
    {
      var $user = setUpUserSelect2(this.$id('user'), {
        view: this
      });

      $user.select2('data', {id: user.data._id, text: user.getLabel()});

      if (!this.model.canManage())
      {
        $user.select2('disable');
      }
    },

    serializeToForm: function()
    {
      var coordSections = this.model.get('coordSections').filter(function(coordSection)
      {
        var section = kaizenDictionaries.sections.get(coordSection._id);

        return section
          && _.some(section.get('coordinators'), function(c) { return c.id === user.data._id; });
      });

      return {
        section: coordSections.length === 1 ? coordSections[0]._id : '',
        comment: coordSections.length === 1 ? coordSections[0].comment : ''
      };
    },

    serializeForm: function(formData)
    {
      return {
        _id: this.$id('section').val(),
        status: this.status,
        user: setUpUserSelect2.getUserInfo(this.$id('user')),
        time: new Date().toISOString(),
        comment: formData.comment
      };
    },

    request: function(formData)
    {
      return this.ajax({
        method: 'POST',
        url: this.model.url() + ';coordinate',
        data: JSON.stringify(formData)
      });
    },

    getFailureText: function()
    {
      return this.t('coordinate:failure');
    },

    handleSuccess: function()
    {
      viewport.closeDialog();
    }

  });
});
