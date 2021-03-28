// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/kaizenOrders/dictionaries',
  'app/kaizenControlLists/templates/form',
  'app/kaizenControlLists/templates/_formRow'
], function(
  FormView,
  dictionaries,
  template,
  formRowTemplate
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: Object.assign({

      'change #-category': function(e)
      {
        if (!e.added)
        {
          return;
        }

        this.$id('category').select2('data', null);

        var category = dictionaries.controlCategories.get(e.added.id);

        this.addCategory({
          _id: category.id,
          label: category.getLabel(),
          shortName: category.get('shortName'),
          fullName: category.get('fullName')
        });

        this.setUpCategorySelect2();

        this.$id('category').select2('focus');
      },

      'click .btn[data-action="remove"]': function(e)
      {
        var view = this;
        var $row = this.$(e.currentTarget).closest('tr');

        $row.fadeOut('fast', function()
        {
          $row.remove();
          view.setUpCategorySelect2();
        });
      },
      'click .btn[data-action="down"]': function(e)
      {
        var $rows = this.$id('categories').children();
        var $row = this.$(e.target).closest('tr');
        var $next = $row.next();

        if ($rows.length === 1)
        {
          return;
        }

        if ($next.length)
        {
          $row.insertAfter($next);
        }
        else
        {
          $row.insertBefore($rows.first());
        }
      },

      'click .btn[data-action="up"]': function(e)
      {
        var $rows = this.$id('categories').children();
        var $row = this.$(e.target).closest('tr');
        var $prev = $row.prev();

        if ($rows.length === 1)
        {
          return;
        }

        if ($prev.length)
        {
          $row.insertBefore($prev);
        }
        else
        {
          $row.insertAfter($rows.last());
        }
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.categoryI = 0;
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      delete formData.categories;

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.categories = formData.categories || [];

      return formData;
    },

    checkValidity: function(formData)
    {
      var view = this;

      if (!formData.categories.length)
      {
        setTimeout(function() { view.$id('category').select2('focus'); }, 1);

        return false;
      }

      return true;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      (this.model.get('categories') || []).forEach(this.addCategory, this);

      this.setUpCategorySelect2();
    },

    setUpCategorySelect2: function()
    {
      var data = {};

      dictionaries.controlCategories.forEach(c =>
      {
        data[c.id] = {
          id: c.id,
          text: c.getLabel()
        };
      });

      this.$('input[name$="._id"]').each(function()
      {
        delete data[this.value];
      });

      this.$id('category').select2({
        width: '350px',
        placeholder: this.t('FORM:category:placeholder'),
        data: Object.values(data)
      });
    },

    addCategory: function(category)
    {
      if (!category.label)
      {
        category.label = dictionaries.controlCategories.getLabel(category._id);
      }

      this.$id('categories').append(this.renderPartialHtml(formRowTemplate, {
        i: ++this.categoryI,
        category: category
      }));
    }

  });
});
