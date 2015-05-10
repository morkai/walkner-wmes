define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="navbar-inner">\n  '),function(){__output.push('<div class="navbar-header">\n  <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">\n    <span class="sr-only">'),__output.push(t("core","NAVBAR:TOGGLE")),__output.push('</span>\n    <span class="icon-bar"></span>\n    <span class="icon-bar"></span>\n    <span class="icon-bar"></span>\n  </button>\n  <a class="navbar-brand fa fa-cogs" href="#"></a>\n</div>\n')}(),__output.push('\n  <div class="collapse navbar-collapse">\n    <ul class="nav navbar-nav">\n      <li><a href="#">'),__output.push(t("core","NAVBAR:DASHBOARD")),__output.push('</a>\n      <li data-online data-privilege="EVENTS:VIEW" data-module><a href="#events">'),__output.push(t("core","NAVBAR:EVENTS")),__output.push("</a>\n      "),function(){__output.push('<li data-online data-module="fte" class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__output.push(t("core","NAVBAR:FTE")),__output.push('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">'),__output.push(t("core","NAVBAR:FTE:MASTER")),__output.push('\n    <li data-privilege="FTE:MASTER:VIEW"><a href="#fte/master">'),__output.push(t("core","NAVBAR:FTE:MASTER:LIST")),__output.push('</a>\n    <li data-privilege="FTE:MASTER:MANAGE"><a href="#fte/master;add">'),__output.push(t("core","NAVBAR:FTE:MASTER:CURRENT")),__output.push('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__output.push(t("core","NAVBAR:FTE:LEADER")),__output.push('\n    <li data-privilege="FTE:LEADER:VIEW"><a href="#fte/leader">'),__output.push(t("core","NAVBAR:FTE:LEADER:LIST")),__output.push('</a>\n    <li data-privilege="FTE:LEADER:MANAGE"><a href="#fte/leader;add">'),__output.push(t("core","NAVBAR:FTE:LEADER:CURRENT")),__output.push("</a>\n  </ul>\n")}(),__output.push('\n      <li data-online data-privilege="HOURLY_PLANS:VIEW" data-module><a href="#hourlyPlans">'),__output.push(t("core","NAVBAR:HOURLY_PLANS")),__output.push('</a>\n      <li data-online data-privilege="PURCHASE_ORDERS:VIEW" data-module><a href="#purchaseOrders">'),__output.push(t("core","NAVBAR:PURCHASE_ORDERS")),__output.push("</a>\n      "),function(){__output.push('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__output.push(t("core","NAVBAR:PROD")),__output.push('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">'),__output.push(t("core","NAVBAR:MONITORING")),__output.push('\n    <li data-privilege="LOCAL PROD_DATA:VIEW" data-module><a href="#factoryLayout/default">'),__output.push(t("core","NAVBAR:MONITORING:LAYOUT")),__output.push('</a>\n    <li data-privilege="LOCAL PROD_DATA:VIEW" data-module><a href="#factoryLayout;list">'),__output.push(t("core","NAVBAR:MONITORING:LIST")),__output.push('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__output.push(t("core","NAVBAR:PROD:DATA")),__output.push('\n    <li data-privilege="LOCAL PRESS_WORKSHEETS:VIEW" data-module><a href="#pressWorksheets">'),__output.push(t("core","NAVBAR:PRESS_WORKSHEETS")),__output.push('</a>\n    <li data-privilege="LOCAL PROD_DATA:VIEW" data-module><a href="#prodLogEntries">'),__output.push(t("core","NAVBAR:PROD:LOG_ENTRIES")),__output.push('</a>\n    <li data-privilege="LOCAL PROD_DATA:VIEW" data-module><a href="#prodShifts">'),__output.push(t("core","NAVBAR:PROD:SHIFTS")),__output.push('</a>\n    <li data-privilege="LOCAL PROD_DATA:VIEW" data-module><a href="#prodShiftOrders">'),__output.push(t("core","NAVBAR:PROD:SHIFT_ORDERS")),__output.push('</a>\n    <li data-privilege="LOCAL PROD_DOWNTIMES:VIEW" data-module><a href="#prodDowntimes">'),__output.push(t("core","NAVBAR:PROD:DOWNTIMES")),__output.push("</a>\n  </ul>\n")}(),__output.push("\n      "),function(){__output.push('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__output.push(t("core","NAVBAR:PROGRAMMING")),__output.push('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">'),__output.push(t("core","NAVBAR:XICONF")),__output.push('\n    <li data-privilege="XICONF:VIEW" data-module><a href="#xiconf/clients">'),__output.push(t("core","NAVBAR:XICONF:CLIENTS")),__output.push('</a>\n    <li data-privilege="XICONF:VIEW" data-module><a href="#xiconf/programs">'),__output.push(t("core","NAVBAR:XICONF:PROGRAMS")),__output.push('</a>\n    <li data-privilege="XICONF:VIEW" data-module><a href="#xiconf/orders">'),__output.push(t("core","NAVBAR:XICONF:ORDERS")),__output.push('</a>\n    <li data-privilege="XICONF:VIEW" data-module><a href="#xiconf/results">'),__output.push(t("core","NAVBAR:XICONF:RESULTS")),__output.push('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__output.push(t("core","NAVBAR:ICPO")),__output.push('\n    <li data-privilege="ICPO:VIEW" data-module><a href="#icpo/results">'),__output.push(t("core","NAVBAR:ICPO:RESULTS")),__output.push("</a>\n  </ul>\n")}(),__output.push("\n      "),function(){__output.push('<li class="dropdown" data-online data-module="reports" data-privilege="REPORTS:VIEW">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__output.push(t("core","NAVBAR:REPORTS")),__output.push('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li><a href="#reports/1">'),__output.push(t("core","NAVBAR:REPORTS:1")),__output.push('</a>\n    <li><a href="#reports/2">'),__output.push(t("core","NAVBAR:REPORTS:2")),__output.push('</a>\n    <li><a href="#reports/3">'),__output.push(t("core","NAVBAR:REPORTS:3")),__output.push('</a>\n    <li><a href="#reports/4">'),__output.push(t("core","NAVBAR:REPORTS:4")),__output.push('</a>\n    <li><a href="#reports/5">'),__output.push(t("core","NAVBAR:REPORTS:5")),__output.push('</a>\n    <li><a href="#reports/6">'),__output.push(t("core","NAVBAR:REPORTS:6")),__output.push('</a>\n    <li class="divider">\n    <li><a href="#vis/structure">'),__output.push(t("core","NAVBAR:VIS:STRUCTURE")),__output.push("</a>\n  </ul>\n")}(),__output.push("\n      "),function(){__output.push('<li data-online data-loggedin class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__output.push(t("core","NAVBAR:KAIZEN")),__output.push('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">'),__output.push(t("core","NAVBAR:KAIZEN:ORDERS")),__output.push('\n    <li data-module><a href="#kaizen/orders" title="'),__output.push(t("core","NAVBAR:KAIZEN:NEAR_MISSES:TITLE")),__output.push('">'),__output.push(t("core","NAVBAR:KAIZEN:NEAR_MISSES")),__output.push('</a>\n    <li data-module><a href="#kaizen/orders">'),__output.push(t("core","NAVBAR:KAIZEN:SUGGESTIONS")),__output.push('</a>\n    <li data-module><a href="#kaizen/orders">'),__output.push(t("core","NAVBAR:KAIZEN:KAIZENS")),__output.push('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__output.push(t("core","NAVBAR:KAIZEN:DICTIONARIES")),__output.push('\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module><a href="#kaizen/sections">'),__output.push(t("core","NAVBAR:KAIZEN:SECTIONS")),__output.push('</a>\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module><a href="#kaizen/areas">'),__output.push(t("core","NAVBAR:KAIZEN:AREAS")),__output.push('</a>\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module><a href="#kaizen/categories">'),__output.push(t("core","NAVBAR:KAIZEN:CATEGORIES")),__output.push('</a>\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module><a href="#kaizen/causes">'),__output.push(t("core","NAVBAR:KAIZEN:CAUSES")),__output.push('</a>\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module><a href="#kaizen/risks">'),__output.push(t("core","NAVBAR:KAIZEN:RISKS")),__output.push("</a>\n  </ul>\n")}(),__output.push("\n      "),function(){__output.push('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__output.push(t("core","NAVBAR:DICTIONARIES")),__output.push('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-privilege="ORDERS:VIEW" data-module="orders"><a href="#mechOrders">'),__output.push(t("core","NAVBAR:MECH_ORDERS")),__output.push('</a>\n    <li data-privilege="ORDERS:VIEW" data-module><a href="#orders">'),__output.push(t("core","NAVBAR:OTHER_ORDERS")),__output.push('</a>\n    <li data-privilege="ORDERS:VIEW" data-module="orders"><a href="#emptyOrders">'),__output.push(t("core","NAVBAR:EMPTY_ORDERS")),__output.push('</a>\n    <li class="divider">\n    <li data-privilege="USERS:VIEW" data-module><a href="#users">'),__output.push(t("core","NAVBAR:USERS")),__output.push('</a>\n    <li class="divider">\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#divisions">'),__output.push(t("core","NAVBAR:DIVISIONS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#subdivisions">'),__output.push(t("core","NAVBAR:SUBDIVISIONS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#mrpControllers">'),__output.push(t("core","NAVBAR:MRP_CONTROLLERS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodFlows">'),__output.push(t("core","NAVBAR:PROD_FLOWS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#workCenters">'),__output.push(t("core","NAVBAR:WORK_CENTERS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodLines">'),__output.push(t("core","NAVBAR:PROD_LINES")),__output.push('</a>\n    <li class="divider">\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#companies">'),__output.push(t("core","NAVBAR:COMPANIES")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#vendors">'),__output.push(t("core","NAVBAR:VENDORS")),__output.push('</a>\n    <li data-privilege="VENDOR_NC12S:VIEW" data-module><a href="#vendorNc12s">'),__output.push(t("core","NAVBAR:VENDOR_NC12S")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodFunctions">'),__output.push(t("core","NAVBAR:PROD_FUNCTIONS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodTasks">'),__output.push(t("core","NAVBAR:PROD_TASKS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#orderStatuses">'),__output.push(t("core","NAVBAR:ORDER_STATUSES")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#delayReasons">'),__output.push(t("core","NAVBAR:DELAY_REASONS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#downtimeReasons">'),__output.push(t("core","NAVBAR:DOWNTIME_REASONS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#lossReasons">'),__output.push(t("core","NAVBAR:LOSS_REASONS")),__output.push('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#aors">'),__output.push(t("core","NAVBAR:AORS")),__output.push('</a>\n    <li class="divider">\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#licenses">'),__output.push(t("core","NAVBAR:LICENSES")),__output.push("</a>\n  </ul>\n")}(),__output.push("\n    </ul>\n    "),function(){__output.push('<ul class="nav navbar-nav navbar-right">\n  <li class="dropdown navbar-account-dropdown">\n    <a href="#account" class="dropdown-toggle" data-toggle="dropdown">\n      <i class="fa fa-user fa-lg navbar-account-status"></i>\n      '),__output.push(user.getLabel()),__output.push('\n      <b class="caret"></b>\n    </a>\n    <ul class="dropdown-menu">\n      <li data-online data-loggedin><a href="#users/'),__output.push(user.data._id),__output.push('">'),__output.push(t("core","NAVBAR:MY_ACCOUNT")),__output.push('</a>\n      <li class="divider">\n      <li class="dropdown-header">'),__output.push(t("core","NAVBAR:UI_LOCALE")),__output.push('\n      <li><a class="navbar-account-locale" href="#" data-locale="pl">'),__output.push(t("core","NAVBAR:LOCALE_PL")),__output.push('</a>\n      <li><a class="navbar-account-locale" href="#" data-locale="en">'),__output.push(t("core","NAVBAR:LOCALE_US")),__output.push('</a>\n      <li class="divider">\n      <li data-online data-loggedin=0><a class="navbar-account-logIn" href="#login">'),__output.push(t("core","NAVBAR:LOG_IN")),__output.push('</a>\n      <li data-online data-loggedin><a class="navbar-account-logOut" href="/logout">'),__output.push(t("core","NAVBAR:LOG_OUT")),__output.push('</a>\n    </ul>\n  </li>\n</ul>\n<!--\n<button class="btn btn-warning navbar-btn navbar-right navbar-feedback" type="button" title="'),__output.push(t("core","feedback:button:tooltip")),__output.push('">'),__output.push(t("core","feedback:button:text")),__output.push("</button>\n//-->\n")}(),__output.push("\n  </div>\n</div>\n");return __output.join("")}});