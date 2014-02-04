define(["app/core/SocketSandbox"],function(t){function o(t){this.sio=t}return o.prototype.sandbox=function(){return new t(this)},o.prototype.getId=function(){return this.sio.socket.sessionid},o.prototype.isConnected=function(){return this.sio.socket.connected},o.prototype.connect=function(){this.isConnected()||this.sio.socket.connecting||this.sio.socket.connect()},o.prototype.reconnect=function(){this.isConnected()||this.sio.socket.reconnecting||this.sio.socket.reconnect()},o.prototype.on=function(t,o){return this.sio.addListener(t,o),this},o.prototype.off=function(t,o){return"undefined"==typeof o?this.sio.removeAllListeners(t):this.sio.removeListener(t,o),this},o.prototype.emit=function(){return this.sio.json.emit.apply(this.sio.json,arguments),this},o.prototype.send=function(t,o){return this.sio.json.send(t,o),this},o});