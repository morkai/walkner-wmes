define([
  'app/i18n',
  'app/viewport',
  'app/user',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/data/views/OrgUnitDropdownsView',
  'app/core/Model',
  'app/core/View',
  'app/fte/templates/currentEntry'
], function(
  t,
  viewport,
  user,
  divisions,
  subdivisions,
  OrgUnitDropdownsView,
  Model,
  View,
  currentEntryTemplate
) {
  'use strict';

  var ORG_UNIT = OrgUnitDropdownsView.ORG_UNIT;

  return View.extend({

    template: currentEntryTemplate,

    idPrefix: 'currentEntry',

    events: {
      'click .btn-primary': 'onSubmit'
    },

    initialize: function()
    {
      this.readonlyDivision = false;

      this.$submit = null;

      this.oudView = new OrgUnitDropdownsView({
        orgUnit: ORG_UNIT.SUBDIVISION,
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
          !(user.isAllowedTo(view.model.getPrivilegePrefix() + ':ALL') && !userDivision);

        view.oudView.$id('division').select2('readonly', view.readonlyDivision);
        view.oudView.$id(view.readonlyDivision ? 'subdivision' : 'division').select2('focus');
      });
    },

    onSubmit: function()
    {
      if (!this.socket.isConnected())
      {
        return viewport.msg.show({
          type: 'error',
          time: 5000,
          text: t(this.model.getNlsDomain(), 'currentEntry:msg:offline')
        });
      }

      var view = this;
      var $division = this.oudView.$id('division');
      var $subdivision = this.oudView.$id('subdivision');
      var $icon = this.$submit.find('i').removeClass('fa-edit').addClass('fa-spinner fa-spin');

      $division.select2('readonly', true);
      $subdivision.select2('readonly', true);
      this.$submit.attr('disabled', true);

      this.socket.emit(
        this.model.getTopicPrefix() + '.getCurrentEntryId',
        $subdivision.select2('val'),
        function(err, currentEntryId)
        {
          if (currentEntryId)
          {
            view.model.set('_id', currentEntryId);
          }

          if (err)
          {
            if (err.message === 'LOCKED')
            {
              return view.broker.publish('router.navigate', {
                url: view.model.genClientUrl(),
                trigger: true
              });
            }

            $icon.removeClass('fa-spinner fa-spin').addClass('fa-edit');
            $division.select2('readonly', view.readonlyDivision);
            $subdivision.select2('readonly', false);
            view.$submit.attr('disabled', false).focus();

            console.error(err);

            return viewport.msg.show({
              type: 'error',
              time: 5000,
              text: t(view.model.getNlsDomain(), 'currentEntry:msg:failure')
            });
          }

          view.broker.publish('router.navigate', {
            url: view.model.genClientUrl('edit'),
            trigger: true
          });
        }
      );
    }

  });
});
