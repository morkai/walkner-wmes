// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/data/mrpControllers',
  'app/data/prodFlows',
  'app/data/workCenters',
  'app/data/prodLines'
], function(
  _,
  $,
  t,
  View,
  idAndLabel,
  divisions,
  subdivisions,
  mrpControllers,
  prodFlows,
  workCenters,
  prodLines
) {
  'use strict';

  var ORG_UNIT = {
    DIVISION: 1,
    SUBDIVISION: 2,
    MRP_CONTROLLER: 3,
    PROD_FLOW: 4,
    WORK_CENTER: 5,
    PROD_LINE: 6
  };

  var ORG_UNIT_NO_TO_NAME = {
    1: 'division',
    2: 'subdivision',
    3: 'mrpController',
    4: 'prodFlow',
    5: 'workCenter',
    6: 'prodLine'
  };

  var DEFAULT_DIVISION_FILTER = function() { return true; };

  return View.extend({

    tagName: 'div',

    className: 'orgUnitDropdowns',

    afterRender: function()
    {
      if (this.$el.children().length !== 0)
      {
        this.$el.empty();
      }

      if (this.options.noGrid !== true)
      {
        this.$el.addClass('row');
      }

      var orgUnit = this.options.orgUnit || ORG_UNIT.DIVISION;

      if (orgUnit >= ORG_UNIT.DIVISION)
      {
        this.renderDivisionDropdown();
      }

      if (orgUnit >= ORG_UNIT.SUBDIVISION)
      {
        this.renderSubdivisionDropdown();
      }

      if (orgUnit >= ORG_UNIT.MRP_CONTROLLER)
      {
        this.renderMrpControllerDropdown();
      }

      if (orgUnit >= ORG_UNIT.PROD_FLOW)
      {
        this.renderProdFlowDropdown();
      }

      if (orgUnit >= ORG_UNIT.WORK_CENTER)
      {
        this.renderWorkCenterDropdown();
      }

      if (orgUnit >= ORG_UNIT.PROD_LINE)
      {
        this.renderProdLineDropdown();
      }
    },

    focus: function()
    {
      this.$id('division').select2('focus');

      return this;
    },

    selectValue: function(model, orgUnit)
    {
      var selectFirst = !orgUnit;

      switch (orgUnit || this.options.orgUnit)
      {
        case ORG_UNIT.DIVISION:
          this.selectDivision(model, selectFirst);
          break;

        case ORG_UNIT.SUBDIVISION:
          this.selectSubdivision(model, selectFirst);
          break;

        case ORG_UNIT.MRP_CONTROLLER:
          this.selectMrpController(model, selectFirst);
          break;

        case ORG_UNIT.PROD_FLOW:
          this.selectProdFlow(model, selectFirst);
          break;

        case ORG_UNIT.WORK_CENTER:
          this.selectWorkCenter(model, selectFirst);
          break;

        case ORG_UNIT.PROD_LINE:
          this.selectProdLine(model, selectFirst);
          break;
      }

      return this;
    },

    selectDivision: function(model, selectFirst)
    {
      return this.selectModel(model, null, divisions, 'division', selectFirst);
    },

    selectSubdivision: function(model, selectFirst)
    {
      return this.selectModel(model, 'selectDivision', subdivisions, 'subdivision', selectFirst);
    },

    selectMrpController: function(model, selectFirst)
    {
      return this.selectModel(
        model, 'selectSubdivision', mrpControllers, 'mrpController', selectFirst
      );
    },

    selectProdFlow: function(model, selectFirst)
    {
      if (!model)
      {
        return null;
      }

      if (model.get('prodFlow'))
      {
        return this.selectModel(model, 'selectMrpController', prodFlows, 'prodFlow', selectFirst);
      }
      else if (model.get('mrpController'))
      {
        model = this.selectMrpController(model, selectFirst);

        if (model)
        {
          this.$id('prodFlow').select2('val', null);
        }

        return model;
      }

      return null;
    },

    selectWorkCenter: function(model, selectFirst)
    {
      return this.selectModel(model, 'selectProdFlow', workCenters, 'workCenter', selectFirst);
    },

    selectProdLine: function()
    {
      throw new Error('TODO');
    },

    selectModel: function(model, parentSelect, parentCollection, parentProperty, selectFirst)
    {
      if (!model)
      {
        return null;
      }

      var parentId = model.get(parentProperty);
      var parentModel = parentCollection.get(Array.isArray(parentId) ? parentId[0] : parentId);

      if (parentSelect !== null)
      {
        parentModel = this[parentSelect](parentModel, selectFirst);
      }

      if (!parentModel)
      {
        return null;
      }

      var $select2 = this.$id(parentProperty);

      if (!$select2.select2('container').hasClass('select2-container-multi'))
      {
        parentId = parentModel.id;
      }

      this.$id(parentProperty)
        .select2('val', parentId)
        .trigger({type: 'change', val: parentId, selectFirst: selectFirst});

      return model;
    },

    createDropdownElement: function(orgUnit, data)
    {
      var id = this.idPrefix + '-' + orgUnit;
      var options = this.options;
      var $formGroup = $('<div class="form-group">'
        + '<label for="' + id + '" class="control-label">' + t('core', 'ORG_UNIT:' + orgUnit) + '</label>'
        + '<input id="' + id + '" name="' + orgUnit + '" type="text">'
        + '</div>');

      if (options.noGrid !== true)
      {
        $formGroup.addClass('col-lg-' + Math.floor(12 / options.orgUnit));
      }

      if (options.required === true || (options.required && options.required[orgUnit]))
      {
        $formGroup.addClass('has-required-select2');
        $formGroup.find('label').addClass('is-required');
        $formGroup.find('input').addClass('is-required').prop('required', true);
      }

      return $formGroup.appendTo(this.el).find('input').select2({
        data: data || [],
        placeholder: ' ',
        allowClear: options.allowClear || options.orgUnit === ORG_UNIT.PROD_FLOW,
        multiple: options.multiple && orgUnit === ORG_UNIT_NO_TO_NAME[options.orgUnit]
      });
    },

    onChange: function($dropdown, collection, parentProperty, e)
    {
      var data = [];

      if (e.val !== null)
      {
        data = collection
          .filter(function(model)
          {
            var parentValue = model.get(parentProperty);

            if (Array.isArray(parentValue))
            {
              return Array.isArray(e.val)
                ? _.intersection(parentValue, e.val).length > 0
                : parentValue.indexOf(e.val) !== -1;
            }

            return Array.isArray(e.val) ? e.val.indexOf(parentValue) !== -1 : parentValue === e.val;
          })
          .map(idAndLabel);
      }

      var options = {
        data: data,
        placeholder: ' ',
        allowClear: !!this.options.allowClear
          || (parentProperty === 'mrpController' && this.options.orgUnit === ORG_UNIT.PROD_FLOW),
        multiple: this.options.multiple && $dropdown.attr('name') === ORG_UNIT_NO_TO_NAME[this.options.orgUnit]
      };

      $dropdown.select2('val', null);
      $dropdown.select2(options);

      if (data.length && e.selectFirst !== false)
      {
        $dropdown.select2('val', data[0].id);
      }

      $dropdown.trigger({
        type: 'change',
        val: data.length ? data[0].id : null
      });
    },

    renderDivisionDropdown: function()
    {
      this.createDropdownElement(
        'division',
        divisions.filter(this.options.divisionFilter || DEFAULT_DIVISION_FILTER).map(idAndLabel)
      );
    },

    renderSubdivisionDropdown: function()
    {
      var $dropdown = this.createDropdownElement('subdivision');

      this.$id('division').on(
        'change', this.onChange.bind(this, $dropdown, subdivisions, 'division')
      );
    },

    renderMrpControllerDropdown: function()
    {
      var $dropdown = this.createDropdownElement('mrpController');

      this.$id('subdivision').on(
        'change', this.onChange.bind(this, $dropdown, mrpControllers, 'subdivision')
      );
    },

    renderProdFlowDropdown: function()
    {
      var $dropdown = this.createDropdownElement('prodFlow');

      this.$id('mrpController').on(
        'change', this.onChange.bind(this, $dropdown, prodFlows, 'mrpController')
      );
    },

    renderWorkCenterDropdown: function()
    {
      var $dropdown = this.createDropdownElement('workCenter');

      this.$id('prodFlow').on(
        'change', this.onChange.bind(this, $dropdown, workCenters, 'prodFlow')
      );
    },

    renderProdLineDropdown: function()
    {
      var $dropdown = this.createDropdownElement('prodLine');

      this.$id('workCenter').on(
        'change', this.onChange.bind(this, $dropdown, prodLines, 'prodLine')
      );
    }

  }, {

    ORG_UNIT: ORG_UNIT

  });
});
