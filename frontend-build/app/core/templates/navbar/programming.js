define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    ',t("core","NAVBAR:PROGRAMMING"),'\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">',t("core","NAVBAR:XICONF"),'\n    <li data-privilege="XICONF:VIEW"><a href="#xiconf/programs">',t("core","NAVBAR:XICONF:PROGRAMS"),'</a>\n    <li data-privilege="XICONF:VIEW"><a href="#xiconf/programOrders">',t("core","NAVBAR:XICONF:ORDERS"),'</a>\n    <li data-privilege="XICONF:VIEW"><a href="#xiconf/results">',t("core","NAVBAR:XICONF:RESULTS"),'</a>\n    <li class="divider">\n    <li class="dropdown-header">',t("core","NAVBAR:ICPO"),'\n    <li data-privilege="ICPO:VIEW" data-module><a href="#icpo/results">',t("core","NAVBAR:ICPO:RESULTS"),"</a>\n  </ul>\n")}();return buf.join("")}});