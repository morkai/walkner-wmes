// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function patchNewSocket(newSocket, newEmit)
{
  // Modified https://github.com/Automattic/socket.io-client/blob/1.3.5/lib/socket.js#L244
  newSocket.onevent = function(packet)
  {
    var args = packet.data || [];

    if (null != packet.id)
    {
      args.push(this.ack(packet.id));
    }

    if (this.connected)
    {
      newEmit(args);
    }
    else
    {
      this.receiveBuffer.push(args);
    }
  };

  // Modified https://github.com/Automattic/socket.io-client/blob/1.3.5/lib/socket.js#L318
  newSocket.emitBuffered = function()
  {
    var i;

    for (i = 0; i < this.receiveBuffer.length; i++)
    {
      newEmit(this.receiveBuffer[i]);
    }

    this.receiveBuffer = [];

    for (i = 0; i < this.sendBuffer.length; i++)
    {
      this.packet(this.sendBuffer[i]);
    }

    this.sendBuffer = [];
  };
};
