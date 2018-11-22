// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/pubsub',
  'app/time',
  'app/data/prodFunctions',
  'app/data/companies',
  'app/users/templates/userInfoPopover'
], function(
  _,
  $,
  pubsub,
  time,
  prodFunctions,
  companies,
  contentTemplate
) {
  'use strict';

  var PROPS = [
    'firstName',
    'lastName',
    'login',
    'personellId',
    'email',
    'mobile',
    'prodFunction',
    'company',
    'kdPosition',
    'presence'
  ];

  var users = {};
  var sub = null;
  var $popover = null;
  var containerTemplate = null;

  function setUpPubsub()
  {
    sub = pubsub.subscribe('users.edited', function(message)
    {
      var user = message.model;

      if (users[user._id] === null)
      {
        users[user._id] = {};
      }

      if (users[user._id])
      {
        _.assign(users[user._id], _.pick(user, Object.keys(PROPS)));
      }
    });
  }

  function loadPopover(userInfoEl, userId)
  {
    if (sub === null)
    {
      setUpPubsub();
    }

    userInfoEl.style.cursor = 'wait';

    var req = $.ajax({
      url: '/users/' + userId + '?select(' + PROPS.join(',') + ')'
    });

    req.always(function()
    {
      userInfoEl.style.cursor = '';
    });

    req.fail(function()
    {
      users[userId] = null;
    });

    req.done(function(user)
    {
      users[userId] = user;

      showPopover(userInfoEl, userId);
    });
  }

  function showPopover(userInfoEl, userId)
  {
    if ($popover && $popover[0] === userInfoEl)
    {
      return;
    }

    hidePopover();

    var hideOnLeave = true;
    var user = users[userId];
    var prodFunction = prodFunctions.get(user.prodFunction);
    var company = companies.get(user.company);
    var mobile = resolveMobile(user.mobile);

    if (mobile)
    {
      if (/^\+48[0-9]{9}$/.test(mobile.number))
      {
        mobile.label = mobile.number.substr(3, 3)
          + ' ' + mobile.number.substr(6, 3)
          + ' ' + mobile.number.substr(9, 3);
      }
      else
      {
        mobile.label = mobile.number;
      }
    }

    if (!containerTemplate)
    {
      containerTemplate = $($.fn.popover.Constructor.DEFAULTS.template).addClass('userInfoPopover')[0].outerHTML;
    }

    $popover = $(userInfoEl).popover({
      placement: 'top',
      container: userInfoEl.parentNode,
      trigger: 'manual',
      html: true,
      content: contentTemplate({
        userInfo: {
          _id: user._id,
          name: user.firstName && user.lastName ? (user.firstName + ' ' + user.lastName) : user.login,
          personnelId: user.personellId,
          position: user.kdPosition || (prodFunction ? prodFunction.getLabel() : null),
          company: company ? company.getLabel() : user.company,
          email: user.email,
          mobile: mobile
        }
      }),
      template: containerTemplate
    });

    $popover.on('click.userInfoPopover', function()
    {
      if (hideOnLeave)
      {
        hideOnLeave = false;
      }
      else
      {
        hidePopover();
      }

      return false;
    });

    $popover.on('mouseleave.userInfoPopover', function()
    {
      if (hideOnLeave)
      {
        hidePopover();
      }
    });

    $popover.popover('show');
  }

  function hidePopover()
  {
    if ($popover)
    {
      $popover.off('.userInfoPopover');
      $popover.popover('destroy');
      $popover = null;

      $('.userInfoPopover').remove();
    }
  }

  function resolveMobile(mobiles)
  {
    var now = parseMobileTime(time.format(Date.now(), 'HH:mm')).value;

    return _.find(mobiles, function(mobile)
    {
      const fromTime = parseMobileTime(mobile.fromTime);
      const toTime = parseMobileTime(mobile.toTime === '00:00' ? '24:00' : mobile.toTime);

      if (toTime.value < fromTime.value)
      {
        return now < toTime.value || now >= fromTime.value;
      }

      if (fromTime.value < toTime.value)
      {
        return now >= fromTime.value && now < toTime.value;
      }

      return false;
    });
  }

  function parseMobileTime(time)
  {
    const parts = time.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    return {
      hours: hours,
      minutes: minutes,
      value: hours * 1000 + minutes
    };
  }

  $(document.body).on('click', function(e)
  {
    if (!$popover)
    {
      return;
    }

    if ($(e.target).closest('.popover').length)
    {
      setTimeout(hidePopover, 1);

      return;
    }

    hidePopover();
  });

  $(document.body).on('mouseenter', '.userInfo-label', function(e)
  {
    var userInfoEl = e.currentTarget.parentNode;
    var userId = userInfoEl.dataset.userId;

    if (!userId)
    {
      return;
    }

    if (users[userId])
    {
      return showPopover(userInfoEl, userId);
    }

    if (users[userId] !== null)
    {
      loadPopover(userInfoEl, userId);
    }
  });
});
