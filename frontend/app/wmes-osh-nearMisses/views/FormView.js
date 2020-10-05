// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/views/FormView',
  'app/core/util/formatResultWithDescription',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-nearMisses/templates/form'
], function(
  currentUser,
  FormView,
  formatResultWithDescription,
  setUpUserSelect2,
  dictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    events: Object.assign({

      'change #-anonymous': function()
      {
        this.setUpWorkplaceSelect2();
        this.setUpDivisionSelect2();
        this.setUpBuildingSelect2();
        this.setUpCoordinatorSelect2();
      },

      'change #-workplace': function()
      {
        this.setUpDivisionSelect2();
        this.setUpBuildingSelect2();
        this.setUpCoordinatorSelect2();
      },

      'change #-division': function()
      {
        this.setUpBuildingSelect2();
        this.setUpCoordinatorSelect2();
      }

    }, FormView.prototype.events),

    getTemplateData: function()
    {
      return {
        dictionaries
      };
    },

    serializeToForm: function()
    {
      const formData = this.model.toJSON();

      if (!this.options.editMode)
      {
        formData.kind = 'osh';
        formData.priority = 'normal';
      }

      return formData;
    },

    checkValidity: function(formData)
    {
      console.log(formData);

      return true;
    },

    serializeForm: function(formData)
    {
      formData.workplace = this.$id('workplace').select2('data').id;
      formData.division = this.$id('division').select2('data').id;
      formData.building = this.$id('building').select2('data').id;
      formData.coordinator = setUpUserSelect2.getUserInfo(this.$id('coordinator'));
      formData.implementer = setUpUserSelect2.getUserInfo(this.$id('implementer'));

      const division = dictionaries.divisions.get(formData.division);

      formData.manager = division.get('manager') || null;

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpWorkplaceSelect2();
      this.setUpDivisionSelect2();
      this.setUpBuildingSelect2();
      this.setUpCoordinatorSelect2(this.model.get('coordinator'));
      this.setUpImplementerSelect2();
      this.setUpEventCategorySelect2();
      this.setUpReasonCategorySelect2();
    },

    isAnonymous: function()
    {
      return this.$id('anonymous').prop('checked');
    },

    setUpWorkplaceSelect2: function()
    {
      const $input = this.$id('workplace');

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

      if (!this.isAnonymous() && userWorkplace)
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

    setUpDivisionSelect2: function()
    {
      const $input = this.$id('division');

      const currentWorkplaceId = +this.$id('workplace').val();
      let currentDivision = dictionaries.divisions.get(+$input.val());

      if (currentDivision)
      {
        currentDivision = {
          id: currentDivision.id,
          text: currentDivision.getLabel({long: true}),
          model: currentDivision
        };
      }

      const map = {};

      dictionaries.divisions.forEach(model =>
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

      if (currentDivision
        && !map[currentDivision.id]
        && currentDivision.model.get('workplace') === currentWorkplaceId)
      {
        map[currentDivision.id] = currentDivision;
      }

      const data = Object.values(map).sort((a, b) => a.text.localeCompare(b.text));

      $input.select2({
        width: '100%',
        data
      });

      const userDivision = dictionaries.divisions.get(currentUser.data.oshDivision);

      if (this.options.editMode && currentDivision)
      {
        $input.select2('enable', false).select2('data', currentDivision);

        return;
      }

      if (!this.isAnonymous() && userDivision)
      {
        $input.select2('enable', false).select2('data', {
          id: userDivision.id,
          text: userDivision.getLabel({long: true}),
          model: userDivision
        });

        return;
      }

      $input.select2('enable', true);

      if (data.length === 1)
      {
        $input.select2('data', data[0]);
      }
      else if (!map[$input.val()])
      {
        $input.select2('data', null).val('');
      }
    },

    setUpBuildingSelect2: function()
    {
      const $input = this.$id('building');

      const currentDivision = +this.$id('division').val();

      const map = {};

      dictionaries.buildings.forEach(model =>
      {
        if (!model.get('active') || !model.get('divisions').includes(currentDivision))
        {
          return;
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          model
        };
      });

      const data = Object.values(map).sort((a, b) => a.text.localeCompare(b.text));

      $input.select2({
        width: '100%',
        data
      });

      if (data.length === 1)
      {
        $input.select2('data', data[0]);
      }
    },

    setUpCoordinatorSelect2: function(forcedUsedInfo)
    {
      const $input = this.$id('coordinator');
      const division = dictionaries.divisions.get(+this.$id('division').val());
      const coordinators = division ? division.get('coordinators') : [];
      const map = {};

      coordinators.forEach(user =>
      {
        map[user.id] = {
          id: user.id,
          text: user.label
        };
      });

      if (forcedUsedInfo)
      {
        if (!map[forcedUsedInfo.id])
        {
          map[forcedUsedInfo.id] = {
            id: forcedUsedInfo.id,
            text: forcedUsedInfo.label
          };
        }

        $input.val(forcedUsedInfo.id);
      }
      else if (!map[$input.val()])
      {
        $input.val('');
      }

      const data = Object.values(map).sort((a, b) => a.text.localeCompare(b.text));

      $input.select2({
        width: '100%',
        data
      });

      if (data.length === 1)
      {
        $input.select2('data', data[0]);
      }
    },

    setUpImplementerSelect2: function()
    {
      const $input = this.$id('implementer');

      setUpUserSelect2($input, {
        width: '100%'
      });

      const current = this.model.get('implementer');

      if (current)
      {
        $input.select2('data', {
          id: current.id,
          text: current.label
        });
      }
    },

    setUpEventCategorySelect2: function()
    {
      const $input = this.$id('eventCategory');
      const map = {};

      dictionaries.eventCategories.forEach(model =>
      {
        if (!model.get('active'))
        {
          return;
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          description: model.get('description'),
          model
        };
      });

      const currentId = this.model.get('eventCategory');
      const currentModel = dictionaries.eventCategories.get(currentId);

      if (currentId && !map[currentId])
      {
        if (currentModel)
        {
          map[currentId] = {
            id: currentId,
            text: currentModel.getLabel({long: true}),
            description: currentModel.get('description'),
            model: currentModel
          };
        }
        else
        {
          map[currentId] = {
            id: currentId,
            text: `?${currentId}?`,
            model: null
          };
        }
      }

      const data = Object.values(map).sort((a, b) => a.text.localeCompare(b.text));

      $input.select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data,
        formatResult: formatResultWithDescription.bind(null, 'text', 'description')
      });
    },

    setUpReasonCategorySelect2: function()
    {
      const $input = this.$id('reasonCategory');
      const map = {};

      dictionaries.reasonCategories.forEach(model =>
      {
        if (!model.get('active'))
        {
          return;
        }

        map[model.id] = {
          id: model.id,
          text: model.getLabel({long: true}),
          description: model.get('description'),
          model
        };
      });

      const currentId = this.model.get('reasonCategory');
      const currentModel = dictionaries.reasonCategories.get(currentId);

      if (currentId && !map[currentId])
      {
        if (currentModel)
        {
          map[currentId] = {
            id: currentId,
            text: currentModel.getLabel({long: true}),
            description: currentModel.get('description'),
            model: currentModel
          };
        }
        else
        {
          map[currentId] = {
            id: currentId,
            text: `?${currentId}?`,
            model: null
          };
        }
      }

      const data = Object.values(map).sort((a, b) => a.text.localeCompare(b.text));

      $input.select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data,
        formatResult: formatResultWithDescription.bind(null, 'text', 'description')
      });
    }

  });
});
