// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  'app/orderBomMatchers/templates/form',
  'app/orderBomMatchers/templates/_componentRow'
], function(
  _,
  FormView,
  idAndLabel,
  orgUnits,
  template,
  componentRowTemplate
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'blur #-matchers-mrp': function(e)
      {
        e.target.value = e.target.value
          .trim()
          .toUpperCase()
          .split(/[^A-Z0-9]/)
          .filter(function(v) { return v.length > 0; })
          .join(', ');
      },

      'blur #-matchers-nc12': function(e)
      {
        e.target.value = e.target.value
          .trim()
          .toUpperCase()
          .split(/[^A-Z0-9]/)
          .filter(function(v) { return v.length > 0; })
          .join(', ');
      },

      'blur #-matchers-name': function(e)
      {
        var anyInvalid = false;

        e.target.value = e.target.value
          .trim()
          .split('\n')
          .filter(function(v) { return v.length > 0; })
          .map(function(v)
          {
            try
            {
              new RegExp(v, 'i'); // eslint-disable-line no-new

              return v;
            }
            catch (err)
            {
              anyInvalid = true;

              return v + ' <-- ' + err.message;
            }
          })
          .join('\n');

        e.target.setCustomValidity(anyInvalid ? this.t('FORM:ERROR:pattern') : '');
      },

      'blur input[name$="nc12Index"]': 'validateReIndexes',
      'blur input[name$="snIndex"]': 'validateReIndexes',

      'blur input[name$="attern"]': function(e)
      {
        try
        {
          new RegExp(e.target.value); // eslint-disable-line no-new

          e.target.setCustomValidity('');
        }
        catch (err)
        {
          e.target.setCustomValidity(err.message);
        }
      },

      'focus input[name$="attern"]': function(e)
      {
        if (e.target.getBoundingClientRect().width >= 878)
        {
          return;
        }

        var $input = this.$(e.target);

        $input.parent().css({
          position: 'relative'
        });

        var left = '';
        var right = '';

        if ($input[0].getBoundingClientRect().left + 878 + 15 > window.innerWidth)
        {
          right = '5px';
        }
        else
        {
          left = '5px';
        }

        $input.css({
          position: 'absolute',
          width: '878px',
          top: '5px',
          left: left,
          right: right
        });

        $input.one('blur', function()
        {
          $input.css({position: '', width: ''}).parent().css({position: ''});
        });
      },

      'click .btn[data-action="removeComponent"]': function(e)
      {
        this.$(e.currentTarget).closest('tr').remove();
        this.recountComponents();
      },

      'click #-addComponent': function()
      {
        this.addComponent({
          pattern: '',
          description: '',
          missing: false,
          unique: false,
          single: true,
          nc12Index: [],
          snIndex: [],
          labelPattern: ''
        });

        this.recountComponents();

        this.$id('components').children().last().find('input').first().focus();
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.nextComponentI = 0;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.$id('matchers-line').select2({
        width: '100%',
        allowClear: true,
        multiple: true,
        placeholder: ' ',
        data: orgUnits.getActiveByType('prodLine').map(idAndLabel)
      });

      var components = this.model.get('components');

      if (_.isEmpty(components))
      {
        this.$id('addComponent').click();
        this.$id('description').focus();
      }
      else
      {
        components.forEach(this.addComponent, this);
        this.recountComponents();
      }
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.matchers = _.assign({
        line: [],
        mrp: [],
        nc12: [],
        name: []
      }, formData.matchers);

      formData.matchers = {
        line: formData.matchers.line.join(','),
        mrp: formData.matchers.mrp.join(', '),
        nc12: formData.matchers.nc12.join(', '),
        name: formData.matchers.name.join('\n')
      };

      formData.components = undefined;

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.matchers = _.assign({
        line: '',
        mrp: '',
        nc12: '',
        name: ''
      }, formData.matchers);

      formData.matchers = {
        line: formData.matchers.line.split(',').filter(function(v) { return v.length > 0; }),
        mrp: formData.matchers.mrp.split(', ').filter(function(v) { return v.length > 0; }),
        nc12: formData.matchers.nc12.split(', ').filter(function(v) { return v.length > 0; }),
        name: formData.matchers.name.split('\n').filter(function(v) { return v.length > 0; })
      };

      formData.components = (formData.components || []).map(function(c)
      {
        if (!c.pattern)
        {
          c.pattern = '';
        }

        if (!c.notPattern)
        {
          c.notPattern = '';
        }

        c.nc12Index = (c.nc12Index || '').split(', ')
          .map(function(v) { return +v; })
          .filter(function(v) { return v >= -1; });
        c.snIndex = (c.snIndex || '').split(', ')
          .map(function(v) { return +v; })
          .filter(function(v) { return v >= -1; });

        if (c.nc12Index.length === 0)
        {
          c.nc12Index.push(-1);
        }

        if (c.snIndex.length === 0)
        {
          c.snIndex.push(-1);
        }

        return c;
      });

      return formData;
    },

    validateReIndexes: function(e)
    {
      e.target.value = e.target.value
        .split(/[^0-9\-]/)
        .filter(function(v) { return !isNaN(parseInt(v, 10)); })
        .join(', ');
    },

    addComponent: function(component)
    {
      this.$id('components').append(this.renderPartial(componentRowTemplate, {
        i: this.nextComponentI++,
        component: component
      }));
    },

    recountComponents: function()
    {
      var $components = this.$id('components').children();

      if ($components.length)
      {
        $components.each(function(i)
        {
          this.children[0].textContent = (i + 1) + '.';
        });
      }
      else
      {
        this.$id('addComponent').click();
      }
    }

  });
});
