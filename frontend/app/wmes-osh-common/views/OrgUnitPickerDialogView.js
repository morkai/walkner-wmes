// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'underscore',
  'js2form',
  'select2',
  'app/data/localStorage',
  'app/core/View',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/templates/orgUnits/pickerDialog'
], function(
  $,
  _,
  js2form,
  select2,
  localStorage,
  View,
  dictionaries,
  template
) {
  'use strict';

  const DEACTIVATED_STORAGE_KEY = 'WMES:OrgUnitPicker:deactivated';
  const SHORT = {long: false};

  return View.extend({

    template,

    nlsDomain: 'wmes-osh-common',

    events: {
      'submit': function(e)
      {
        e.preventDefault();

        const type = this.$('input[name="orgUnitType"]:checked').val();
        const ids = this.$id(type).select2('val');

        this.trigger('picked', type, ids);
      },
      'change input[type="radio"]': function(e)
      {
        this.$id(e.currentTarget.value).select2('focus');
      },
      'click #-deactivated': function()
      {
        var oldState = localStorage.getItem(DEACTIVATED_STORAGE_KEY) || '0';
        var newState = oldState === '1' ? '0' : '1';

        localStorage.setItem(DEACTIVATED_STORAGE_KEY, newState);

        this.$id('deactivated').toggleClass('active', newState === '1');

        this.setUpOrgUnitsSelect2();
      },
      'change .osh-orgUnitPicker-orgUnits': function(e)
      {
        this.$(e.target).closest('.form-group').find('input[type="radio"]').click();
      }
    },

    initialize: function()
    {
      if (!this.model.orgUnitTypes)
      {
        this.model.orgUnitTypes = dictionaries.ORG_UNITS.filter(type => type !== 'station');
      }
    },

    getTemplateData: function()
    {
      var view = this;

      return {
        orgUnits: view.model.orgUnitTypes.map(type =>
        {
          return {
            type: type,
            label: view.model.resolveLabel(type)
          };
        }),
        deactivated: localStorage.getItem(DEACTIVATED_STORAGE_KEY) === '1'
      };
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeFormData());

      this.setUpOrgUnitsSelect2();
    },

    onDialogShown: function()
    {
      var orgUnitType = this.$('input[name="orgUnitType"]:checked').val();

      if (!orgUnitType)
      {
        this.$('input[name="orgUnitType"]').first().click();
      }
      else
      {
        this.$id(orgUnitType).select2('focus');
      }
    },

    serializeFormData: function()
    {
      const formData = {
        orgUnitType: this.model.orgUnitType
      };

      formData[formData.orgUnitType] = this.model.orgUnitIds.join(',');

      return formData;
    },

    setUpOrgUnitsSelect2: function()
    {
      this.model.orgUnitTypes.forEach(this.setUpOrgUnitSelect2, this);
    },

    setUpOrgUnitSelect2: function(type)
    {
      const data = [];

      if (type === 'department')
      {
        this.serializeDepartmentData(data);
      }
      else
      {
        this.serializeData(type, data);
      }

      return this.$id(type).select2({
        multiple: true,
        data,
        formatSelection: (item) =>
        {
          const text = _.escape(item.selection || item.text);

          if (item.deactivated)
          {
            return '<span style="text-decoration: line-through">' + text + '</span>';
          }

          return text;
        },
        formatResult: (item, $container, query, e) =>
        {
          const html = [];

          html.push('<span style="text-decoration: ' + (item.deactivated ? 'line-through' : 'initial') + '">');
          select2.util.markMatch(item.text, query.term, html, e);
          html.push('</span>');

          return html.join('');
        }
      });
    },

    serializeData: function(type, data)
    {
      const deactivated = localStorage.getItem(DEACTIVATED_STORAGE_KEY) === '1';
      const collection = dictionaries.forProperty(type);

      collection.forEach(orgUnit =>
      {
        if (!deactivated && !orgUnit.get('active'))
        {
          return;
        }

        let text = orgUnit.getLabel();
        let selection = orgUnit.getLabel(SHORT);
        let parent;

        if (type === 'department')
        {
          parent = dictionaries.workplaces.getLabel(orgUnit.get('workplace'), SHORT);
        }
        else if (type === 'station')
        {
          parent = dictionaries.locations.getLabel(orgUnit.get('location'), SHORT);
        }

        if (parent)
        {
          text = `${parent} > ${text}`;
          selection = `${parent} > ${selection}`;
        }

        const item = {
          id: orgUnit.id,
          selection,
          text,
          deactivated: !orgUnit.get('active'),
          orgUnit
        };

        data.push(item);
      });

      data.sort((a, b) => a.text.localeCompare(b.text, undefined, {numeric: true, ignorePunctuation: true}));
    },

    serializeDepartmentData: function(data)
    {
      const deactivated = localStorage.getItem(DEACTIVATED_STORAGE_KEY) === '1';
      const workplaceToDepartments = {};

      dictionaries.departments.forEach(department =>
      {
        if (!deactivated && !department.get('active'))
        {
          return;
        }

        const workplace = department.get('workplace');

        if (!workplaceToDepartments[workplace])
        {
          workplaceToDepartments[workplace] = [];
        }

        workplaceToDepartments[workplace].push({
          id: department.id.toString(),
          selection: dictionaries.workplaces.getLabel(workplace, SHORT) + ' > ' + department.getLabel(SHORT),
          text: department.getLabel(),
          deactivated: !department.get('active'),
          orgUnit: department
        });
      });

      Object
        .keys(workplaceToDepartments)
        .sort((a, b) =>
        {
          a = dictionaries.workplaces.getLabel(a);
          b = dictionaries.workplaces.getLabel(b);

          return a.localeCompare(b, undefined, {numeric: true, ignorePunctuation: true});
        })
        .forEach(workplaceId =>
        {
          const workplace = dictionaries.workplaces.get(workplaceId);
          const children = workplaceToDepartments[workplaceId];

          children.sort((a, b) => a.text.localeCompare(b.text, undefined, {numeric: true, ignorePunctuation: true}));

          data.push({
            text: workplace ? workplace.getLabel() : workplaceId,
            children,
            deactivated: !workplace || !workplace.get('active')
          });
        });
    }

  });
});
