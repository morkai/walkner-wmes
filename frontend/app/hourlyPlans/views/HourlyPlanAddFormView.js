// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/user',
  'app/data/divisions',
  'app/data/views/OrgUnitDropdownsView',
  'app/core/Model',
  'app/core/View',
  'app/core/util/getShiftStartInfo',
  'app/hourlyPlans/templates/addForm'
], function(
  t,
  time,
  viewport,
  user,
  divisions,
  OrgUnitDropdownsView,
  Model,
  View,
  getShiftStartInfo,
  addFormTemplate
) {
  'use strict';

  var ORG_UNIT = OrgUnitDropdownsView.ORG_UNIT;

  return View.extend({

    template: addFormTemplate,

    events: {
      'submit': 'submitForm'
    },

    initialize: function()
    {
      this.readonlyDivision = false;

      this.$submit = null;

      this.oudView = new OrgUnitDropdownsView({
        orgUnit: ORG_UNIT.DIVISION,
        divisionFilter: function(division) { return division.get('type') === 'prod'; },
        allowClear: true,
        noGrid: true
      });

      this.setView('.orgUnitDropdowns-container', this.oudView);
    },

    destroy: function()
    {
      if (this.$submit !== null)
      {
        this.$submit.remove();
        this.$submit = null;
      }
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        date: getShiftStartInfo(new Date()).moment.format('YYYY-MM-DD')
      };
    },

    afterRender: function()
    {
      var view = this;
      var userDivision = user.getDivision();

      this.$submit = this.$('.btn-primary').attr('disabled', true);

      this.listenToOnce(this.oudView, 'afterRender', function()
      {
        view.oudView.$id('division').on('change', function(e)
        {
          view.$submit.attr('disabled', e.val === '' || e.val === null);
        });

        var model = null;
        var orgUnit = null;

        if (userDivision !== null)
        {
          orgUnit = ORG_UNIT.DIVISION;
          model = new Model({division: userDivision.id});
        }

        view.oudView.selectValue(model, orgUnit);

        view.readonlyDivision = !user.isAllowedTo('HOURLY_PLANS:ALL') && userDivision;

        view.oudView.$id('division').select2('readonly', view.readonlyDivision);

        if (view.readonlyDivision)
        {
          view.$submit.focus();
        }
        else
        {
          view.oudView.$id('division').select2('focus');
        }
      });
    },

    submitForm: function(e)
    {
      e.preventDefault();

      if (!this.socket.isConnected())
      {
        return viewport.msg.show({
          type: 'error',
          time: 5000,
          text: t('hourlyPlans', 'addForm:msg:offline')
        });
      }

      var view = this;
      var $division = this.oudView.$id('division');
      var $icon = this.$submit.find('i').removeClass('fa-edit').addClass('fa-spinner fa-spin');

      $division.select2('readonly', true);
      this.$submit.attr('disabled', true);

      var options = {
        division: $division.select2('val'),
        date: new Date(this.$id('date').val() + ' 00:00:00'),
        shift: 1
      };

      this.socket.emit('hourlyPlans.findOrCreate', options, function(err, hourlyPlanId)
      {
        if (hourlyPlanId)
        {
          view.model.set('_id', hourlyPlanId);
        }

        if (err)
        {
          if (err.message === 'AUTH' && hourlyPlanId)
          {
            return view.trigger('uneditable', view.model);
          }

          $icon.removeClass('fa-spinner fa-spin').addClass('fa-edit');
          $division.select2('readonly', view.readonlyDivision);
          view.$submit.attr('disabled', false).focus();

          return viewport.msg.show({
            type: 'error',
            time: 5000,
            text: t('hourlyPlans', 'addForm:msg:failure', {error: err.message})
          });
        }

        view.trigger('editable', view.model);
      });
    }

  });
});
