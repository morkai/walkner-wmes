define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__output.push(t("core","NAVBAR:DICTIONARIES")),__output.push('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-privilege="ORDERS:VIEW" data-module="orders"><a href="#mechOrders">'),__output.push(t("core","NAVBAR:MECH_ORDERS")),__output.push('</a>\n    <li data-privilege="ORDERS:VIEW" data-module><a href="#orders">'),__output.push(t("core","NAVBAR:OTHER_ORDERS")),__output.push('</a>\n    <li data-privilege="ORDERS:VIEW" data-module="orders"><a href="#emptyOrders">'),__output.push(t("core","NAVBAR:EMPTY_ORDERS")),__output.push('</a>\n    <li class="divider">\n    <li data-privilege="USERS:VIEW" data-module><a href="#users">'),__output.push(t("core","NAVBAR:USERS")),__output.push('</a>\n    <li class="divider">\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#divisions">'),__output.push(t("core","NAVBAR:DIVISIONS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#subdivisions">'),__output.push(t("core","NAVBAR:SUBDIVISIONS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#mrpControllers">'),__output.push(t("core","NAVBAR:MRP_CONTROLLERS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodFlows">'),__output.push(t("core","NAVBAR:PROD_FLOWS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#workCenters">'),__output.push(t("core","NAVBAR:WORK_CENTERS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodLines">'),__output.push(t("core","NAVBAR:PROD_LINES")),__output.push('</a>\n    <li class="divider">\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#companies">'),__output.push(t("core","NAVBAR:COMPANIES")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#vendors">'),__output.push(t("core","NAVBAR:VENDORS")),__output.push('</a>\n    <li data-privilege="VENDOR_NC12S:VIEW" data-module><a href="#vendorNc12s">'),__output.push(t("core","NAVBAR:VENDOR_NC12S")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodFunctions">'),__output.push(t("core","NAVBAR:PROD_FUNCTIONS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodTasks">'),__output.push(t("core","NAVBAR:PROD_TASKS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#orderStatuses">'),__output.push(t("core","NAVBAR:ORDER_STATUSES")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#delayReasons">'),__output.push(t("core","NAVBAR:DELAY_REASONS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#downtimeReasons">'),__output.push(t("core","NAVBAR:DOWNTIME_REASONS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#lossReasons">'),__output.push(t("core","NAVBAR:LOSS_REASONS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#aors">'),__output.push(t("core","NAVBAR:AORS")),__output.push('</a>\n    <li class="divider">\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#licenses">'),__output.push(t("core","NAVBAR:LICENSES")),__output.push("</a>\n  </ul>\n");return __output.join("")}});