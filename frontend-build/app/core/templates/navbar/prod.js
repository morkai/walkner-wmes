define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    ',t("core","NAVBAR:PROD"),'\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">',t("core","NAVBAR:MONITORING"),'\n    <li data-privilege="LOCAL PROD_DATA:VIEW" data-module><a href="#factoryLayout/default">',t("core","NAVBAR:MONITORING:LAYOUT"),'</a>\n    <li data-privilege="LOCAL PROD_DATA:VIEW" data-module><a href="#factoryLayout;list">',t("core","NAVBAR:MONITORING:LIST"),'</a>\n    <li class="divider">\n    <li class="dropdown-header">',t("core","NAVBAR:PROD:DATA"),'\n    <li data-privilege="LOCAL PRESS_WORKSHEETS:VIEW" data-module><a href="#pressWorksheets">',t("core","NAVBAR:PRESS_WORKSHEETS"),'</a>\n    <li data-privilege="LOCAL PROD_DATA:VIEW" data-module><a href="#prodLogEntries">',t("core","NAVBAR:PROD:LOG_ENTRIES"),'</a>\n    <li data-privilege="LOCAL PROD_DATA:VIEW" data-module><a href="#prodShifts">',t("core","NAVBAR:PROD:SHIFTS"),'</a>\n    <li data-privilege="LOCAL PROD_DATA:VIEW" data-module><a href="#prodShiftOrders">',t("core","NAVBAR:PROD:SHIFT_ORDERS"),'</a>\n    <li data-privilege="LOCAL PROD_DOWNTIMES:VIEW" data-module><a href="#prodDowntimes">',t("core","NAVBAR:PROD:DOWNTIMES"),"</a>\n  </ul>\n")}();return buf.join("")}});