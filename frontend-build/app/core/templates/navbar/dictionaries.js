define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(a){return String(a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    ',t("core","NAVBAR:DICTIONARIES"),'\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-privilege="ORDERS:VIEW" data-module="orders"><a href="#mechOrders">',t("core","NAVBAR:MECH_ORDERS"),'</a>\n    <li data-privilege="ORDERS:VIEW" data-module><a href="#orders">',t("core","NAVBAR:OTHER_ORDERS"),'</a>\n    <li data-privilege="ORDERS:VIEW" data-module="orders"><a href="#emptyOrders">',t("core","NAVBAR:EMPTY_ORDERS"),'</a>\n    <li class="divider">\n    <li data-privilege="USERS:VIEW" data-module><a href="#users">',t("core","NAVBAR:USERS"),'</a>\n    <li class="divider">\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#divisions">',t("core","NAVBAR:DIVISIONS"),'</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#subdivisions">',t("core","NAVBAR:SUBDIVISIONS"),'</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#mrpControllers">',t("core","NAVBAR:MRP_CONTROLLERS"),'</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodFlows">',t("core","NAVBAR:PROD_FLOWS"),'</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#workCenters">',t("core","NAVBAR:WORK_CENTERS"),'</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodLines">',t("core","NAVBAR:PROD_LINES"),'</a>\n    <li class="divider">\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#companies">',t("core","NAVBAR:COMPANIES"),'</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#vendors">',t("core","NAVBAR:VENDORS"),'</a>\n    <li data-privilege="VENDOR_NC12S:VIEW" data-module><a href="#vendorNc12s">',t("core","NAVBAR:VENDOR_NC12S"),'</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodFunctions">',t("core","NAVBAR:PROD_FUNCTIONS"),'</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodTasks">',t("core","NAVBAR:PROD_TASKS"),'</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#orderStatuses">',t("core","NAVBAR:ORDER_STATUSES"),'</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#downtimeReasons">',t("core","NAVBAR:DOWNTIME_REASONS"),'</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#lossReasons">',t("core","NAVBAR:LOSS_REASONS"),'</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#aors">',t("core","NAVBAR:AORS"),"</a>\n  </ul>\n")}();return buf.join("")}});