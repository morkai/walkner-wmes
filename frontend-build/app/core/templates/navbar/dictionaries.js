define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(a){return _ENCODE_HTML_RULES[a]||a}escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("core","NAVBAR:DICTIONARIES")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-privilege="ORDERS:VIEW" data-module="orders"><a href="#mechOrders">'),__append(t("core","NAVBAR:MECH_ORDERS")),__append('</a>\n    <li data-privilege="ORDERS:VIEW" data-module><a href="#orders">'),__append(t("core","NAVBAR:OTHER_ORDERS")),__append('</a>\n    <li class="divider">\n    <li data-privilege="USERS:VIEW" data-module><a href="#users">'),__append(t("core","NAVBAR:USERS")),__append('</a>\n    <li class="divider">\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#divisions">'),__append(t("core","NAVBAR:DIVISIONS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#subdivisions">'),__append(t("core","NAVBAR:SUBDIVISIONS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#mrpControllers">'),__append(t("core","NAVBAR:MRP_CONTROLLERS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodFlows">'),__append(t("core","NAVBAR:PROD_FLOWS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#workCenters">'),__append(t("core","NAVBAR:WORK_CENTERS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodLines">'),__append(t("core","NAVBAR:PROD_LINES")),__append('</a>\n    <li class="divider">\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#companies">'),__append(t("core","NAVBAR:COMPANIES")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodFunctions">'),__append(t("core","NAVBAR:PROD_FUNCTIONS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodTasks">'),__append(t("core","NAVBAR:PROD_TASKS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#orderStatuses">'),__append(t("core","NAVBAR:ORDER_STATUSES")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#delayReasons">'),__append(t("core","NAVBAR:DELAY_REASONS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#downtimeReasons">'),__append(t("core","NAVBAR:DOWNTIME_REASONS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#lossReasons">'),__append(t("core","NAVBAR:LOSS_REASONS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#aors">'),__append(t("core","NAVBAR:AORS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#isaPalletKinds">'),__append(t("core","NAVBAR:ISA_PALLET_KINDS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module="printing"><a href="#printers">'),__append(t("core","NAVBAR:PRINTERS")),__append('</a>\n    <li class="divider">\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#licenses">'),__append(t("core","NAVBAR:LICENSES")),__append("</a>\n  </ul>\n");return __output.join("")}});