'use strict';

var ObjectId = require('mongoose').Types.ObjectId;

exports.createObject = function(userData, addressData)
{
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
