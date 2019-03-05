// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  'app/data/prodFunctions',
  'app/data/companies',
  'app/settings/views/SettingsView',
  'app/fte/templates/settings',
  'app/fte/templates/structureRow'
], function(
  _,
  $,
  t,
  idAndLabel,
  orgUnits,
  prodFunctions,
  companies,
  SettingsView,
  template,
  renderStructureRow
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#fte;settings',

    template: template,

    events: _.assign({

      'change input[data-setting]': function(e)
      {
        this.updateSetting(e.target.name, e.target.value);
      },

      'change #-structure-subdivision': function(e)
      {
        if (e.removed)
        {
          this.updateStructure(e.removed.id);
        }

        this.selectSubdivision(e.added ? e.added.id : null);
      },

      'change #-structure-prodFunction': function(e)
      {
        this.addProdFunction(e.added.id).find('[data-name="companies"]').select2('focus');
        this.$(e.target).select2('data', null);
      },

      'change input[data-name="companies"]': function()
      {
        this.scheduleStructureUpdate();
      },

      'click .btn[data-structure-action="remove"]': function(e)
      {
        var $tr = this.$(e.currentTarget).closest('tr');
        var view = this;

        $tr.fadeOut('fast', function()
        {
          $(this).remove();
          view.recountStructureRows();
          view.scheduleStructureUpdate();
        });
      },

      'click .btn[data-structure-action="up"]': function(e)
      {
        var $btn = this.$(e.currentTarget);
        var $thisTr = $btn.closest('tr');
        var $prevTr = $thisTr.prev();

        if ($prevTr.length)
        {
          $thisTr.insertBefore($prevTr);
        }
        else
        {
          var $childTrs = $thisTr.parent().children();

          if ($childTrs.length > 1)
          {
            $thisTr.insertAfter($childTrs.last());
          }
        }

        this.recountStructureRows();
        this.scheduleStructureUpdate();

        $btn.focus();
      },

      'click .btn[data-structure-action="down"]': function(e)
      {
        var $btn = this.$(e.currentTarget);
        var $thisTr = $btn.closest('tr');
        var $nextTr = $thisTr.next();

        if ($nextTr.length)
        {
          $thisTr.insertAfter($nextTr);
        }
        else
        {
          var $childTrs = $thisTr.parent().children();

          if ($childTrs.length > 1)
          {
            $thisTr.insertBefore($childTrs.first());
          }
        }

        this.recountStructureRows();
        this.scheduleStructureUpdate();

        $btn.focus();
      }

    }, SettingsView.prototype.events),

    afterRender: function()
    {
      SettingsView.prototype.afterRender.call(this);

      this.$id('general-absenceTasks').select2({
        allowClear: true,
        placeholder: ' ',
        multiple: true,
        data: this.prodTasks.serializeToSelect2()
      });

      this.$id('structure-subdivision').select2({
        placeholder: t('fte', 'settings:structure:subdivision:placeholder'),
        data: orgUnits.getAllByType('subdivision').map(function(subdivision)
        {
          return {
            id: subdivision.id,
            text: subdivision.get('division') + ' \\ ' + subdivision.getLabel()
          };
        }).sort(function(a, b)
        {
          return a.text.localeCompare(b.text, undefined, {numeric: true});
        })
      });

      this.$id('structure-prodFunction').select2({
        placeholder: t('fte', 'settings:structure:prodFunction:placeholder'),
        data: prodFunctions.map(idAndLabel)
      });
    },

    updateSettingField: function(setting)
    {
      if (/^fte\.structure/.test(setting.id))
      {
        var subdivisionId = setting.id.split('.')[2];

        if (subdivisionId === this.$id('structure-subdivision').val()
          && !_.isEqual(setting.getValue(), this.serializeStructure()))
        {
          this.recreateStructure();
        }
      }
    },

    selectSubdivision: function(subdivisionId)
    {
      this.$id('structure-subdivision').select2('val', subdivisionId);
      this.recreateStructure();
      this.$id('structure-prodFunction').select2('focus');
    },

    clearStructure: function()
    {
      this.$id('structure').empty();
    },

    recreateStructure: function()
    {
      this.clearStructure();

      var structure = this.settings.getValue('structure.' + this.$id('structure-subdivision').val());

      _.forEach(structure, function(prodFunction)
      {
        this.addProdFunction(prodFunction.id, prodFunction.companies);
      }, this);
    },

    addProdFunction: function(prodFunctionId, selectedCompanies)
    {
      var prodFunction = prodFunctions.get(prodFunctionId);

      if (!prodFunction)
      {
        return;
      }

      var $structure = this.$id('structure');
      var $row = $structure.find('[data-prod-function="' + prodFunctionId + '"]');

      if ($structure.find('[data-prod-function="' + prodFunctionId + '"]').length)
      {
        $row.find('[data-name="companies"]').select2('focus');

        return $row;
      }

      $structure.append(renderStructureRow({
        idPrefix: this.idPrefix,
        no: $structure.children().length + 1,
        prodFunction: idAndLabel(prodFunction),
        companies: _.isArray(selectedCompanies) ? selectedCompanies.join(',') : ''
      }));

      $row = $structure.children().last();

      $row.find('[data-name="companies"]').select2({
        placeholder: t('fte', 'settings:structure:companies:placeholder'),
        multiple: true,
        data: companies.map(idAndLabel)
      });

      return $row;
    },

    recountStructureRows: function()
    {
      this.$id('structure').find('.is-number').each(function(i)
      {
        this.textContent = (i + 1) + '.';
      });
    },

    scheduleStructureUpdate: function()
    {
      if (this.timers.updateStructure)
      {
        clearTimeout(this.timers.updateStructure);
      }

      this.timers.updateStructure = setTimeout(this.updateStructure.bind(this), 1000);
    },

    updateStructure: function(subdivisionId)
    {
      clearTimeout(this.timers.updateStructure);
      this.timers.updateStructure = null;

      if (!subdivisionId)
      {
        subdivisionId = this.$id('structure-subdivision').val();
      }

      var structure = this.serializeStructure();

      if (_.isEmpty(subdivisionId) || _.isEmpty(structure))
      {
        return;
      }

      this.updateSetting('fte.structure.' + subdivisionId, structure);
    },

    serializeStructure: function()
    {
      var prodFunctions = {};

      this.$id('structure').children().each(function()
      {
        var prodFunction = {
          id: this.dataset.prodFunction,
          companies: this.querySelector('[data-name="companies"]').value.split(',')
        };

        if (!prodFunction.companies.length)
        {
          return;
        }

        prodFunctions[prodFunction.id] = prodFunction;
      });

      return _.values(prodFunctions);
    }

  });
});
