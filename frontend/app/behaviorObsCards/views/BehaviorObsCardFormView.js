// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'form2js',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/data/prodLines',
  'app/data/companies',
  'app/data/localStorage',
  'app/kaizenOrders/dictionaries',
  '../BehaviorObsCard',
  'app/behaviorObsCards/templates/form',
  'app/behaviorObsCards/templates/_formObservation',
  'app/behaviorObsCards/templates/_formRisk',
  'app/behaviorObsCards/templates/_formDifficulty',
  'app/behaviorObsCards/templates/_formRidEditor'
], function(
  _,
  form2js,
  t,
  time,
  user,
  buttonGroup,
  idAndLabel,
  FormView,
  setUpUserSelect2,
  prodLines,
  companies,
  localStorage,
  kaizenDictionaries,
  BehaviorObsCard,
  template,
  renderObservation,
  renderRisk,
  renderDifficulty,
  renderRidEditor
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'click .behaviorObsCards-form-radio': function(e)
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
          view.toggleValidity($tr);

          return;
        }

        e.preventDefault();

        setTimeout(function()
        {
          radioEl.checked = !radioEl.checked;

          if (!radioEl.checked)
          {
            $null.prop('checked', true);
          }

          if (radioEl.name.indexOf('safe') >= 0)
          {
            view.toggleBehavior($tr);
          }

          view.toggleValidity($tr);
        }, 1);
      },
      'change textarea': function(e)
      {
        this.toggleValidity(this.$(e.target).closest('tr'));
      },
      'click #-addObservation': function()
      {
        this.$id('observations').append(renderObservation({
          observation: {
            id: 'OTHER-' + Date.now(),
            behavior: kaizenDictionaries.getLabel('behaviours', 'OTHER'),
            observation: '',
            safe: null,
            easy: null
          },
          i: ++this.rowIndex
        }));
      },
      'click #-addRisk': function()
      {
        this.$id('risks').append(renderRisk({
          risk: this.createEmptyRisk(),
          i: ++this.rowIndex
        }));
      },
      'click #-addDifficulty': function()
      {
        this.$id('difficulties').append(renderDifficulty({
          difficulty: this.createEmptyDifficulty(),
          i: ++this.rowIndex
        }));
      },
      'click #-removeRisk': function()
      {
        this.removeEmpty('risks', 'addRisk', 'risk');
      },
      'click #-removeDifficulty': function()
      {
        this.removeEmpty('difficulties', 'addDifficulty', 'problem');
      },
      'click .behaviorObsCards-form-rid-message > a': function()
      {
        localStorage.setItem(
          'BOC_LAST',
          JSON.stringify(
            _.assign(
              this.model.toJSON(),
              this.getFormData()
            )
          )
        );
      },
      'click a[role=rid]': function(e)
      {
        this.showRidEditor(e.currentTarget.dataset.kind, e.currentTarget);

        return false;
      },

      'change #-company': function()
      {
        this.toggleCompanyName('');
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.rowIndex = 0;
    },

    removeEmpty: function(tbodyId, addBtnId, textareaName)
    {
      var $trs = this.$id(tbodyId).find('tr');

      for (var i = $trs.length - 1; i >= 0; --i)
      {
        var $tr = this.$($trs[i]);
        var $textarea = $tr.find('textarea');
        var $radio = $tr.find('input[type="radio"]:checked');

        if ($textarea[0].value.trim() === ''
          && $textarea[1].value.trim() === ''
          && (!$radio.length || $radio.val() === '-1'))
        {
          $tr.remove();
        }
      }

      if (this.$id(tbodyId).children().length === 0)
      {
        this.$id(addBtnId).click();
      }

      this.$id(tbodyId).find('textarea[name$="' + textareaName + '"]').first().select();
    },

    toggleValidity: function($tr)
    {
      var tbodyId = $tr ? $tr.parent().attr('id') : '';

      if (/risks/.test(tbodyId))
      {
        var $risk = $tr.find('textarea[name$="risk"]');
        var $cause = $tr.find('textarea[name$="cause"]');
        var $easy = $tr.find('input[name$="easy"]');
        var hasRisk = $risk.val().trim().length > 0;
        var hasCause = $cause.val().trim().length > 0;
        var easy = $easy.filter(':checked').val() || '-1';

        $risk.prop('required', easy !== '-1' || hasCause);
        $easy.prop('required', hasRisk);

        var $easyNull = $easy.filter('[value="-1"]').prop('disabled', hasRisk || hasCause);

        if (hasRisk || hasCause)
        {
          $easyNull.prop('checked', false);
        }
      }
      else if (/difficulties/.test(tbodyId))
      {
        var $problem = $tr.find('textarea[name$="problem"]');
        var $solution = $tr.find('textarea[name$="solution"]');
        var $behaviors = $tr.find('input[name$="behavior"]');
        var hasProblem = $problem.val().trim().length > 0;
        var hasSolution = $solution.val().trim().length > 0;
        var behavior = $behaviors.filter(':checked').val();

        $problem.prop('required', behavior !== '-1' || hasSolution);
        $behaviors.prop('required', hasProblem);

        var $behaviorNull = $behaviors.filter('[value="-1"]').prop('disabled', hasProblem || hasSolution);

        if (hasProblem || hasSolution)
        {
          $behaviorNull.prop('checked', false);
        }
      }

      this.toggleEasyDiscussed();
      this.toggleDifficulties();

      var first = this.$('input[name="observations[1].safe"]')[0];

      if (first)
      {
        first.setCustomValidity(
          this.hasAnyObservation() || this.hasAnyRisk() ? '' : this.t('FORM:ERROR:empty')
        );
      }
    },

    toggleDifficulties: function()
    {
      if (this.hasAnyDifficulty())
      {
        return;
      }

      var required = this.$id('observations').find('input[name$="easy"][value="0"]:checked').length
        || this.$id('risks').find('input[name$="easy"][value="0"]:checked').length;

      this.$id('difficulties').find('textarea').first().prop('required', required);
    },

    toggleBehavior: function($tr)
    {
      var safe = $tr.find('input[name$="safe"]:checked').val();

      $tr.find('textarea, input[name$="easy"]').prop('disabled', safe !== '0');
      $tr.find('textarea').first().select();

      if (safe !== '0')
      {
        $tr.find('input[name$="easy"]:checked').prop('checked', false);
      }
    },

    toggleEasyDiscussed: function()
    {
      var anyEasy = this.$('input[name$="easy"][value="1"]:checked').length > 0;

      this.$('input[name="easyDiscussed"]')
        .prop('disabled', !anyEasy)
        .closest('label')
        .toggleClass('is-required', anyEasy);
    },

    toggleCompanyName: function(otherName)
    {
      var companyId = this.$id('company').val();
      var company = companies.get(companyId);
      var other = /(pozostali|other)/i.test(companyId);

      this.$id('companyName')
        .prop('readonly', !other)
        .prop('required', other)
        .val(other ? otherName : company ? company.getLabel() : '')
        .closest('.form-group')
        .find('.control-label')
        .toggleClass('is-required', other);
    },

    hasAnyObservation: function()
    {
      return _.some(form2js(this.$id('observations')[0]).observations, this.filterObservation);
    },

    hasAnyRisk: function()
    {
      return _.some(form2js(this.$id('risks')[0]).risks, this.filterRisk);
    },

    hasAnyDifficulty: function()
    {
      return _.some(form2js(this.$id('difficulties')[0]).difficulties, this.filterDifficulty);
    },

    checkValidity: function(formData)
    {
      return (formData.observations || []).length
        || (formData.risks || []).length;
    },

    handleInvalidity: function()
    {
      this.$id('observations').find('input[type="radio"]').first().focus();
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.date = time.format(formData.date, 'YYYY-MM-DD');

      return formData;
    },

    serializeForm: function(formData)
    {
      var observer = this.$id('observer').select2('data');
      var superior = this.$id('superior').select2('data');
      var dateMoment = time.getMoment(formData.date, 'YYYY-MM-DD');

      formData.observer = {
        id: observer.id,
        label: observer.text
      };
      formData.superior = !superior ? null : {
        id: superior.id,
        label: superior.text
      };
      formData.date = dateMoment.isValid() ? dateMoment.toISOString() : null;
      formData.easyDiscussed = !!formData.easyDiscussed;
      formData.observations = (formData.observations || []).filter(this.filterObservation);
      formData.risks = (formData.risks || []).filter(this.filterRisk);
      formData.difficulties = (formData.difficulties || []).filter(this.filterDifficulty);

      var safeOther = null;

      formData.observations = formData.observations.filter(function(o)
      {
        if (/^OTHER/.test(o.id) && o.safe)
        {
          safeOther = o;

          return false;
        }

        return true;
      });

      if (safeOther)
      {
        formData.observations.push(safeOther);
      }

      return formData;
    },

    filterObservation: function(o)
    {
      o.id = o.behavior;
      o.behavior = kaizenDictionaries.getLabel('behaviours', /^OTHER-/.test(o.id) ? 'OTHER' : o.id);
      o.observation = (o.observation || '').trim();
      o.cause = (o.cause || '').trim();
      o.safe = o.safe === '-1' ? null : o.safe === '1';
      o.easy = o.easy === '-1' ? null : o.easy === '1';

      return o.safe !== null && o.easy !== null;
    },

    filterRisk: function(r)
    {
      r.risk = (r.risk || '').trim();
      r.cause = (r.cause || '').trim();
      r.easy = r.easy === '-1' ? null : r.easy === '1';

      return (r.risk.length > 0 || r.cause.length > 0) && r.easy !== null;
    },

    filterDifficulty: function(d)
    {
      d.problem = (d.problem || '').trim();
      d.solution = (d.solution || '').trim();
      d.behavior = d.behavior === '-1' ? null : d.behavior === '1';

      return d.problem.length > 0 || d.solution.length > 0 || d.behavior !== null;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('observerSection').select2({
        data: kaizenDictionaries.sections.map(idAndLabel)
      });

      this.$id('section').select2({
        data: kaizenDictionaries.sections.map(idAndLabel)
      });

      this.$id('line').select2({
        data: prodLines
          .filter(function(line) { return !line.get('deactivatedAt'); })
          .map(idAndLabel)
          .sort(function(a, b) { return a.text.localeCompare(b.text); })
      });

      this.$id('company').select2({
        data: companies.map(idAndLabel)
      });

      buttonGroup.toggle(this.$id('shift'));
      this.setUpObserverSelect2();
      this.setUpSuperiorSelect2();
      this.renderObservations();
      this.renderRisks();
      this.renderDifficulties();
      this.toggleEasyDiscussed();
      this.toggleCompanyName(this.model.get('companyName'));
      this.toggleValidity();

      this.$('input[autofocus]').focus();
    },

    setUpObserverSelect2: function()
    {
      var observer = this.model.get('observer');
      var $observer = setUpUserSelect2(this.$id('observer'), {
        textFormatter: function(user, name)
        {
          return name;
        },
        activeOnly: !this.options.editMode
      });

      if (observer)
      {
        $observer.select2('data', {
          id: observer.id,
          text: observer.label
        });
      }
    },

    setUpSuperiorSelect2: function()
    {
      var superior = this.model.get('superior');
      var $superior = setUpUserSelect2(this.$id('superior'), {
        textFormatter: function(user, name)
        {
          return name;
        },
        activeOnly: !this.options.editMode
      });

      if (superior)
      {
        $superior.select2('data', {
          id: superior.id,
          text: superior.label
        });
      }
    },

    setUpAddObservationSelect2: function()
    {
      var map = {};

      this.$id('observations').find('input[name$="behavior"]').each(function()
      {
        map[this.value] = 1;
      });

      this.$id('addObservation').select2({
        width: '500px',
        placeholder: 'Wybierz kategorię zachowań, aby dodać nową obserwację...',
        minimumResultsForSearch: 7,
        data: kaizenDictionaries.behaviours
          .filter(function(behavior) { return !map[behavior.id]; })
          .map(idAndLabel)
      });
    },

    renderObservations: function()
    {
      var view = this;

      this.$id('observations').html(
        this.serializeObservationsToForm()
          .map(function(obs)
          {
            return renderObservation({
              observation: obs,
              i: ++view.rowIndex
            });
          })
          .join('')
      );
    },

    serializeObservationsToForm: function()
    {
      var map = {};
      var list = [];

      (this.model.get('observations') || []).forEach(function(obs)
      {
        map[obs.id] = obs;
      });

      kaizenDictionaries.behaviours.forEach(function(behavior)
      {
        var obs = map[behavior.id];

        if (obs)
        {
          obs.behavior = behavior.t('name');

          list.push(obs);

          delete map[behavior.id];
        }
        else
        {
          list.push({
            id: behavior.id,
            behavior: behavior.t('name'),
            observation: '',
            safe: null,
            easy: null
          });
        }
      });

      _.forEach(map, function(obs)
      {
        list.push(obs);
      });

      return list;
    },

    renderRisks: function()
    {
      var view = this;
      var risks = this.model.get('risks') || [];

      while (risks.length < 2)
      {
        risks.push(this.createEmptyRisk());
      }

      risks.push(this.createEmptyRisk());

      this.$id('risks').html(
        risks.map(function(risk)
        {
          return renderRisk({
            risk: risk,
            i: ++view.rowIndex
          });
        }).join('')
      );
    },

    renderDifficulties: function()
    {
      var view = this;
      var difficulties = this.model.get('difficulties') || [];

      while (difficulties.length < 2)
      {
        difficulties.push(this.createEmptyDifficulty());
      }

      difficulties.push(this.createEmptyDifficulty());

      this.$id('difficulties').html(
        difficulties.map(function(difficulty)
        {
          return renderDifficulty({
            difficulty: difficulty,
            i: ++view.rowIndex
          });
        }).join('')
      );
    },

    createEmptyRisk: function()
    {
      return {
        risk: '',
        cause: '',
        easy: null
      };
    },

    createEmptyDifficulty: function()
    {
      return {
        problem: '',
        solution: '',
        behavior: null
      };
    },

    handleSuccess: function()
    {
      localStorage.removeItem('BOC_LAST');

      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl() + '?'
          + (this.options.editMode ? '' : '&thank=you')
          + (!this.options.standalone ? '' : '&standalone=1'),
        trigger: true
      });
    },

    showRidEditor: function(ridProperty, aEl)
    {
      var view = this;
      var $a = view.$(aEl);

      if ($a.next('.popover').length)
      {
        $a.popover('destroy');

        return;
      }

      $a.popover({
        placement: 'auto top',
        html: true,
        trigger: 'manual',
        content: renderRidEditor({
          idPrefix: this.idPrefix,
          helpers: this.getTemplateHelpers(),
          property: ridProperty,
          rid: this.model.get(ridProperty) || ''
        })
      }).popover('show');

      var $popover = $a.next('.popover');
      var $input = $popover.find('.form-control').select();
      var $submit = $popover.find('.btn-default');
      var $cancel = $popover.find('.btn-link');

      $cancel.on('click', function()
      {
        $a.popover('destroy');
      });

      $input.on('keydown', function(e)
      {
        if (e.keyCode === 13)
        {
          return false;
        }
      });

      $input.on('keyup', function(e)
      {
        if (e.keyCode === 13)
        {
          $submit.click();

          return false;
        }
      });

      $submit.on('click', function()
      {
        $input.prop('disabled', true);
        $submit.prop('disabled', true);
        $cancel.prop('disabled', true);

        var rid = parseInt($input.val(), 10) || 0;

        if (rid <= 0)
        {
          return updateRid(null);
        }

        var url = (ridProperty === 'nearMiss' ? '/kaizen/orders' : '/suggestions') + '/' + rid;
        var req = view.ajax({url: url});

        req.fail(function(jqXhr)
        {
          view.showErrorMessage(t(
            'behaviorObsCards',
            'FORM:ridEditor:' + (jqXhr.status === 404 ? 'notFound' : 'failure')
          ));

          $input.prop('disabled', false);
          $submit.prop('disabled', false);
          $cancel.prop('disabled', false);

          (jqXhr.status === 404 ? $input : $submit).focus();
        });

        req.done(function()
        {
          updateRid(rid);
        });

        return false;
      });

      function updateRid(newRid)
      {
        $a
          .popover('destroy')
          .closest('.message')
          .find('.behaviorObsCards-form-rid-message')
          .html(view.t('FORM:MSG:' + ridProperty + ':' + (newRid ? 'edit' : 'add'), {
            rid: newRid
          }));

        view.model.attributes[ridProperty] = newRid;

        view.$('input[name=' + ridProperty + ']').val(newRid || '');
      }
    }

  });
});
