// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/user',
  'app/core/util/idAndLabel',
  'app/core/util/buttonGroup',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  '../OshAudit',
  'app/wmes-oshAudits/templates/form',
  'app/wmes-oshAudits/templates/_formResult'
], function(
  _,
  time,
  currentUser,
  idAndLabel,
  buttonGroup,
  FormView,
  setUpUserSelect2,
  dictionaries,
  OshAudit,
  template,
  resultTemplate
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: Object.assign({

      'click .oshAudits-form-radio': function(e)
      {
        if (e.target.tagName === 'TD')
        {
          e.target.querySelector('input[type="radio"]').click();
        }
      },
      'mousedown input[type="radio"]': function(e)
      {
        e.preventDefault();
      },
      'mouseup input[type="radio"]': function(e)
      {
        e.preventDefault();
      },
      'click input[type="radio"]': function(e)
      {
        var view = this;
        var radioEl = e.target;
        var $radio = view.$(radioEl);
        var $tr = $radio.closest('tr');
        var $null = $tr.find('input[name="' + radioEl.name + '"][value="-1"]');

        if (!$null.length)
        {
          return;
        }

        e.preventDefault();

        setTimeout(function()
        {
          radioEl.checked = !radioEl.checked;

          if (radioEl.checked && radioEl.value === '0')
          {
            view.$id('nokConfirmValue').prop('checked', false);
          }

          if (!radioEl.checked)
          {
            $null.prop('checked', true);
          }

          view.toggleResult($tr);
          view.toggleValidity();
        }, 1);
      },
      'click #-addOther': function()
      {
        var other = dictionaries.controlCategories.get('000000000000000000000000');

        this.addResult({
          category: other.id,
          shortName: other.get('shortName'),
          fullName: other.get('fullName'),
          ok: false,
          comment: ''
        });
      },
      'change #-auditor': function()
      {
        this.setUpSectionSelect2();
        this.renderResults();
      },
      'change #-section': function()
      {
        this.renderResults();
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.resultI = 0;
    },

    toggleValidity: function()
    {
      var anyOk = !!this.$('input[value="1"]:checked').length;
      var anyNok = !!this.$('input[value="0"]:checked').length;

      this.$('input[value="1"]').first()[0].setCustomValidity(anyOk || anyNok ? '' : this.t('FORM:empty'));

      this.$id('nokConfirmGroup').toggleClass('hidden', !anyNok);
      this.$id('nokConfirmValue').prop('required', anyNok);
    },

    checkValidity: function(formData)
    {
      return formData.results.some(function(r) { return r.ok !== null; });
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      if (!formData.status)
      {
        formData.status = 'new';
      }

      formData.date = time.format(formData.date || new Date(), 'YYYY-MM-DD');

      formData.nokConfirm = 1;

      return formData;
    },

    serializeForm: function(formData)
    {
      var auditor = this.$id('auditor').select2('data');
      var dateMoment = time.getMoment(formData.date, 'YYYY-MM-DD');

      formData.auditor = {id: auditor.id, label: auditor.text};
      formData.date = dateMoment.isValid() ? dateMoment.toISOString() : null;

      formData.results = (formData.results || []).map(function(r, i)
      {
        r.ok = r.ok === '1' ? true : r.ok === '0' ? false : null;

        if (r.ok !== false)
        {
          r.comment = '';
        }

        if (!r.comment)
        {
          r.comment = '';
        }

        return r;
      });

      if (!formData.comment)
      {
        formData.comment = '';
      }

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      buttonGroup.toggle(this.$id('statusGroup'));
      this.setUpAuditorSelect2();
      this.setUpSectionSelect2();
      this.renderResults();
    },

    setUpAuditorSelect2: function()
    {
      var auditor = this.model.get('auditor') || currentUser.getInfo();
      var data = {};

      data[auditor.id] = {
        id: auditor.id,
        text: auditor.label
      };

      dictionaries.sections.forEntryType('audits').forEach(function(section)
      {
        if (!section.get('active'))
        {
          return;
        }

        section.get('auditors').forEach(function(auditor)
        {
          data[auditor.id] = {
            id: auditor.id,
            text: auditor.label
          };
        });
      });

      var $auditor = this.$id('auditor').val(auditor.id).select2({
        data: Object.values(data)
      });

      $auditor.select2('enable', !this.options.editMode && OshAudit.can.manage());
    },

    setUpSectionSelect2: function()
    {
      var canManage = OshAudit.can.manage();
      var section = dictionaries.sections.get(this.model.get('section'));
      var auditor = this.$id('auditor').val();
      var data = {};

      if (section)
      {
        data[section.id] = idAndLabel(section);
      }

      dictionaries.sections.forEntryType('audits').forEach(function(section)
      {
        if (!section.get('active'))
        {
          return;
        }

        if (canManage || section.get('auditors').some(function(a) { return a.id === auditor; }))
        {
          data[section.id] = idAndLabel(section);
        }
      });

      data = Object.values(data);

      var $section = this.$id('section');

      if (!section)
      {
        if (data.length === 1)
        {
          $section.val(data[0].id);
        }
        else
        {
          $section.val('');
        }
      }
      else
      {
        $section.val(section.id);
      }

      $section.select2({
        data: data
      });

      $section.select2('enable', !this.options.editMode && canManage);
    },

    renderResults: function()
    {
      var view = this;

      if (view.options.editMode)
      {
        view.model.get('results').forEach(view.addResult, view);
        view.toggleValidity();

        return;
      }

      var section = dictionaries.sections.get(view.$id('section').val());

      view.$id('results').empty();

      if (!section)
      {
        return;
      }

      section.get('controlLists').forEach(function(id)
      {
        var controlList = dictionaries.controlLists.get(id);

        if (!controlList || !controlList.get('active'))
        {
          return;
        }

        var used = {};

        controlList.get('categories').forEach(function(category)
        {
          if (used[category._id])
          {
            return;
          }

          used[category._id] = true;

          view.addResult({
            category: category._id,
            shortName: category.shortName,
            fullName: category.fullName,
            ok: null,
            comment: ''
          });
        });
      });

      view.toggleValidity();
    },

    addResult: function(result)
    {
      var $result = this.renderPartial(resultTemplate, {
        i: ++this.resultI,
        result: result
      });

      this.$id('results').append($result);
    },

    toggleResult: function($tr)
    {
      var ok = +$tr.find('input[name$=".ok"]:checked').val();
      var enabled = ok === 0;

      $tr.find('textarea').prop('disabled', !enabled);
    }

  });
});
