// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'underscore',
  'js2form',
  'select2',
  'app/i18n',
  'app/data/orgUnits',
  'app/core/View',
  'app/reports/templates/orgUnitPicker'
], function(
  $,
  _,
  js2form,
  select2,
  t,
  orgUnits,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': function(e)
      {
        e.preventDefault();

        var selectedOrgUnits = {};

        this.$('input[type="text" autocomplete="new-password"]').each(function()
        {
          if (this.value)
          {
            selectedOrgUnits[this.name] = this.value.split(',');
          }
        });

        this.trigger('picked', selectedOrgUnits);
      },
      'click #-reset': function()
      {
        this.trigger('picked', {});
      },
      'click [data-subdivision-type]': function(e)
      {
        var nextToggle = e.target.dataset.nextToggle;
        var include = nextToggle === '1';
        var subdivisionType = e.target.dataset.subdivisionType;
        var subdivisions = orgUnits.getAllByType('subdivision')
          .filter(function(s) { return s.get('type') === subdivisionType; })
          .map(function(s) { return s.id; });
        var $subdivision = this.$id('subdivision');
        var data = $subdivision.val().split(',').filter(function(d) { return !!d.length; });

        if (include)
        {
          subdivisions.forEach(function(s)
          {
            if (!_.includes(data, s))
            {
              data.push(s);
            }
          });
        }
        else
        {
          data = data.filter(function(s)
          {
            return !_.includes(subdivisions, s);
          });
        }

        this.$id('subdivision').select2('val', data);

        e.target.dataset.nextToggle = include ? '0' : '1';

        return false;
      }
    },

    afterRender: function()
    {
      this.setUpOrgUnitSelect2('division');
      this.setUpOrgUnitSelect2('subdivision');
      this.setUpOrgUnitSelect2('mrpController');
      this.setUpOrgUnitSelect2('prodFlow');
      this.setUpOrgUnitSelect2('workCenter');
      this.setUpOrgUnitSelect2('prodLine');
    },

    setUpOrgUnitSelect2: function(type)
    {
      var $input = this.$id(type).val(this.model && this.model[type] || [].join(','));
      var data = [];

      orgUnits.getAllByType(type).forEach(function(orgUnit)
      {
        if (type === 'division' && orgUnit.get('type') !== 'prod')
        {
          return;
        }

        var text;

        if (type === 'subdivision')
        {
          if (orgUnit.get('type') === 'storage')
          {
            return;
          }

          text = orgUnit.get('division') + ' > ' + orgUnit.getLabel();
        }
        else
        {
          text = orgUnit.getLabel();
        }

        data.push({
          id: orgUnit.id,
          text: text,
          deactivated: !!orgUnit.get('deactivatedAt')
        });
      });

      $input.select2({
        multiple: true,
        data: data,
        formatResult: function(item, $container, query, e)
        {
          if (!item.id)
          {
            return e(item.text);
          }

          var html = [];

          html.push('<span style="text-decoration: ' + (item.deactivated ? 'line-through' : 'initial') + '">');
          select2.util.markMatch(item.text, query.term, html, e);
          html.push('</span>');

          return html.join('');
        },
        formatSelection: function(item)
        {
          return item.deactivated
            ? ('<span style="text-decoration: line-through">' + item.text + '</span>')
            : item.text;
        }
      });
    }

  });
});
