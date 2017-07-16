define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("core","NAVBAR:PROD")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">'),__append(t("core","NAVBAR:MONITORING")),__append('\n    <li data-privilege="LOCAL PROD_DATA:VIEW" data-module><a href="#factoryLayout/default">'),__append(t("core","NAVBAR:MONITORING:LAYOUT")),__append('</a>\n    <li data-privilege="LOCAL PROD_DATA:VIEW" data-module><a href="#factoryLayout;list">'),__append(t("core","NAVBAR:MONITORING:LIST")),__append('</a>\n    <li data-privilege="LOCAL ISA:VIEW" data-module><a href="#isa">'),__append(t("core","NAVBAR:ISA")),__append('</a>\n    <li data-privilege="LOCAL PAINT_SHOP:VIEW" data-module><a href="#paintShop/current">'),__append(t("core","NAVBAR:PAINT_SHOP")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("core","NAVBAR:PROD:DATA")),__append('\n    <li data-privilege="LOCAL PROD_DATA:VIEW PRESS_WORKSHEETS:VIEW" data-module class="navbar-with-button"><a href="#pressWorksheets">'),__append(t("core","NAVBAR:PRESS_WORKSHEETS")),__append('</a><button class="btn btn-default" data-privilege="PRESS_WORKSHEETS:MANAGE" data-href="#pressWorksheets;add"><i class="fa fa-plus"></i></button>\n    <li data-privilege="LOCAL PROD_DATA:VIEW" data-module><a href="#prodLogEntries">'),__append(t("core","NAVBAR:PROD:LOG_ENTRIES")),__append('</a>\n    <li data-privilege="LOCAL PROD_DATA:VIEW" data-module><a href="#prodShifts">'),__append(t("core","NAVBAR:PROD:SHIFTS")),__append('</a>\n    <li data-privilege="LOCAL PROD_DATA:VIEW" data-module><a href="#prodShiftOrders">'),__append(t("core","NAVBAR:PROD:SHIFT_ORDERS")),__append('</a>\n    <li data-privilege="LOCAL PROD_DATA:VIEW PROD_DOWNTIMES:VIEW" data-module><a href="#prodDowntimes">'),__append(t("core","NAVBAR:PROD:DOWNTIMES")),__append('</a>\n    <li data-privilege="LOCAL PROD_DATA:VIEW PROD_DOWNTIMES:VIEW" data-module="prodDowntimes" data-client-module="prodDowntimeAlerts"><a href="#prodDowntimes;alerts">'),__append(t("core","NAVBAR:PROD:ALERTS")),__append('</a>\n    <li data-privilege="LOCAL PROD_DATA:VIEW" data-module><a href="#prodChangeRequests">'),__append(t("core","NAVBAR:PROD:CHANGE_REQUESTS")),__append('</a>\n    <li data-privilege="LOCAL PROD_DATA:VIEW" data-module><a href="#prodSerialNumbers">'),__append(t("core","NAVBAR:PROD:SERIAL_NUMBERS")),__append('</a>\n    <li data-privilege="PROD_DATA:MANAGE PROD_DATA:MANAGE:SPIGOT_ONLY" data-module><a href="#production;settings">'),__append(t("core","NAVBAR:PROD:SETTINGS")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("core","NAVBAR:DOCUMENTS")),__append('\n    <li data-privilege="DOCUMENTS:VIEW" data-module><a href="#orderDocuments/tree">'),__append(t("core","NAVBAR:DOCUMENTS:TREE")),__append('</a>\n    <li data-privilege="DOCUMENTS:VIEW" data-module><a href="#orderDocuments/clients">'),__append(t("core","NAVBAR:DOCUMENTS:CLIENTS")),__append('</a>\n    <li data-privilege="ORDERS:MANAGE" data-module><a href="#orders;settings?tab=documents">'),__append(t("core","NAVBAR:DOCUMENTS:SETTINGS")),__append("</a>\n  </ul>\n");return __output.join("")}});