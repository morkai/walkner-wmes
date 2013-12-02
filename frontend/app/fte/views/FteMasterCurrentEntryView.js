define([
  'app/i18n',
  'app/viewport',
  'app/user',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/data/views/OrgUnitDropdownsView',
  'app/core/Model',
  'app/core/View',
  'app/fte/templates/currentMasterEntry',
  'i18n!app/nls/fte'
], function(
  t,
  viewport,
  user,
  divisions,
  subdivisions,
  OrgUnitDropdownsView,
  Model,
  View,
  currentMasterEntryTemplate
) {
  'use strict';

  var ORG_UNIT = OrgUnitDropdownsView.ORG_UNIT;

  return View.extend({

    template: currentMasterEntryTemplate,

    idPrefix: 'currentMasterEntry',

    events: {
      'click .btn-primary': 'onSubmit'
    },

    initialize: function()
    {
      this.readonlyDivision = false;

      this.$submit = null;

      this.oudView = new OrgUnitDropdownsView({
        orgUnit: ORG_UNIT.DIVISION,
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

        view.readonlyDivision = !(user.isAllowedTo('FTE:MASTER:ALL') && !userDivision);

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

    onSubmit: function()
    {
      if (!this.socket.isConnected())
      {
        return viewport.msg.show({
          type: 'error',
          time: 5000,
          text: t('fte', 'currentMasterEntry:msg:offline')
        });
      }

      var view = this;
      var $division = this.oudView.$id('division');
      var $icon = this.$submit.find('i').removeClass('fa-edit').addClass('fa-spinner fa-spin');

      $division.select2('readonly', true);
      this.$submit.attr('disabled', true);

      this.socket.emit(
        'fte.master.getCurrentEntryId',
        $division.select2('val'),
        function(err, currentEntryId)
        {
          if (err)
          {
            if (err.message === 'LOCKED')
            {
              return view.broker.publish('router.navigate', {
                url: '#fte/master/' + currentEntryId,
                trigger: true
              });
            }

            $icon.removeClass('fa-spinner fa-spin').addClass('fa-edit');
            $division.select2('readonly', view.readonlyDivision);
            view.$submit.attr('disabled', false).focus();

            console.error(err);

            return viewport.msg.show({
              type: 'error',
              time: 5000,
              text: t('fte', 'currentMasterEntry:msg:failure')
            });
          }

          view.broker.publish('router.navigate', {
            url: '#fte/master/' + currentEntryId + ';edit',
            trigger: true
          });
        }
      );
    }

  });
});
