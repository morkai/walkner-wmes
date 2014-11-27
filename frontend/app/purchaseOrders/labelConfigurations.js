// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../i18n',
  '../user'
], function(
  t,
  user
) {
  'use strict';

  var vendorsToPapers = {
    '48003321': ['A5', 'A6', 'A7']
  };

  function addVendorPapers(papers, vendorNo)
  {
    vendorsToPapers[vendorNo].forEach(function(paper)
    {
      papers.push({
        id: 'vendor/' + vendorNo + '/' + paper,
        text: t('purchaseOrders', 'paper:vendor', {
          vendorNo: vendorNo,
          paper: paper
        })
      });
    });
  }

  return {
    getBarcodes: function()
    {
      var barcodes = [
        {
          id: 'code128',
          text: t('purchaseOrders', 'barcode:code128')
        }
      ];

      if (user.data.super)
      {
        barcodes.push({
          id: 'qr',
          text: t('purchaseOrders', 'barcode:qr')
        });
      }

      return barcodes;
    },
    getPapers: function()
    {
      var papers = [
        {id: 'a4', text: t('purchaseOrders', 'paper:a4')},
        {id: '104x42', text: t('purchaseOrders', 'paper:104x42')}
      ];

      if (user.data.super || !user.data.vendor)
      {
        Object.keys(vendorsToPapers).forEach(function(vendorNo)
        {
          addVendorPapers(papers, vendorNo);
        });
      }
      else if (vendorsToPapers[user.data.vendor])
      {
        addVendorPapers(papers, user.data.vendor);
      }

      return papers;
    }
  };
});
