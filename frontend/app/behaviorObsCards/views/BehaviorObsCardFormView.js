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
          e.target.querySelector('input').click();
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

        e.preventDefault();

        setTimeout(function()
        {
          e.target.checked = !e.target.checked;

          if (!e.target.checked)
          {
            view.$(e.target)
              .closest('tr')
              .find('input[name="' + e.target.name + '"][value="-1"]')
              .prop('checked', true);
          }

          view.toggleValidity();
        }, 1);
      },
      'click #-addRisk': function()
      {
        this.$id('risks').append(renderRisk({
          risk: {
            risk: '',
            cause: '',
            easy: null
          },
          i: ++this.rowIndex
        }));
      },
      'click #-addDifficulty': function()
      {
        this.$id('difficulties').append(renderDifficulty({
          difficulty: {
            problem: '',
            solution: '',
            behavior: null
          },
          i: ++this.rowIndex
        }));
      }

    }, FormView.prototype.events),

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

    toggleValidity: function()
    {
      var valid = this.hasAnyObservation()
        || this.hasAnyRisk()
        || this.hasAnyDifficulty();

      this.$id('observations').find('textarea').first()[0].setCustomValidity(
        valid ? '' : t('behaviorObsCards', 'FORM:ERROR:empty')
      );
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
      formData.observations = formData.observations.filter(this.filterObservation);
      formData.risks = formData.risks.filter(this.filterRisk);
      formData.difficulties = formData.difficulties.filter(this.filterDifficulty);

      return formData;
    },

    filterObservation: function(o)
    {
      o.id = o.behavior;
      o.behavior = kaizenDictionaries.behaviours.get(o.id).get('name');
      o.observation = (o.observation || '').trim();
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

      this.$id('risks').html(
        this.serializeRisksToForm()
          .map(function(risk)
          {
            return renderRisk({
              risk: risk,
              i: ++view.rowIndex
            });
          })
          .join('')
      );
    },

    serializeRisksToForm: function()
    {
      var list = this.model.get('risks') || [];

      list.push({
        risk: '',
        cause: '',
        easy: null
      });

      return list;
    },

    renderDifficulties: function()
    {
      var view = this;

      this.$id('difficulties').html(
        this.serializeDifficultiesToForm()
          .map(function(difficulty)
          {
            return renderDifficulty({
              difficulty: difficulty,
              i: ++view.rowIndex
            });
          })
          .join('')
      );
    },

    serializeDifficultiesToForm: function()
    {
      var list = this.model.get('difficulties') || [];

      list.push({
        problem: '',
        solution: '',
        behavior: null
      });

      return list;
    }

  });
});
