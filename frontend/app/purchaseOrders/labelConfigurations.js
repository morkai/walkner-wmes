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

  var A_PAPER_SIZES = {
    4: {w: 210, h: 297},
    5: {w: 148, h: 210},
    6: {w: 105, h: 148},
    7: {w: 74, h: 105}
  };

  var LANDSCAPE_PAPERS = [
    'a4',
    'vendor/48003321/A7'
  ];

  var VENDORS_TO_PAPERS = {
    '48003321': ['A5', 'A6', 'A7']
  };

  function addVendorPapers(vendorGroups, vendorNo)
  {
    var vendorPapers = [];

    VENDORS_TO_PAPERS[vendorNo].forEach(function(paper)
    {
      vendorPapers.push({
        id: 'vendor/' + vendorNo + '/' + paper,
        text: paper
      });
    });

    vendorGroups.push({
      label: vendorNo,
      papers: vendorPapers
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
    getVendorLabelTypes: function()
    {
      return [
        {id: 'cordLength', text: t('purchaseOrders', 'vendorLabelType:cordLength')}
      ];
    },
    getPaperGroups: function()
    {
      var paperGroups = [
        {
          label: t('purchaseOrders', 'paper:generic'),
          papers: [
            {id: 'a4', text: t('purchaseOrders', 'paper:a4')},
            {id: '104x42', text: t('purchaseOrders', 'paper:104x42')}
          ]
        }
      ];

      if (user.data.super || !user.data.vendor)
      {
        Object.keys(VENDORS_TO_PAPERS).forEach(function(vendorNo)
        {
          addVendorPapers(paperGroups, vendorNo);
        });
      }
      else if (VENDORS_TO_PAPERS[user.data.vendor])
      {
        addVendorPapers(paperGroups, user.data.vendor);
      }

      return paperGroups;
    },
    getPaperOptions: function(paper)
    {
      var paperSize = this.getPaperSize(paper);

      return {
        orientation: this.getPaperOrientation(paper),
        width: paperSize.w,
        height: paperSize.h
      };
    },
    getPaperOrientation: function(paper)
    {
      return LANDSCAPE_PAPERS.indexOf(paper) === -1 ? 'portrait' : 'landscape';
    },
    getPaperSize: function(paper)
    {
      var matches = paper.match(/([0-9]+)x([0-9]+)/);

      if (matches !== null)
      {
        return {
          w: parseInt(matches[1], 10),
          h: parseInt(matches[2], 10)
        };
      }

      matches = paper.match(/a([0-9])/i);

      if (matches !== null && A_PAPER_SIZES[matches[1]])
      {
        return A_PAPER_SIZES[matches[1]];
      }

      return A_PAPER_SIZES[4];
    }
  };
});
