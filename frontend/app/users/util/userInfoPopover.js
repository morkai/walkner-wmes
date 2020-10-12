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
  var showTimer = null;
  var lastUserId = null;
  var hideOnLeave = true;
  var linkToDetails = null;

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

    users[userId] = null;

    var req = $.ajax({
      url: '/users?_id=' + userId + '&limit(1)&select(' + PROPS.join(',') + ')'
    });

    req.always(function()
    {
      userInfoEl.style.cursor = '';
    });

    req.done(function(res)
    {
      if (res.totalCount !== 1)
      {
        return;
      }

      users[userId] = res.collection[0];

      if (lastUserId === userId)
      {
        showPopover(userInfoEl, userId, true);
      }
    });
  }

  function showPopover(userInfoEl, userId, showNow)
  {
    if ($popover && $popover[0] === userInfoEl)
    {
      return;
    }

    if (linkToDetails === null)
    {
      linkToDetails = $('.navbar').find('a[href^="#users"]').length > 0;
    }

    hidePopover();

    lastUserId = userId;

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
        linkToDetails: linkToDetails,
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

    $popover.data('userId', user._id);

    $popover.on('click.userInfoPopover', function(e)
    {
      if (e.currentTarget.dataset.clickable === '0' && !e.ctrlKey)
      {
        return;
      }

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

    if (showTimer)
    {
      clearTimeout(showTimer);
    }

    if (showNow)
    {
      $popover.popover('show');

      return;
    }

    showTimer = setTimeout(function()
    {
      if ($popover && $popover.data('userId') === lastUserId)
      {
        $popover.popover('show');
      }
    }, 200);
  }

  function hidePopover()
  {
    lastUserId = null;
    hideOnLeave = true;

    if (showTimer)
    {
      clearTimeout(showTimer);
      showTimer = null;
    }

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
      var fromTime = parseMobileTime(mobile.fromTime);
      var toTime = parseMobileTime(mobile.toTime === '00:00' ? '24:00' : mobile.toTime);

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
    var parts = time.split(':');
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);

    return {
      hours: hours,
      minutes: minutes,
      value: hours * 1000 + minutes
    };
  }

  $(document.body)
    .on('click', function(e)
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
    })
    .on('mouseenter', '.userInfo-label', function(e)
    {
      var userInfoEl = e.currentTarget.parentNode;
      var userId = userInfoEl.dataset.userId;

      if (!userId)
      {
        return;
      }

      lastUserId = userId;

      if (users[userId])
      {
        return showPopover(userInfoEl, userId);
      }

      if (users[userId] !== null)
      {
        loadPopover(userInfoEl, userId);
      }
    })
    .on('mouseleave', '.userInfo-label', function(e)
    {
      if (hideOnLeave)
      {
        hidePopover();

        return;
      }

      if (e.currentTarget.parentNode.dataset.userId === lastUserId)
      {
        return;
      }

      hideOnLeave = true;

      hidePopover();
    });
});
