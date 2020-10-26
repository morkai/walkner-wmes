// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/views/FormView',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-observationKinds/templates/form',
  'app/wmes-osh-observationKinds/templates/formCategoryRow'
], function(
  $,
  FormView,
  dictionaries,
  template,
  categoryRowTemplate
) {
  'use strict';

  return FormView.extend({

    template,

    events: Object.assign({

      'change #-addCategory-behaviors': function(e)
      {
        if (e.added)
        {
          this.addCategory('behaviors', e.added.id);
          this.setUpAddCategorySelect2('behaviors');
        }
      },

      'change #-addCategory-workConditions': function(e)
      {
        if (e.added)
        {
          this.addCategory('workConditions', e.added.id);
          this.setUpAddCategorySelect2('workConditions');
        }
      },

      'click .btn[data-action="up"]': function(e)
      {
        const $row = this.$(e.currentTarget).closest('tr');

        if ($row.prev().length)
        {
          $row.insertBefore($row.prev());
        }
        else
        {
          $row.insertAfter($row.parent().children().last());
        }

        e.currentTarget.focus();
      },

      'click .btn[data-action="down"]': function(e)
      {
        const $row = this.$(e.currentTarget).closest('tr');

        if ($row.next().length)
        {
          $row.insertAfter($row.next());
        }
        else
        {
          $row.insertBefore($row.parent().children().first());
        }

        e.currentTarget.focus();
      },

      'click .btn[data-action="remove"]': function(e)
      {
        this.$(e.currentTarget).closest('tr').fadeOut('fast', function()
        {
          $(this).remove();
        });
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.categoryI = 0;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      if (this.options.editMode)
      {
        (this.model.get('behaviors') || []).forEach(this.addCategory.bind(this, 'behaviors'));
        (this.model.get('workConditions') || []).forEach(this.addCategory.bind(this, 'workConditions'));
      }

      this.setUpAddCategorySelect2('behaviors');
      this.setUpAddCategorySelect2('workConditions');
    },

    setUpAddCategorySelect2: function(property)
    {
      const $addCategory = this.$id(`addCategory-${property}`).val('');
      const usedCategories = new Set();

      this.$id(property).find('input[type="hidden"]').each(function()
      {
        usedCategories.add(+this.value);
      });

      $addCategory.select2({
        width: '100%',
        placeholder: this.t('FORM:categories:add'),
        data: dictionaries.observationCategories
          .filter(c => c.get('active') && !usedCategories.has(c.id))
          .map(c => ({
            id: c.id,
            text: c.getLabel({long: true})
          }))
      });
    },

    addCategory: function(property, categoryId)
    {
      const category = dictionaries.observationCategories.get(categoryId);

      this.$id(property).append(this.renderPartialHtml(categoryRowTemplate, {
        no: this.$id(property).children().length + 1,
        property,
        i: this.categoryI++,
        category: category
          ? {_id: category.id, label: category.getLabel({long: true})}
          : {_id: categoryId, label: `?${categoryId}?`}
      }));
    },

    serializeForm: function(formData)
    {
      formData.behaviors = formData.behaviors ? formData.behaviors.map(id => +id) : [];
      formData.workConditions = formData.workConditions ? formData.workConditions.map(id => +id) : [];

      return formData;
    }

  });
});
