// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/core/views/FormView',
  'app/kaizenBehaviours/templates/form'
], function(
  _,
  t,
  user,
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'change [name="_lang"]': function(e)
      {
        this.toggleLang(e.currentTarget.value);
      }

    }, FormView.prototype.events),

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$id('id').prop('readonly', true);
        this.$id('name').focus();
      }

      this.renderLang();
      this.toggleLang(user.lang);
    },

    renderLang: function()
    {
      var $lang = this.$id('lang');

      if ($lang.children().length)
      {
        return;
      }

      $lang.addClass('form-group btn-group').attr('data-toggle', 'buttons');

      var langs = {};

      this.$('.form-group[data-lang]').each(function()
      {
        langs[this.dataset.lang] = 1;
      });

      var html = '';

      Object.keys(langs).forEach(function(lang)
      {
        html += ' <label class="btn btn-default">'
          + '<input type="radio" name="_lang" value="' + lang + '"> '
          + t('core', 'lang:' + lang)
          + '</label>';
      });

      $lang.html(html);
    },

    toggleLang: function(newLang)
    {
      var $groups = this.$('.form-group[data-lang]');

      $groups.addClass('hidden');

      var $userLang = $groups.filter('[data-lang="' + newLang + '"]');

      if (!$userLang.length)
      {
        newLang = $groups.first().attr('data-lang');

        $userLang = $groups.filter('[data-lang="' + newLang + '"]');
      }

      $userLang.removeClass('hidden');

      if (!this.$id('lang').find('input:checked').length)
      {
        this.$id('lang').find('input[value="' + newLang + '"]').click();
      }
    },

    serializeForm: function(formData)
    {
      if (!formData.description)
      {
        formData.description = '';
      }

      return formData;
    }

  });
});
