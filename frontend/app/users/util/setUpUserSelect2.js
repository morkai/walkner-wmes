define(['underscore', 'app/i18n'], function(_, t)
{
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
        results: function(data)
        {
          return {
            results: (data.collection || [])
              .map(function(user)
              {
                var name = user.lastName && user.firstName
                  ? (user.lastName + ' ' + user.firstName)
                  : '-';
                var personellId = user.personellId ? user.personellId : '-';

                return {
                  id: user._id,
                  text: name + ' (' + personellId + ')',
                  name: name,
                  login: user.login
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
