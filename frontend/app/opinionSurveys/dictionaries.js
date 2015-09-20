// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  '../broker',
  '../pubsub',
  '../user',
  '../opinionSurveyDivisions/OpinionSurveyDivisionCollection',
  '../opinionSurveyEmployers/OpinionSurveyEmployerCollection',
  '../opinionSurveyQuestions/OpinionSurveyQuestionCollection'
], function(
  $,
  broker,
  pubsub,
  user,
  OpinionSurveyDivisionCollection,
  OpinionSurveyEmployerCollection,
  OpinionSurveyQuestionCollection
) {
  'use strict';

  var DICTIONARY_IDS = ['divisions', 'employers', 'questions'];

  var req = null;
  var releaseTimer = null;
  var pubsubSandbox = null;
  var dictionaries = {
    actionStatuses: ['planned', 'progress', 'done', 'failed', 'late'],
    divisions: new OpinionSurveyDivisionCollection(),
    employers: new OpinionSurveyEmployerCollection(),
    questions: new OpinionSurveyQuestionCollection(),
    loaded: false,
    load: function()
    {
      if (releaseTimer !== null)
      {
        clearTimeout(releaseTimer);
        releaseTimer = null;
      }

      if (dictionaries.loaded)
      {
        return null;
      }

      if (req !== null)
      {
        return req;
      }

      req = $.ajax({
        url: '/opinionSurveys/dictionaries'
      });

      req.done(function(res)
      {
        dictionaries.loaded = true;

        DICTIONARY_IDS.forEach(function(dictionaryId)
        {
          dictionaries[dictionaryId].reset(res[dictionaryId]);
        });
      });

      req.fail(unload);

      req.always(function()
      {
        req = null;
      });

      pubsubSandbox = pubsub.sandbox();

      DICTIONARY_IDS.forEach(function(dictionaryId)
      {
        pubsubSandbox.subscribe('opinionSurveys.' + dictionaryId + '.**', handleDictionaryMessage);
      });

      return req;
    },
    unload: function()
    {
      if (releaseTimer !== null)
      {
        clearTimeout(releaseTimer);
      }

      releaseTimer = setTimeout(unload, 30000);
    },
    getLabel: function(dictionary, id)
    {
      if (!dictionaries[dictionary])
      {
        return id;
      }

      var model = dictionaries[dictionary].get(id);

      if (!model)
      {
        return id;
      }

      return model.getLabel();
    }
  };

  function unload()
  {
    releaseTimer = null;

    if (pubsubSandbox !== null)
    {
      pubsubSandbox.destroy();
      pubsubSandbox = null;
    }

    dictionaries.loaded = false;

    DICTIONARY_IDS.forEach(function(dictionaryId)
    {
      dictionaries[dictionaryId].reset();
    });
  }

  function handleDictionaryMessage(message, topic)
  {
    var topicParts = topic.split('.');
    var collection = dictionaries[topicParts[1]];

    if (!collection)
    {
      return;
    }

    switch (topicParts[1])
    {
      case 'added':
        collection.add(message.model);
        break;

      case 'edited':
      {
        var editedModel = collection.get(message.model._id);

        if (editedModel)
        {
          editedModel.set(message.model);
        }
        break;
      }

      case 'deleted':
        collection.remove(collection.get(message.model._id));
        break;
    }

    broker.publish(topic, message);
  }

  return dictionaries;
});
