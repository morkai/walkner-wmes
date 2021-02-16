// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/views/FormView',
  'app/orgUnits/util/setUpOrgUnitSelect2',
  'app/wmes-gft-testers/templates/form'
], function(
  $,
  FormView,
  setUpOrgUnitSelect2,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    events: Object.assign({

      'click td': function(e)
      {
        if (e.target.type === 'checkbox')
        {
          return;
        }

        const $input = this.$(e.currentTarget).find('input');

        if (!$input.length)
        {
          return;
        }

        $input[0].checked = !$input[0].checked;
      },

      'mouseenter td': function(e)
      {
        const $td = this.$(e.currentTarget);
        const $input = $td.find('input');

        if (!$input.length)
        {
          return;
        }

        $td[0].style.background = '#FFFFD6';
        $td[0].parentNode.firstElementChild.style.background = '#FFFFD6';
        this.$ledThs[$td.index() - 1].style.background = '#FFFFD6';
      },

      'mouseleave td': function(e)
      {
        const $td = this.$(e.currentTarget);
        const $input = $td.find('input');

        if (!$input.length)
        {
          return;
        }

        $td[0].style.background = '';
        $td[0].parentNode.firstElementChild.style.background = '';
        this.$ledThs[$td.index() - 1].style.background = '';
      },

      'click #-addLeds': function()
      {
        const ledsI = ++this.ledsI;

        this.$id('ledsHd')[0].colSpan += 1;

        const $th = $(`
          <th class="is-min">
            <input type="number" name="program[${ledsI}].leds" value="" class="form-control no-controls">
          </th>
        `);

        $th.insertBefore(this.$id('leds')[0].lastElementChild);

        this.$ledThs.push($th[0]);

        this.$id('outputs').children().each((i, tr) =>
        {
          const $td = $(`
            <td class="is-min"><input type="checkbox" name="program[${ledsI}].outputs[]" value="${i + 1}"></td>
          `);

          $td.insertBefore(tr.lastElementChild);
        });

        $th.find('input').focus();
      }

    }, FormView.prototype.events),

    serializeToForm: function()
    {
      const formData = this.model.toJSON();

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.station = parseInt(formData.station, 10);
      formData.port = parseInt(formData.port, 10);
      formData.program = (formData.program || [])
        .map(item =>
        {
          return {
            leds: parseInt(item.leds, 10),
            outputs: (item.outputs || []).map(o => parseInt(o, 10))
          };
        })
        .filter(item => item.leds > 0 && item.outputs.length > 0);

      return formData;
    },

    getTemplateData: function()
    {
      return {
        program: (this.model.get('program') || []).concat([
          {leds: '', outputs: []},
          {leds: '', outputs: []},
          {leds: '', outputs: []}
        ])
      };
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.$ledThs = this.$id('program').find('thead').find('tr').last().children().filter('.is-min');
      this.ledsI = this.$ledThs.length - 1;

      this.setUpLineSelect2();
    },

    setUpLineSelect2: function()
    {
      setUpOrgUnitSelect2(this.$id('line'), {
        width: '100%',
        orgUnitType: 'prodLine',
        showDeactivated: false
      });
    }

  });
});
