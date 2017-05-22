// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'form2js',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/data/prodLines',
  'app/kaizenOrders/dictionaries',
  '../BehaviorObsCard',
  'app/behaviorObsCards/templates/form',
  'app/behaviorObsCards/templates/_formObservation',
  'app/behaviorObsCards/templates/_formRisk',
  'app/behaviorObsCards/templates/_formDifficulty'
], function(
  _,
  $,
  form2js,
  t,
  time,
  user,
  buttonGroup,
  idAndLabel,
  FormView,
  setUpUserSelect2,
  prodLines,
  kaizenDictionaries,
  BehaviorObsCard,
  template,
  renderObservation,
  renderRisk,
  renderDifficulty
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.extend({

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
      }

    }, FormView.prototype.events),

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

      this.$('input[name="observations[1].safe"]')[0].setCustomValidity(
        this.hasAnyObservation() || this.hasAnyRisk() ? '' : t('behaviorObsCards', 'FORM:ERROR:empty')
      );
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

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.rowIndex = 0;
    },

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {

      });
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
        || (formData.risks || []).length
        || (formData.difficulties || []).length;
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
      var dateMoment = time.getMoment(formData.date, 'YYYY-MM-DD');

      formData.observer = {
        id: observer.id,
        label: observer.text
      };
      formData.date = dateMoment.isValid() ? dateMoment.toISOString() : null;
      formData.easyDiscussed = !!formData.easyDiscussed;
      formData.observations = (formData.observations || []).filter(this.filterObservation);
      formData.risks = (formData.risks || []).filter(this.filterRisk);
      formData.difficulties = (formData.difficulties || []).filter(this.filterDifficulty);

      return formData;
    },

    filterObservation: function(o)
    {
      o.id = o.behavior;
      o.behavior = kaizenDictionaries.behaviours.get(o.id).get('name');
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

      return (d.problem.length > 0 || d.solution.length > 0) && d.behavior !== null;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('section').select2({
        data: kaizenDictionaries.sections.map(idAndLabel)
      });

      this.$id('line').select2({
        data: prodLines
          .filter(function(line) { return !line.get('deactivatedAt'); })
          .map(idAndLabel)
          .sort(function(a, b) { return a.text.localeCompare(b.text); })
      });

      this.setUpObserverSelect2();
      this.renderObservations();
      this.renderRisks();
      this.renderDifficulties();
      this.toggleEasyDiscussed();
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
        }
      });

      if (observer)
      {
        $observer.select2('data', {
          id: observer.id,
          text: observer.label
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
          obs.behavior = behavior.get('name');

          list.push(obs);

          delete map[behavior.id];
        }
        else
        {
          list.push({
            id: behavior.id,
            behavior: behavior.get('name'),
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
    }

  });
});
