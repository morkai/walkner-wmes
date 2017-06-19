// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../core/Model',
  '../data/localStorage'
], function(
  _,
  t,
  Model,
  localStorage
) {
  'use strict';

  var STORAGE_KEY = 'WMES:DOCS';

  function createNc15Filter(mode, prefix)
  {
    var re = new RegExp('^(' + prefix.replace(/ /g, '|') + ')');

    return function filterNc15(nc15)
    {
      if (prefix === '')
      {
        return true;
      }

      var matches = re.test(nc15);

      return (mode === 'inclusive' && matches) || (mode === 'exclusive' && !matches);
    };
  }

  return Model.extend({

    defaults: function()
    {
      return {
        prodLine: {
          _id: null,
          name: ''
        },
        localServerUrl: 'http://127.0.0.1:1335',
        localServerPath: '',
        prefixFilterMode: 'exclusive',
        prefixFilter: '161 165 198',
        localOrder: {
          no: null,
          nc12: '',
          name: '',
          documents: {},
          nc15: null
        },
        remoteOrder: {
          no: null,
          nc12: '',
          name: '',
          documents: {},
          nc15: null
        },
        localFile: null,
        fileSource: null
      };
    },

    initialize: function()
    {
      this.on('change:prefixFilterMode change:prefixFilter', function()
      {
        this.filterNc15 = createNc15Filter(this.get('prefixFilterMode'), this.get('prefixFilter'));
      });
    },

    load: function()
    {
      this.set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
    },

    save: function()
    {
      var state = {
        prodLine: this.get('prodLine'),
        localOrder: this.get('localOrder'),
        remoteOrder: this.get('remoteOrder'),
        prefixFilterMode: this.get('prefixFilterMode'),
        prefixFilter: this.get('prefixFilter')
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

      this.trigger('save');
    },

    filterNc15: function()
    {
      return true;
    },

    selectDocument: function(nc15, name)
    {
      var localOrder = this.get('localOrder');
      var remoteOrder = this.get('remoteOrder');
      var activeType = localOrder.no ? 'localOrder' : 'remoteOrder';
      var activeOrder = localOrder.no ? localOrder : remoteOrder;
      var data = {
        localFile: null
      };

      if (!activeOrder.documents[nc15] && !_.isEmpty(name))
      {
        activeOrder.documents[nc15] = name + '$__EXTERNAL__';
      }

      data[activeType] = _.defaults({nc15: nc15}, activeOrder);

      this.set(data);
      this.save();
    },

    removeDocument: function(nc15)
    {
      var localOrder = this.get('localOrder');
      var remoteOrder = this.get('remoteOrder');
      var activeType = localOrder.no ? 'localOrder' : 'remoteOrder';
      var activeOrder = _.defaults({}, localOrder.no ? localOrder : remoteOrder);
      var data = {};

      if (activeOrder.nc15 === nc15)
      {
        activeOrder.nc15 = null;
      }

      delete activeOrder.documents[nc15];

      data[activeType] = activeOrder;

      this.set(data);
      this.save();
    },

    getSettings: function()
    {
      var prodLine = this.get('prodLine');

      return {
        prodLineId: prodLine._id,
        prodLineName: prodLine.name,
        prefixFilterMode: this.get('prefixFilterMode'),
        prefixFilter: this.get('prefixFilter'),
        localServerUrl: this.get('localServerUrl'),
        localServerPath: this.get('localServerPath')
      };
    },

    isExternalDocument: function()
    {
      var currentOrder = this.getCurrentOrder();

      return !!currentOrder.nc15 && currentOrder.documents[currentOrder.nc15] === undefined;
    },

    getCurrentOrder: function()
    {
      var localOrder = this.get('localOrder');

      if (localOrder.no)
      {
        return localOrder;
      }

      return this.get('remoteOrder');
    },

    getCurrentOrderInfo: function()
    {
      var orderInfo = {
        fileSource: this.get('fileSource'),
        orderNo: null,
        orderNc12: null,
        orderName: null,
        documentNc15: null,
        documentName: null
      };
      var currentOrder = this.getCurrentOrder();
      var localFile = this.get('localFile');

      if (currentOrder.no)
      {
        orderInfo.orderNo = currentOrder.no;
        orderInfo.orderNc12 = currentOrder.nc12;
        orderInfo.orderName = currentOrder.name;
      }
      else
      {
        orderInfo.orderNo = t('orderDocuments', 'controls:emptyOrderNo');
        orderInfo.orderName = t('orderDocuments', 'controls:emptyOrderName');
      }

      if (localFile)
      {
        var matches = localFile.name.replace(/_/g, ' ').replace(/\s+/g, ' ').trim().match(/^([0-9]+)?(.*?)?\.pdf$/i);
        var localDocumentNc15 = (matches[1] || '').trim();
        var localDocumentName = (matches[2] || '').trim();

        orderInfo.documentNc15 = localDocumentNc15 || t('orderDocuments', 'controls:localDocumentNc15');
        orderInfo.documentName = localDocumentName || t('orderDocuments', 'controls:localDocumentName');
      }
      else
      {
        var documentName = currentOrder.documents[currentOrder.nc15];

        if (documentName)
        {
          orderInfo.documentNc15 = currentOrder.nc15;
          orderInfo.documentName = documentName;
        }
        else if (currentOrder.nc15)
        {
          orderInfo.documentNc15 = currentOrder.nc15;
          orderInfo.documentName = t('orderDocuments', 'controls:externalDocumentName');
        }
        else
        {
          orderInfo.documentNc15 = t('orderDocuments', 'controls:emptyDocumentNc15');
          orderInfo.documentName = t('orderDocuments', 'controls:emptyDocumentName');
        }
      }

      orderInfo.documentName = orderInfo.documentName.replace(/\$__.*?__/g, '');

      return orderInfo;
    },

    getLocalFileUrl: function(nc15)
    {
      var localServerUrl = this.get('localServerUrl');

      if (_.isEmpty(localServerUrl))
      {
        return null;
      }

      var localServerPath = this.get('localServerPath');

      if (localServerUrl.substr(-1) !== '/')
      {
        localServerUrl += '/';
      }

      if (_.isEmpty(localServerPath))
      {
        return localServerUrl + nc15;
      }

      var lastPathChar = localServerPath.substr(-1);

      if (lastPathChar !== '/' && lastPathChar !== '\\')
      {
        localServerPath += '/';
      }

      return localServerUrl + encodeURIComponent(localServerPath + nc15 + '.pdf');
    },

    getRemoteFileUrl: function(nc15)
    {
      return window.location.origin + '/orderDocuments/' + nc15;
    },

    setRemoteOrder: function(remoteOrderData)
    {
      this.setOrder('remoteOrder', remoteOrderData);
    },

    setLocalOrder: function(localOrderData)
    {
      this.setOrder('localOrder', localOrderData);
    },

    resetLocalOrder: function()
    {
      this.set('localOrder', {
        no: null,
        nc12: '',
        name: '',
        documents: {},
        nc15: null
      });
      this.save();
    },

    resetExternalDocument: function()
    {
      if (this.isExternalDocument())
      {
        this.selectDocument(null);
      }
    },

    setLocalFile: function(name, file)
    {
      this.set({
        nc15: null,
        localFile: {
          name: name,
          file: file
        }
      });
      this.save();
    },

    resetLocalFile: function()
    {
      this.set('localFile', null);
      this.save();
    },

    setFileSource: function(fileSource)
    {
      this.set('fileSource', fileSource);
      this.save();
    },

    setOrder: function(orderType, orderData)
    {
      var oldOrder = this.get(orderType);
      var newOrder = {
        no: orderData.no,
        nc12: orderData.nc12,
        name: orderData.name,
        documents: {},
        nc15: null
      };

      if (orderData.hasBom)
      {
        newOrder.documents.BOM = t('orderDocuments', 'bom');
      }

      if (orderData.hasEto)
      {
        newOrder.documents.ETO = t('orderDocuments', 'eto');
      }

      _.extend(newOrder.documents, orderData.documents);

      if (newOrder.no === oldOrder.no && newOrder.documents[oldOrder.nc15])
      {
        newOrder.nc15 = oldOrder.nc15;
      }
      else
      {
        var documentNc15s = Object.keys(newOrder.documents).filter(this.filterNc15);

        if (documentNc15s.length)
        {
          newOrder.nc15 = documentNc15s[0];
        }
      }

      this.set(orderType, newOrder);

      if (oldOrder.no !== newOrder.no)
      {
        this.trigger('change:' + orderType + ':no', oldOrder.no, newOrder.no);
      }
    },

    checkEtoExistence: function(nc12)
    {
      var isLocalOrder = !!this.get('localOrder').no;
      var localChanged = this.checkEtoInOrder(nc12, this.get('localOrder'));
      var remoteChanged = this.checkEtoInOrder(nc12, this.get('remoteOrder'));

      if (localChanged || (remoteChanged && !isLocalOrder))
      {
        this.trigger('change:documents');
      }
    },

    checkEtoInOrder: function(nc12, orderData)
    {
      if (orderData.nc12 !== nc12)
      {
        return false;
      }

      if (orderData.documents.ETO)
      {
        return false;
      }

      var nc15s = Object.keys(orderData.documents);
      var newDocuments = {};

      if (orderData.documents.BOM)
      {
        newDocuments.BOM = orderData.documents.BOM;

        nc15s.shift();
      }

      newDocuments.ETO = t('orderDocuments', 'eto');

      _.forEach(nc15s, function(nc15)
      {
        newDocuments[nc15] = orderData.documents[nc15];
      });

      orderData.documents = newDocuments;

      return true;
    }

  });
});
