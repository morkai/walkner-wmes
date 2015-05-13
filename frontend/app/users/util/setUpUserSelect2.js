// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/user'
], function(
  _,
  t,
  user
) {
  'use strict';

  return function setUpUserSelect2($input, options)
  {
    return $input.select2(_.extend({
      openOnEnter: null,
      allowClear: true,
      minimumInputLength: 3,
      placeholder: t('users', 'select2:placeholder'),
      ajax: {
        cache: true,
        quietMillis: 300,
        url: function(term)
        {
          term = term.trim();

          var property = /^[0-9]+$/.test(term) ? 'personellId' : 'lastName';

          term = encodeURIComponent('^' + term);

          return '/users'
            + '?select(personellId,lastName,firstName,login)'
            + '&sort(' + property + ')'
            + '&limit(20)&regex(' + property + ',' + term + ',i)';
        },
        results: function(data, page, query)
        {
          var root = user.getRootUserData();
          var results = [{
            _id: '$SYSTEM',
            text: t('users', 'select2:users:system'),
            name: t('users', 'select2:users:system'),
            login: null,
            personellId: '-'
          }, {
            _id: root._id,
            text: root.name || root.login,
            name: root.name || root.login,
            login: root.login,
            personellId: '-'
          }].filter(function(user)
          {
            return user.text.toLowerCase().indexOf(query.term.toLowerCase()) !== -1;
          });

          var users = results.concat(data.collection || []);

          if (options && options.userFilter)
          {
            users = users.filter(options.userFilter);
          }

          return {
            results: users.map(function(user)
            {
              var name = user.lastName && user.firstName
                ? (user.lastName + ' ' + user.firstName)
                : (user.name || user.login || user._id);
              var text = name;

              if (user.personellId)
              {
                text += ' (' + user.personellId + ')';
              }

              return {
                id: user._id,
                text: text,
                name: name,
                login: user.login,
                personellId: user.personellId || '-'
              };
            })
            .sort(function(a, b)
            {
              return a.text.localeCompare(b.text);
            })
          };
        }
      }
    }, options));
  };
});
