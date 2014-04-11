define([
  'app/i18n',
  'app/viewport',
  'app/user',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/data/views/OrgUnitDropdownsView',
  'app/core/Model',
  'app/core/View',
  'app/core/util/getShiftStartInfo',
  'app/fte/templates/addForm'
], function(
  t,
  viewport,
  user,
  divisions,
  subdivisions,
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

    idPrefix: 'addFteEntryForm',

    events: {
      'click .btn-primary': 'onSubmit'
    },

    initialize: function()
    {
      this.readonlyDivision = false;

      this.$submit = null;

      this.oudView = new OrgUnitDropdownsView({
        orgUnit: ORG_UNIT.SUBDIVISION,
        divisionFilter: this.options.divisionFilter,
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
      var shiftStartInfo = getShiftStartInfo(new Date());

      return {
        idPrefix: this.idPrefix,
        date: shiftStartInfo.moment.format('YYYY-MM-DD'),
        shift: shiftStartInfo.shift
      };
    },

    afterRender: function()
    {
      var view = this;
      var userDivision = user.getDivision();
      var userSubdivision = user.getSubdivision();

      this.$submit = this.$('.btn-primary').attr('disabled', true);

      this.listenToOnce(this.oudView, 'afterRender', function()
      {
        view.oudView.$id('subdivision').on('change', function(e)
        {
          view.$submit.attr('disabled', e.val === '' || e.val === null);
        });

        var model = null;
        var orgUnit = null;

        if (userSubdivision !== null)
        {
          orgUnit = ORG_UNIT.SUBDIVISION;
          model = new Model({subdivision: userSubdivision.id});
        }
        else if (userDivision !== null)
        {
          orgUnit = ORG_UNIT.DIVISION;
          model = new Model({division: userDivision.id});
        }

        view.oudView.selectValue(model, orgUnit);

        view.readonlyDivision =
          !user.isAllowedTo(view.model.getPrivilegePrefix() + ':ALL') && userDivision;

        view.oudView.$id('division').select2('readonly', view.readonlyDivision);
        view.oudView.$id(view.readonlyDivision ? 'subdivision' : 'division').select2('focus');

        if (view.readonlyDivision && !view.options.divisionFilter(userDivision))
        {
          view.oudView.$id('subdivision').select2('readonly', true);
        }
      });
    },

    onSubmit: function()
    {
      if (!this.socket.isConnected())
      {
        return viewport.msg.show({
          type: 'error',
          time: 5000,
          text: t('fte', 'addForm:msg:offline')
        });
      }

      var view = this;
      var $division = this.oudView.$id('division');
      var $subdivision = this.oudView.$id('subdivision');
      var $icon = this.$submit.find('i').removeClass('fa-edit').addClass('fa-spinner fa-spin');

      $division.select2('readonly', true);
      $subdivision.select2('readonly', true);
      this.$submit.attr('disabled', true);

      var messageType = this.model.getTopicPrefix() + '.findOrCreate';
      var options = {
        subdivision: $subdivision.select2('val'),
        date: new Date(this.$id('date').val() + ' 00:00:00'),
        shift: parseInt(this.$('input[name=shift]:checked').val(), 10)
      };

      this.socket.emit(messageType, options, function(err, fteEntryId)
      {
        if (fteEntryId)
        {
          view.model.set('_id', fteEntryId);
        }

        if (err)
        {
          if (err.message === 'AUTH' && fteEntryId)
          {
            return view.trigger('uneditable', view.model);
          }

          $icon.removeClass('fa-spinner fa-spin').addClass('fa-edit');
          $division.select2('readonly', view.readonlyDivision);
          $subdivision.select2('readonly', false);
          view.$submit.attr('disabled', false).focus();

          return viewport.msg.show({
            type: 'error',
            time: 5000,
            text: t('fte', 'addForm:msg:failure', {error: err.message})
          });
        }

        view.trigger('editable', view.model);
      });
    }

  });
});
