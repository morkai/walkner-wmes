// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n'
], function(
  _,
  t
) {
  'use strict';

  function vendorToSelect2(vendor)
  {
    var text = vendor._id;

    if (vendor.name)
    {
      text += ': ' + vendor.name;
    }

    return {
      id: vendor._id,
      text: text
    };
  }

  return function setUpVendorSelect2($vendor, options)
  {
    $vendor.select2(_.extend({
      width: '100%',
      allowClear: true,
      minimumInputLength: 3,
      placeholder: t('vendors', 'select2:placeholder'),
      ajax: {
        cache: true,
        quietMillis: 300,
        url: function(term)
        {
          term = term.trim();

          var property = /^[0-9]+$/.test(term) ? '_id' : 'name';

          term = encodeURIComponent(term);

          return '/vendors'
            + '?sort(' + property + ')'
            + '&limit(50)&regex(' + property + ',string:' + term + ',i)';
        },
        results: function(data)
        {
          return {
            results: (data.collection || []).map(vendorToSelect2)
          };
        }
      }
    }, options));

    $vendor.prepareData = vendorToSelect2;

    return $vendor;
  };
});
