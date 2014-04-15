// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var ObjectId = require('mongoose').Types.ObjectId;

exports.createObject = function(userData, addressData)
{
  /**
   * @name UserInfo
   * @type {{id: string, ip: string, label: string}}
   */
  var userInfo = {
    id: null,
    ip: '',
    label: ''
  };

  try
  {
    userInfo.id = ObjectId.createFromHexString(String(userData._id || userData.id));
  }
  catch (err) {}

  if (typeof userData.label === 'string')
  {
    userInfo.label = userData.label;
  }
  else if (userData.firstName && userData.lastName)
  {
    userInfo.label = userData.lastName + ' ' + userData.firstName;
  }
  else
  {
    userInfo.label = userData.login || '?';
  }

  if (addressData)
  {
    if (addressData.socket && typeof addressData.socket.remoteAddress === 'string')
    {
      userInfo.ip = addressData.socket.remoteAddress;
    }
    else if (addressData.handshake
      && addressData.handshake.address
      && typeof addressData.handshake.address.address === 'string')
    {
      userInfo.ip = addressData.handshake.address.address;
    }
  }

  if (userInfo.ip === '')
  {
    userInfo.ip = userData.ip || userData.ipAddress || '0.0.0.0';
  }

  return userInfo;
};
