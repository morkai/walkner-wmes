/* globals $, LANG, SURVEY */
/* eslint-disable strict, no-alert */

'use strict';

$('body').on('keydown', function(e)
{
  if (e.which === 80 && e.ctrlKey)
  {
    window.location.href = $('#printer').attr('href');

    return false;
  }
});

$('#submit').on('keydown', function(e)
{
  if (e.which === 9)
  {
    $('#comment').focus();

    return false;
  }
}).on('click', function()
{
  $('#submit').prop('disabled', true);

  var values = serializeValues();
  var response = {
    _id: (Date.now().toString(36) + Math.round(1000000000 + Math.random() * 8999999999).toString(36)).toUpperCase(),
    survey: SURVEY._id,
    scanTemplate: null,
    comment: values.comment,
    employer: values.employer,
    division: values.division,
    superior: values.superior,
    answers: Object.keys(values.answers).map(function(question)
    {
      return {
        question: question,
        answer: values.answers[question]
      };
    })
  };
  var req = $.ajax({
    method: 'POST',
    url: '/opinionSurveys/responses?guest=1',
    data: JSON.stringify(response),
    dataType: 'json',
    accepts: {
      json: 'application/json'
    },
    contentType: 'application/json'
  });

  req.fail(function()
  {
    $('#submit').prop('disabled', false);

    alert('Failed to save the response.');
  });

  req.done(function()
  {
    $('body').addClass('closed');
    $('#bd').html('<p>' + LANG.THANKS + '</p>');

    window.scrollTo(0, 0);

    setTimeout(function() { window.location.reload(); }, 10000);
  });

  return false;
});

$('#bd')
  .on('click', '.label', function(e) { selectOption($(e.currentTarget).find('.option')); })
  .on('keyup', '.label', function(e)
  {
    if (e.which === 13 || e.which === 32)
    {
      selectOption($(e.currentTarget).find('.option'));

      return false;
    }
  });

function selectOption($option)
{
  $('.option.is-selected[data-group="' + $option.attr('data-group') + '"]').removeClass('is-selected');
  $option.addClass('is-selected');

  var values = serializeValues();
  var naAnswers = 0;

  SURVEY.questions.forEach(function(question)
  {
    naAnswers += values.answers[question._id] === 'na' ? 1 : 0;
  });

  $('#submit').prop('disabled', !values.employer || !values.superior || naAnswers === SURVEY.questions.length);
}

function serializeValues()
{
  var values = {
    comment: $('#comment').val().trim(),
    employer: $('.is-selected[data-group="employer"]').attr('data-value'),
    superior: $('.is-selected[data-group="superior"]').attr('data-value'),
    division: null,
    answers: {}
  };

  SURVEY.superiors.forEach(function(superior)
  {
    if (values.superior === superior._id)
    {
      values.division = superior.division;
    }
  });

  SURVEY.questions.forEach(function(question)
  {
    values.answers[question._id] = $('.is-selected[data-group="' + question._id + '"]').attr('data-value');
  });

  return values;
}
