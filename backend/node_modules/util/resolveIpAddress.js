// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function resolveIpAddress(addressData)
{
  if (addressData)
  {
    if (hasRealIpFromProxyServer(addressData))
    {
      return (addressData.headers || addressData.request.headers)['x-real-ip'];
    }

    // HTTP
    if (addressData.socket && typeof addressData.socket.remoteAddress === 'string')
    {
      return addressData.socket.remoteAddress;
    }

    // Socket.IO
    if (addressData.conn && typeof addressData.conn.remoteAddress === 'string')
    {
      return addressData.conn.remoteAddress;
    }

    if (typeof addressData.address === 'string')
    {
      return addressData.address;
    }
  }

  return '';
};

function hasRealIpFromProxyServer(addressData)
{
  const handshake = addressData.request;
  const headers = handshake ? handshake.headers : addressData.headers;

  if (!headers)
  {
    return false;
  }

  if (typeof headers['x-real-ip'] === 'string')
  {
    return true;
  }

  if (typeof headers['x-forwarded-for'] === 'string')
  {
    headers['x-real-ip'] = headers['x-forwarded-for'].split(',')[0];

    if (headers['x-real-ip'].includes('.'))
    {
      headers['x-real-ip'] = headers['x-real-ip'].split(':').pop();
    }

    return true;
  }

  return false;
}
