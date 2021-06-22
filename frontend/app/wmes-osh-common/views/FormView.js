// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/user',
  'app/core/views/FormView',
  '../dictionaries'
], function(
  _,
  $,
  viewport,
  currentUser,
  FormView,
  dictionaries
) {
  'use strict';

  return FormView.extend({

    events: Object.assign({

      'click #-cancel': function()
      {
        if (viewport.currentDialog === this)
        {
          viewport.closeDialog();
        }
        else if (window.history.length)
        {
          window.history.back();
        }
        else
        {
          window.location.href = this.model.genClientUrl('base');
        }
      },

      'change': function()
      {
        this.dirty = true;
      },

      'change #-division': function()
      {
        this.$id('workplace').val('');
        this.setUpWorkplaceSelect2();
        this.$id('workplace').trigger('change');
      },

      'change #-workplace': function()
      {
        this.$id('department').val('');
        this.setUpDepartmentSelect2();
        this.$id('department').trigger('change');
      },

      'change #-department': function()
      {
        this.$id('building').val('');
        this.setUpBuildingSelect2();
        this.$id('building').trigger('change');
      },

      'change #-building': function()
      {
        this.$id('location').val('');
        this.setUpLocationSelect2();
        this.$id('location').trigger('change');
      },

      'change #-location': function()
      {
        this.$id('station').val('');

        this.setUpStationSelect2();
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.dirty = false;

      $(document).on(`click.${this.idPrefix}`, 'a', this.onLinkClick.bind(this));
      $(window).on(`beforeunload.${this.idPrefix}`, this.onWindowBeforeUnload.bind(this));

      this.on('afterRender', () => this.dirty = false);
    },

    destroy: function()
    {
      FormView.prototype.destroy.apply(this, arguments);

      $(document).off(`.${this.idPrefix}`);
      $(window).off(`.${this.idPrefix}`);
    },

    showUnsavedDialog: function(a)
    {
      const t = Date.now();
      const ok = window.confirm(this.t('wmes-osh-common', 'FORM:unsaved')); // eslint-disable-line no-alert

      if (ok || Date.now() - t < 100)
      {
        this.dirty = false;

        a.click();
      }
      else
      {
        document.body.click();
      }
    },

    onLinkClick: function(e)
    {
      if (!this.dirty || e.button !== 0)
      {
        return;
      }

      const a = e.currentTarget;
      const href = a.getAttribute('href');

      if (!href || href.startsWith('javascript') || a.target === '_blank')
      {
        return;
      }

      this.showUnsavedDialog(a);

      return false;
    },

    onWindowBeforeUnload: function(e)
    {
      if (!this.dirty)
      {
        return;
      }

      return e.originalEvent.returnValue = this.t('wmes-osh-common', 'FORM:unsaved');
    },

    setUpUserWorkplaceSelect2: function()
    {
      const $input = this.$id('userWorkplace');

      if (this.options.editMode)
      {
        const currentId = this.model.get('creator').oshWorkplace;
        const current = dictionaries.workplaces.get(currentId);

        $input.val(currentId).select2({
          width: '100%',
          placeholder: ' ',
          data: !current ? [] : [{
            id: currentId,
            text: current ? current.getLabel({long: true}) : `?${currentId}?`,
            model: current
          }]
        });

        $input.select2('enable', false);

        return;
      }

      $input
        .prop('required', true)
        .closest('.form-group')
        .addClass('has-required-select2')
        .find('.control-label')
        .addClass('is-required');

      let current = dictionaries.workplaces.get(+$input.val());

      if (current)
      {
        current = {
          id: current.id,
          text: current.getLabel({long: true}),
          model: current
        };
      }

      const map = {};

      dictionaries.workplaces.forEach(model =>
      {
        if (!model.get('active'))
        {
          return;
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          model
        };
      });

      if (current && !map[current.id])
      {
        map[current.id] = current;
      }

      $input.select2({
        width: '100%',
        data: Object.values(map).sort((a, b) => a.text.localeCompare(b.text))
      });

      const userWorkplace = dictionaries.workplaces.get(currentUser.data.oshWorkplace);

      if (this.options.editMode && current)
      {
        $input.select2('enable', false).select2('data', current);

        return;
      }

      if (userWorkplace)
      {
        $input.select2('enable', false).select2('data', {
          id: userWorkplace.id,
          text: userWorkplace.getLabel({long: true}),
          model: userWorkplace
        });

        return;
      }

      $input.select2('enable', true);
    },

    setUpUserDepartmentSelect2: function()
    {
      const $input = this.$id('userDepartment');

      if (this.options.editMode)
      {
        const currentId = this.model.get('creator').oshDepartment;
        const current = dictionaries.departments.get(currentId);

        $input.val(currentId).select2({
          width: '100%',
          placeholder: ' ',
          data: !current ? [] : [{
            id: currentId,
            text: current ? current.getLabel({long: true}) : `?${currentId}?`,
            model: current
          }]
        });

        $input.select2('enable', false);

        return;
      }

      const currentWorkplaceId = +this.$id('userWorkplace').val();
      let currentDepartment = dictionaries.departments.get(+$input.val());

      if (currentDepartment)
      {
        currentDepartment = {
          id: currentDepartment.id,
          text: currentDepartment.getLabel({long: true}),
          model: currentDepartment
        };
      }

      const map = {};

      dictionaries.departments.forEach(model =>
      {
        if (!model.get('active') || model.get('workplace') !== currentWorkplaceId)
        {
          return;
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          model
        };
      });

      if (currentDepartment
        && !map[currentDepartment.id]
        && currentDepartment.model.get('workplace') === currentWorkplaceId)
      {
        map[currentDepartment.id] = currentDepartment;
      }

      const data = Object.values(map).sort((a, b) => a.text.localeCompare(b.text));
      let placeholder = ' ';
      let enabled = true;

      if (!currentWorkplaceId && data.length === 0)
      {
        placeholder = this.t('wmes-osh-common', 'FORM:placeholder:noUserWorkplace');
        enabled = false;
      }

      $input.select2({
        width: '100%',
        placeholder,
        data
      });

      const userDepartment = dictionaries.departments.get(currentUser.data.oshDepartment);

      if (this.options.editMode && currentDepartment)
      {
        $input.select2('enable', false).select2('data', currentDepartment);

        return;
      }

      if (userDepartment)
      {
        $input.select2('enable', false).select2('data', {
          id: userDepartment.id,
          text: userDepartment.getLabel({long: true}),
          model: userDepartment
        });

        return;
      }

      $input.select2('enable', enabled);

      if (data.length === 1)
      {
        $input.select2('data', data[0]);
      }
      else if (!map[$input.val()])
      {
        $input.select2('data', null).val('');
      }
    },

    setUpDivisionSelect2: function()
    {
      const $input = this.$id('division');
      const currentId = +$input.val();

      if (!currentId && currentUser.data.oshDivision && !this.options.editMode)
      {
        $input.val(currentUser.data.oshDivision);
      }

      let currentDivision = dictionaries.divisions.get(currentId);

      if (currentDivision)
      {
        currentDivision = {
          id: currentDivision.id,
          text: currentDivision.getLabel({long: true}),
          model: currentDivision
        };
      }
      else if (currentId)
      {
        currentDivision = {
          id: currentId,
          text: `?${currentId}?`
        };
      }

      const map = {};

      dictionaries.divisions.forEach(model =>
      {
        if (!model.get('active'))
        {
          return;
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          model
        };
      });

      if (currentDivision && !map[currentDivision.id])
      {
        map[currentDivision.id] = currentDivision;
      }

      $input.select2({
        width: '100%',
        allowClear: !$input.prop('required'),
        data: Object.values(map).sort((a, b) => a.text.localeCompare(b.text))
      });

      $input.select2(
        'enable',
        !this.options.editMode || this.model.constructor.can.manage() || this.model.isCoordinator()
      );
    },

    setUpWorkplaceSelect2: function()
    {
      const $input = this.$id('workplace');
      const currentId = +$input.val();

      if (!currentId && currentUser.data.oshWorkplace && !this.options.editMode)
      {
        $input.val(currentUser.data.oshWorkplace);
      }

      let currentWorkplace = dictionaries.workplaces.get(currentId);

      if (currentWorkplace)
      {
        currentWorkplace = {
          id: currentWorkplace.id,
          text: currentWorkplace.getLabel({long: true}),
          model: currentWorkplace
        };
      }
      else if (currentId)
      {
        currentWorkplace = {
          id: currentId,
          text: `?${currentId}?`
        };
      }

      const currentDivisionId = +this.$id('division').val();
      const map = {};

      dictionaries.workplaces.forEach(model =>
      {
        if (!model.get('active') || !model.hasDivision(currentDivisionId))
        {
          return;
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          model
        };
      });

      if (currentWorkplace && !map[currentWorkplace.id])
      {
        map[currentWorkplace.id] = currentWorkplace;
      }

      const data = Object.values(map).sort((a, b) => a.text.localeCompare(b.text));

      $input.select2({
        width: '100%',
        placeholder: currentDivisionId ? ' ' : this.t('wmes-osh-common', 'FORM:placeholder:noDivision'),
        allowClear: !$input.prop('required'),
        data
      });

      if (data.length === 1)
      {
        $input.select2('data', data[0]);
      }
      else if (!map[$input.val()])
      {
        $input.val('').select2('data', null);
      }

      $input.select2(
        'enable',
        !!currentDivisionId
        && (!this.options.editMode || this.model.constructor.can.manage() || this.model.isCoordinator())
      );
    },

    setUpDepartmentSelect2: function()
    {
      const $input = this.$id('department');
      const currentId = +$input.val();

      if (!currentId && currentUser.data.oshDepartment && !this.options.editMode)
      {
        $input.val(currentUser.data.oshDepartment);
      }

      let currentDepartment = dictionaries.departments.get(currentId);

      if (currentDepartment)
      {
        currentDepartment = {
          id: currentDepartment.id,
          text: currentDepartment.getLabel({long: true}),
          model: currentDepartment
        };
      }
      else if (currentId)
      {
        currentDepartment = {
          id: currentId,
          text: `?${currentId}?`
        };
      }

      const currentWorkplaceId = +this.$id('workplace').val();
      const map = {};

      dictionaries.departments.forEach(model =>
      {
        if (!model.get('active') || !model.hasWorkplace(currentWorkplaceId))
        {
          return;
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          model
        };
      });

      if (currentDepartment && !map[currentDepartment.id])
      {
        map[currentDepartment.id] = currentDepartment;
      }

      const data = Object.values(map).sort((a, b) => a.text.localeCompare(b.text));

      $input.select2({
        width: '100%',
        placeholder: currentWorkplaceId ? ' ' : this.t('wmes-osh-common', 'FORM:placeholder:noWorkplace'),
        allowClear: !$input.prop('required'),
        data
      });

      if (data.length === 1)
      {
        $input.select2('data', data[0]);
      }
      else if (!map[$input.val()])
      {
        $input.val('').select2('data', null);
      }

      $input.select2(
        'enable',
        !!currentWorkplaceId
        && (!this.options.editMode || this.model.constructor.can.manage() || this.model.isCoordinator())
      );
    },

    setUpBuildingSelect2: function(selectFirst)
    {
      const $input = this.$id('building');
      const currentId = +$input.val();

      let currentBuilding = dictionaries.buildings.get(currentId);

      if (currentBuilding)
      {
        currentBuilding = {
          id: currentBuilding.id,
          text: currentBuilding.getLabel({long: true}),
          model: currentBuilding
        };
      }
      else if (currentId)
      {
        currentBuilding = {
          id: currentId,
          text: `?${currentId}?`
        };
      }

      const currentDepartmentId = +this.$id('department').val();
      const map = {};

      dictionaries.buildings.forEach(model =>
      {
        if (!model.get('active') || !model.hasDepartment(currentDepartmentId))
        {
          return;
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          model
        };
      });

      if (currentBuilding && !map[currentBuilding.id])
      {
        map[currentBuilding.id] = currentBuilding;
      }

      const data = Object.values(map).sort((a, b) => a.text.localeCompare(b.text));

      $input.select2({
        width: '100%',
        placeholder: currentDepartmentId ? ' ' : this.t('wmes-osh-common', 'FORM:placeholder:noDepartment'),
        allowClear: !$input.prop('required'),
        data
      });

      if (selectFirst !== false && data.length === 1)
      {
        $input.select2('data', data[0]);
      }

      $input.select2(
        'enable',
        !!currentDepartmentId
        && (!this.options.editMode || this.model.constructor.can.manage() || this.model.isCoordinator())
      );
    },

    setUpLocationSelect2: function()
    {
      const $input = this.$id('location');
      const currentId = +$input.val();

      let currentLocation = dictionaries.locations.get(currentId);

      if (currentLocation)
      {
        currentLocation = {
          id: currentLocation.id,
          text: currentLocation.getLabel({long: true}),
          model: currentLocation
        };
      }
      else if (currentId)
      {
        currentLocation = {
          id: currentId,
          text: `?${currentId}?`
        };
      }

      const currentBuildingId = +this.$id('building').val();
      const map = {};

      dictionaries.locations.forEach(model =>
      {
        if (!model.get('active') || !model.hasBuilding(currentBuildingId))
        {
          return;
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          model
        };
      });

      if (currentLocation && !map[currentLocation.id])
      {
        map[currentLocation.id] = currentLocation;
      }

      const data = Object.values(map).sort((a, b) => a.text.localeCompare(b.text));

      $input.select2({
        width: '100%',
        placeholder: currentBuildingId ? ' ' : this.t('wmes-osh-common', 'FORM:placeholder:noBuilding'),
        allowClear: !$input.prop('required'),
        data
      });

      if (data.length === 1)
      {
        $input.select2('data', data[0]);
      }

      $input.select2(
        'enable',
        !!currentBuildingId
        && (!this.options.editMode || this.model.constructor.can.manage() || this.model.isCoordinator())
      );
    },

    setUpStationSelect2: function()
    {
      const $input = this.$id('station');
      const currentId = +$input.val();

      let currentStation = dictionaries.stations.get(currentId);

      if (currentStation)
      {
        currentStation = {
          id: currentStation.id,
          text: currentStation.getLabel({long: true}),
          model: currentStation
        };
      }
      else if (currentId)
      {
        currentStation = {
          id: currentId,
          text: `?${currentId}?`
        };
      }

      const currentLocationId = +this.$id('location').val();
      const map = {};

      dictionaries.stations.forEach(model =>
      {
        if (!model.get('active') || !model.hasLocation(currentLocationId))
        {
          return;
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          model
        };
      });

      if (currentStation && !map[currentStation.id])
      {
        map[currentStation.id] = currentStation;
      }

      const data = Object.values(map).sort((a, b) => a.text.localeCompare(b.text));

      $input.select2({
        width: '100%',
        placeholder: currentLocationId ? ' ' : this.t('wmes-osh-common', 'FORM:placeholder:noLocation'),
        allowClear: true,
        data
      });

      if (!this.options.editMode && data.length === 1)
      {
        $input.select2('data', data[0]);
      }

      $input.select2(
        'enable',
        data.length > 0
        && !!currentLocationId
        && (!this.options.editMode || this.model.constructor.can.manage() || this.model.isCoordinator())
      );
    }

  });
});
