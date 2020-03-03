define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(a){return _ENCODE_HTML_RULES[a]||a}var __output="";function __append(a){void 0!==a&&null!==a&&(__output+=a)}with(locals||{})__append('<div class="navbar-inner">\n  '),function(){__append('<div class="navbar-header">\n  <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">\n    <span class="sr-only">'),__append(t("NAVBAR:TOGGLE")),__append('</span>\n    <span class="icon-bar"></span>\n    <span class="icon-bar"></span>\n    <span class="icon-bar"></span>\n  </button>\n  <a class="navbar-brand fa fa-cogs" href="#"></a>\n</div>\n')}.call(this),__append('\n  <div class="collapse navbar-collapse">\n    <ul class="nav navbar-nav">\n      <li><a href="#">'),__append(t("core","NAVBAR:DASHBOARD")),__append("</a>\n      "),function(){__append('<li data-online data-module="fte" class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:FTE")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-privilege="FTE:MASTER:VIEW" class="navbar-with-button"><a href="#fte/master">'),__append(t("NAVBAR:FTE:MASTER")),__append('</a><button class="btn btn-default" data-privilege="FTE:MASTER:MANAGE" data-href="#fte/master;add"><i class="fa fa-plus"></i></button>\n    <li data-privilege="FTE:LEADER:VIEW FTE:WH:VIEW" class="navbar-with-button"><a href="#fte/wh">'),__append(t("NAVBAR:FTE:WH")),__append('</a><button class="btn btn-default" data-privilege="FTE:LEADER:MANAGE" data-href="#fte/wh;add"><i class="fa fa-plus"></i></button>\n    <li data-privilege="FTE:LEADER:VIEW" class="navbar-with-button"><a href="#fte/leader">'),__append(t("NAVBAR:FTE:LEADER")),__append('</a><button class="btn btn-default" data-privilege="FTE:LEADER:MANAGE" data-href="#fte/leader;add"><i class="fa fa-plus"></i></button>\n    <li data-privilege="PROD_DATA:MANAGE"><a href="#fte;settings">'),__append(t("NAVBAR:FTE:SETTINGS")),__append("</a>\n  </ul>\n")}.call(this),__append("\n      "),function(){__append('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:PLANNING:main")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">\n      <span class="navbar-group-header">\n        <span>'),__append(t("NAVBAR:PLANNING:plans")),__append('</span>\n        <a data-privilege="PLANNING:VIEW" data-group="planning/daily" class="active" href="javascript:void(0)">'),__append(t("NAVBAR:PLANNING:daily")),__append('</a>\n        <a data-privilege="HOURLY_PLANS:VIEW" data-group="planning/hourly" href="javascript:void(0)">'),__append(t("NAVBAR:PLANNING:hourly")),__append('</a>\n      </span>\n    </li>\n    <li data-privilege="PLANNING:VIEW" data-module data-group="planning/daily"><a href="#planning/plans">'),__append(t("NAVBAR:PLANNING:all")),__append('</a></li>\n    <li data-privilege="PLANNING:VIEW" data-module data-group="planning/daily"><a href="#planning/plans/-1d">'),__append(t("NAVBAR:PLANNING:-1d")),__append('</a></li>\n    <li data-privilege="PLANNING:VIEW" data-module data-group="planning/daily"><a href="#planning/plans/0d">'),__append(t("NAVBAR:PLANNING:0d")),__append('</a></li>\n    <li data-privilege="PLANNING:VIEW" data-module data-group="planning/daily"><a href="#planning/plans/1d">'),__append(t("NAVBAR:PLANNING:1d")),__append('</a></li>\n    <li data-privilege="PLANNING:VIEW" data-module data-group="planning/daily"><a href="#planning/plans/2d">'),__append(t("NAVBAR:PLANNING:2d")),__append('</a></li>\n    <li class="navbar-with-button" data-privilege="HOURLY_PLANS:VIEW" data-module data-group="planning/hourly">\n      <a href="#hourlyPlans">'),__append(t("NAVBAR:PLANNING:all")),__append('</a>\n      <button class="btn btn-default" data-privilege="HOURLY_PLANS:MANAGE PROD_DATA:MANAGE" data-href="#hourlyPlans;add"><i class="fa fa-plus"></i></button>\n    </li>\n    <li class="navbar-with-button" data-privilege="HOURLY_PLANS:VIEW" data-module data-group="planning/hourly">\n      <a href="#hourlyPlans?date=0-1d&sort(-date)&limit(20)">'),__append(t("NAVBAR:PLANNING:0d")),__append('</a>\n      <button class="btn btn-default" data-privilege="HOURLY_PLANS:MANAGE PROD_DATA:MANAGE" data-href="#hourlyPlans;add?date=0d"><i class="fa fa-edit"></i></button>\n    </li>\n    <li class="navbar-with-button" data-privilege="HOURLY_PLANS:VIEW" data-module data-group="planning/hourly">\n      <a href="#hourlyPlans?date=1-2d&sort(-date)&limit(20)">'),__append(t("NAVBAR:PLANNING:1d")),__append('</a>\n      <button class="btn btn-default" data-privilege="HOURLY_PLANS:MANAGE PROD_DATA:MANAGE" data-href="#hourlyPlans;add?date=1d"><i class="fa fa-edit"></i></button>\n    </li>\n    <li class="navbar-with-button" data-privilege="HOURLY_PLANS:VIEW" data-module data-group="planning/hourly">\n      <a href="#hourlyPlans?date=2-3d&sort(-date)&limit(20)">'),__append(t("NAVBAR:PLANNING:2d")),__append('</a>\n      <button class="btn btn-default" data-privilege="HOURLY_PLANS:MANAGE PROD_DATA:MANAGE" data-href="#hourlyPlans;add?date=2d"><i class="fa fa-edit"></i></button>\n    </li>\n    <li class="divider"></li>\n    <li class="dropdown-header">\n      <span class="navbar-group-header">\n        <a data-privilege="PAINT_SHOP:VIEW" data-group="ps/ps" class="active" href="javascript:void(0)">'),__append(t("NAVBAR:PLANNING:paintShop")),__append('</a>\n        <a data-privilege="DRILLING:VIEW" data-group="ps/drill" href="javascript:void(0)">'),__append(t("NAVBAR:PLANNING:drilling")),__append('</a>\n        <a data-privilege="WIRING:VIEW" data-group="ps/wire" href="javascript:void(0)">'),__append(t("NAVBAR:PLANNING:wiring")),__append('</a>\n      </span>\n    </li>\n    <li data-privilege="PAINT_SHOP:VIEW" data-module data-group="ps/ps"><a href="#paintShop/-1d">'),__append(t("NAVBAR:PLANNING:-1d")),__append('</a></li>\n    <li data-privilege="PAINT_SHOP:VIEW" data-module data-group="ps/ps"><a href="#paintShop/0d">'),__append(t("NAVBAR:PLANNING:0d")),__append('</a></li>\n    <li data-privilege="PAINT_SHOP:VIEW" data-module data-group="ps/ps"><a href="#paintShop/1d">'),__append(t("NAVBAR:PLANNING:1d")),__append('</a></li>\n    <li data-privilege="PAINT_SHOP:VIEW" data-module data-group="ps/ps"><a href="#paintShop/2d">'),__append(t("NAVBAR:PLANNING:2d")),__append('</a></li>\n    <li data-privilege="PAINT_SHOP:VIEW" data-module data-group="ps/ps"><a href="#paintShop/load">'),__append(t("NAVBAR:PLANNING:paintShop:load")),__append('</a></li>\n    <li data-privilege="DRILLING:VIEW" data-module="wmes-drilling" data-group="ps/drill"><a href="#drilling/-1d">'),__append(t("NAVBAR:PLANNING:-1d")),__append('</a></li>\n    <li data-privilege="DRILLING:VIEW" data-module="wmes-drilling" data-group="ps/drill"><a href="#drilling/0d">'),__append(t("NAVBAR:PLANNING:0d")),__append('</a></li>\n    <li data-privilege="DRILLING:VIEW" data-module="wmes-drilling" data-group="ps/drill"><a href="#drilling/1d">'),__append(t("NAVBAR:PLANNING:1d")),__append('</a></li>\n    <li data-privilege="DRILLING:VIEW" data-module="wmes-drilling" data-group="ps/drill"><a href="#drilling/2d">'),__append(t("NAVBAR:PLANNING:2d")),__append('</a></li>\n    <li data-privilege="WIRING:VIEW" data-module="wmes-wiring" data-group="ps/wire"><a href="#wiring/-1d">'),__append(t("NAVBAR:PLANNING:-1d")),__append('</a></li>\n    <li data-privilege="WIRING:VIEW" data-module="wmes-wiring" data-group="ps/wire"><a href="#wiring/0d">'),__append(t("NAVBAR:PLANNING:0d")),__append('</a></li>\n    <li data-privilege="WIRING:VIEW" data-module="wmes-wiring" data-group="ps/wire"><a href="#wiring/1d">'),__append(t("NAVBAR:PLANNING:1d")),__append('</a></li>\n    <li data-privilege="WIRING:VIEW" data-module="wmes-wiring" data-group="ps/wire"><a href="#wiring/2d">'),__append(t("NAVBAR:PLANNING:2d")),__append('</a></li>\n    <li class="divider"></li>\n    <li id="'),__append(idPrefix),__append('-wh-hd" class="dropdown-header">\n      <span class="navbar-group-header">\n        <span>'),__append(t("NAVBAR:PLANNING:wh")),__append('</span>\n        <a class="active" href="javascript:void(0)" data-group="wh/old">'),__append(t("NAVBAR:PLANNING:wh:old")),__append('</a>\n        <a href="javascript:void(0)" data-group="wh/new">'),__append(t("NAVBAR:PLANNING:wh:new")),__append('</a>\n      </span>\n    </li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/old"><a href="#planning/wh/-1d">'),__append(t("NAVBAR:PLANNING:-1d")),__append('</a></li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/old"><a href="#planning/wh/0d">'),__append(t("NAVBAR:PLANNING:0d")),__append('</a></li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/old"><a href="#planning/wh/1d">'),__append(t("NAVBAR:PLANNING:1d")),__append('</a></li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/old"><a href="#planning/wh/2d">'),__append(t("NAVBAR:PLANNING:2d")),__append('</a></li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/new"><a href="#wh/pickup/0d">'),__append(t("NAVBAR:PLANNING:wh:pickup")),__append('</a></li>\n    <li class="disabled" data-privilege="WH:VIEW" data-module data-group="wh/new"><a href="#wh/dist/components">'),__append(t("NAVBAR:PLANNING:wh:dist:components")),__append('</a></li>\n    <li class="disabled" data-privilege="WH:VIEW" data-module data-group="wh/new"><a href="#wh/dist/packaging">'),__append(t("NAVBAR:PLANNING:wh:dist:packaging")),__append('</a></li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/new"><a href="#wh/problems">'),__append(t("NAVBAR:PLANNING:wh:problems")),__append('</a></li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/new"><a href="#wh/downtimes">'),__append(t("NAVBAR:PLANNING:wh:downtimes")),__append('</a></li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/new"><a href="#wh/setCarts">'),__append(t("NAVBAR:PLANNING:wh:setCarts")),__append('</a></li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/new"><a href="#wh/lines">'),__append(t("NAVBAR:PLANNING:wh:lines")),__append('</a></li>\n    <li data-privilege="WH:MANAGE" data-module data-group="wh/new"><a href="#wh/settings">'),__append(t("NAVBAR:PLANNING:wh:settings")),__append("</a></li>\n  </ul>\n</li>\n")}.call(this),__append("\n      "),function(){__append('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:PROD")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">'),__append(t("NAVBAR:MONITORING")),__append('\n    <li data-privilege="PROD_DATA:VIEW" data-module="factoryLayout production"><a href="#factoryLayout/default">'),__append(t("NAVBAR:MONITORING:LAYOUT")),__append('</a>\n    <li data-privilege="PROD_DATA:VIEW" data-module="factoryLayout production"><a href="#factoryLayout;list">'),__append(t("NAVBAR:MONITORING:LIST")),__append('</a>\n    <li data-privilege="PROD_DATA:VIEW" data-module="wmes-ct-frontend"><a href="#ct">'),__append(t("NAVBAR:ct")),__append('</a>\n    <li data-privilege="ISA:VIEW" data-module><a href="#isa">'),__append(t("NAVBAR:ISA")),__append('</a>\n    <li data-privilege="LOCAL DOCUMENTS:VIEW" data-module="orderDocuments" class="navbar-with-button"><a id="'),__append(idPrefix),__append('-openLayout" href="/orderDocuments/133700000000001">'),__append(t("NAVBAR:layout")),__append(' &nbsp;<i class="fa fa-external-link"></i></a><button class="btn btn-default" data-privilege="USER" data-href="#orderDocuments/tree?folder=55F39BA8-380E-4EA5-80A7-009F6208A20D&file=133700000000001"><i class="fa fa-edit"></i></button>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:PROD:DATA")),__append('\n    <li data-privilege="PROD_DATA:VIEW PRESS_WORKSHEETS:VIEW" data-module class="navbar-with-button"><a href="#pressWorksheets">'),__append(t("NAVBAR:PRESS_WORKSHEETS")),__append('</a><button class="btn btn-default" data-privilege="PRESS_WORKSHEETS:MANAGE" data-href="#pressWorksheets;add"><i class="fa fa-plus"></i></button>\n    <li data-privilege="PROD_DATA:VIEW" data-module><a href="#prodLogEntries">'),__append(t("NAVBAR:PROD:LOG_ENTRIES")),__append('</a>\n    <li data-privilege="PROD_DATA:VIEW" data-module><a href="#prodShifts">'),__append(t("NAVBAR:PROD:SHIFTS")),__append('</a>\n    <li data-privilege="PROD_DATA:VIEW" data-module><a href="#prodShiftOrders">'),__append(t("NAVBAR:PROD:SHIFT_ORDERS")),__append('</a>\n    <li data-privilege="PROD_DATA:VIEW PROD_DOWNTIMES:VIEW" data-module><a href="#prodDowntimes">'),__append(t("NAVBAR:PROD:DOWNTIMES")),__append('</a>\n    <li data-privilege="PROD_DATA:VIEW PROD_DOWNTIMES:VIEW" data-module="prodDowntimes" data-client-module="prodDowntimeAlerts"><a href="#prodDowntimes;alerts">'),__append(t("NAVBAR:PROD:ALERTS")),__append('</a>\n    <li data-privilege="PROD_DATA:CHANGES:*" data-module><a href="#prodChangeRequests">'),__append(t("NAVBAR:PROD:CHANGE_REQUESTS")),__append('</a>\n    <li data-privilege="PROD_DATA:VIEW" data-module><a href="#prodSerialNumbers">'),__append(t("NAVBAR:PROD:SERIAL_NUMBERS")),__append('</a>\n    <li data-privilege="PROD_DATA:MANAGE PROD_DATA:MANAGE:SPIGOT_ONLY" data-module><a href="#production;settings">'),__append(t("NAVBAR:PROD:SETTINGS")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:DOCUMENTS")),__append('\n    <li data-privilege="USER DOCUMENTS:VIEW" data-module><a href="#orderDocuments/tree">'),__append(t("NAVBAR:DOCUMENTS:TREE")),__append('</a>\n    <li data-privilege="DOCUMENTS:VIEW" data-module><a href="#orderDocuments/confirmations">'),__append(t("NAVBAR:DOCUMENTS:CONFIRMATIONS")),__append('</a>\n    <li data-privilege="DOCUMENTS:VIEW" data-module><a href="#orderDocuments/clients">'),__append(t("NAVBAR:DOCUMENTS:CLIENTS")),__append('</a>\n    <li data-privilege="ORDERS:MANAGE" data-module="orderDocuments" data-client-module="orderDocuments"><a href="#orders;settings?tab=documents">'),__append(t("NAVBAR:DOCUMENTS:SETTINGS")),__append("</a>\n  </ul>\n")}.call(this),__append("\n      "),function(){__append('<li class="dropdown" data-online data-module="reports">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:REPORTS")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-privilege="REPORTS:VIEW REPORTS:1:VIEW" data-module="production"><a href="#reports/1">'),__append(t("NAVBAR:REPORTS:1")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:2:VIEW" data-module="production"><a href="#reports/clip">'),__append(t("NAVBAR:REPORTS:clip")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:3:VIEW" data-module="production"><a href="#reports/3">'),__append(t("NAVBAR:REPORTS:3")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:4:VIEW" data-module="production"><a href="#reports/4">'),__append(t("NAVBAR:REPORTS:4")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:5:VIEW" data-module="production"><a href="#reports/5">'),__append(t("NAVBAR:REPORTS:5")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:6:VIEW" data-module="production"><a href="#reports/6">'),__append(t("NAVBAR:REPORTS:6")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:7:VIEW" data-module="production"><a href="#reports/7">'),__append(t("NAVBAR:REPORTS:7")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:8:VIEW" data-module="production"><a href="#reports/8">'),__append(t("NAVBAR:REPORTS:8")),__append('</a>\n    <li data-privilege="REPORTS:VIEW REPORTS:9:VIEW" data-module="production"><a href="#reports/9">'),__append(t("NAVBAR:REPORTS:9")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:REPORTS:ct")),__append('\n    <li data-privilege="PROD_DATA:VIEW" data-client-module="wmes-ct-pces"><a href="#ct/reports/pce">'),__append(t("NAVBAR:REPORTS:ct:pce")),__append('</a>\n    <li data-privilege="PROD_DATA:VIEW" data-client-module="wmes-ct-pces"><a href="#ct/reports/groups">'),__append(t("NAVBAR:REPORTS:ct:groups")),__append('</a>\n    <li data-privilege="PROD_DATA:VIEW" data-client-module="wmes-ct-pces"><a href="#ct/reports/results">'),__append(t("NAVBAR:REPORTS:ct:results")),__append('</a>\n    <li class="divider">\n    <li data-privilege="REPORTS:VIEW" data-module="vis"><a href="#vis/structure">'),__append(t("NAVBAR:VIS:STRUCTURE")),__append("</a>\n  </ul>\n")}.call(this),__append("\n      "),function(){__append('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:testing")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">'),__append(t("NAVBAR:xiconf")),__append('\n    <li data-privilege="XICONF:VIEW" data-module><a href="#xiconf/clients">'),__append(t("NAVBAR:xiconf:clients")),__append('</a>\n    <li data-privilege="XICONF:VIEW" data-module><a href="#xiconf/orders">'),__append(t("NAVBAR:xiconf:orders")),__append('</a>\n    <li data-privilege="XICONF:VIEW" data-module><a href="#xiconf/results">'),__append(t("NAVBAR:xiconf:results")),__append('</a>\n    <li data-privilege="XICONF:VIEW" data-module><a href="#xiconf/programs">'),__append(t("NAVBAR:xiconf:programs")),__append('</a>\n    <li data-privilege="XICONF:VIEW" data-module><a href="#xiconf/hidLamps">'),__append(t("NAVBAR:xiconf:hidLamps")),__append('</a>\n    <li data-privilege="XICONF:VIEW" data-module><a href="#xiconf/componentWeights">'),__append(t("NAVBAR:xiconf:componentWeights")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:snf")),__append('\n    <li data-privilege="SNF:VIEW" data-module="wmes-snf"><a href="#snf/tests">'),__append(t("NAVBAR:snf:results")),__append('</a>\n    <li data-privilege="SNF:VIEW" data-module="wmes-snf"><a href="#snf/programs">'),__append(t("NAVBAR:snf:programs")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:trw")),__append('\n    <li data-privilege="TRW:VIEW" data-module="wmes-trw"><a href="#trw/tests">'),__append(t("NAVBAR:trw:results")),__append('</a>\n    <li data-privilege="TRW:VIEW" data-module="wmes-trw"><a href="#trw/programs">'),__append(t("NAVBAR:trw:programs")),__append('</a>\n    <li data-privilege="TRW:VIEW" data-module="wmes-trw"><a href="#trw/bases">'),__append(t("NAVBAR:trw:bases")),__append('</a>\n    <li data-privilege="TRW:VIEW" data-module="wmes-trw"><a href="#trw/testers">'),__append(t("NAVBAR:trw:testers")),__append("</a>\n  </ul>\n")}.call(this),__append("\n      "),function(){__append('<li data-online data-privilege="QI:RESULTS:VIEW FN:master FN:leader FN:manager FN:prod_whman" data-module="qi" class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:QI:main")),__append('\n    <span class="qi-counter hidden"><span class="qi-counter-actual">0</span>/<span class="qi-counter-required">0</span></span>\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">'),__append(t("NAVBAR:QI:results")),__append('\n    <li><a href="#qi/results">'),__append(t("NAVBAR:QI:results:all")),__append('</a>\n    <li class="navbar-with-button"><a href="#qi/results;ok">'),__append(t("NAVBAR:QI:results:good")),__append('</a><button class="btn btn-success" data-privilege="QI:INSPECTOR QI:MANAGE" data-href="#qi/results;add?ok"><i class="fa fa-plus"></i></button>\n    <li class="navbar-with-button"><a href="#qi/results;nok">'),__append(t("NAVBAR:QI:results:bad")),__append('</a><button class="btn btn-danger" data-privilege="QI:INSPECTOR QI:MANAGE" data-href="#qi/results;add?nok"><i class="fa fa-plus"></i></button>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:QI:reports")),__append('\n    <li><a href="#qi/reports/count">'),__append(t("NAVBAR:QI:reports:count")),__append('</a>\n    <li><a href="#qi/reports/okRatio">'),__append(t("NAVBAR:QI:reports:okRatio")),__append('</a>\n    <li><a href="#qi/reports/nokRatio">'),__append(t("NAVBAR:QI:reports:nokRatio")),__append('</a>\n    <li><a href="#qi/reports/outgoingQuality">'),__append(t("NAVBAR:QI:reports:outgoingQuality")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:QI:dictionaries")),__append('\n    <li data-privilege="QI:DICTIONARIES:VIEW"><a href="#qi/kinds">'),__append(t("NAVBAR:QI:kinds")),__append('</a>\n    <li data-privilege="QI:DICTIONARIES:VIEW"><a href="#qi/errorCategories">'),__append(t("NAVBAR:QI:errorCategories")),__append('</a>\n    <li data-privilege="QI:DICTIONARIES:VIEW"><a href="#qi/faults">'),__append(t("NAVBAR:QI:faults")),__append('</a>\n    <li data-privilege="QI:DICTIONARIES:VIEW"><a href="#qi/standards">'),__append(t("NAVBAR:QI:standards")),__append('</a>\n    <li data-privilege="QI:DICTIONARIES:VIEW"><a href="#qi/actionStatuses">'),__append(t("NAVBAR:QI:actionStatuses")),__append("</a>\n  </ul>\n")}.call(this),__append("\n      "),function(){__append('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:KAIZEN:main")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">'),__append(t("NAVBAR:KAIZEN:orders")),__append('\n    <li data-privilege="LOCAL USER" data-module="kaizen" class="navbar-with-button"><a href="#kaizenOrders">'),__append(t("NAVBAR:KAIZEN:all")),__append('</a><button class="btn btn-default" data-href="#kaizenOrders;add"><i class="fa fa-plus"></i></button>\n    <li data-privilege="LOCAL USER" data-module="kaizen"><a href="#kaizenOrders?status=in=(new,accepted,todo,inProgress,paused)&sort(-eventDate)&limit(20)">'),__append(t("NAVBAR:KAIZEN:open")),__append('</a>\n    <li data-privilege="USER" data-module="kaizen"><a href="#kaizenOrders?observers.user.id=mine&sort(-eventDate)&limit(20)">'),__append(t("NAVBAR:KAIZEN:mine")),__append('</a>\n    <li data-privilege="USER" data-module="kaizen"><a href="#kaizenOrders?observers.user.id=unseen&sort(-eventDate)&limit(20)">'),__append(t("NAVBAR:KAIZEN:unseen")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:KAIZEN:observations")),__append('\n    <li data-privilege="LOCAL USER" data-module class="navbar-with-button"><a href="#behaviorObsCards">'),__append(t("NAVBAR:KAIZEN:all")),__append('</a><button class="btn btn-default" data-href="#behaviorObsCards;add"><i class="fa fa-plus"></i></button>\n    <li data-privilege="USER" data-module><a href="#behaviorObsCards?users=mine&sort(-date)&limit(20)">'),__append(t("NAVBAR:KAIZEN:mine")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:KAIZEN:minutesForSafety")),__append('\n    <li data-privilege="USER" data-module class="navbar-with-button"><a href="#minutesForSafetyCards">'),__append(t("NAVBAR:KAIZEN:all")),__append('</a><button class="btn btn-default" data-href="#minutesForSafetyCards;add"><i class="fa fa-plus"></i></button>\n    <li data-privilege="USER" data-module><a href="#minutesForSafetyCards?users=mine&sort(-date)&limit(20)">'),__append(t("NAVBAR:KAIZEN:mine")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:KAIZEN:reports")),__append('\n    <li data-privilege="USER" data-module="kaizen"><a href="#kaizenReport">'),__append(t("NAVBAR:KAIZEN:reports:count")),__append('</a>\n    <li data-privilege="USER" data-module="behaviorObsCards"><a href="#behaviorObsCardCountReport">'),__append(t("NAVBAR:KAIZEN:reports:observations")),__append('</a>\n    <li data-privilege="USER" data-module="minutesForSafetyCards"><a href="#minutesForSafetyCardCountReport">'),__append(t("NAVBAR:KAIZEN:reports:minutes")),__append('</a>\n    <li data-privilege="USER" data-module="kaizen"><a href="#kaizenSummaryReport">'),__append(t("NAVBAR:KAIZEN:reports:summary")),__append('</a>\n    <li data-privilege="USER" data-module="kaizen"><a href="#kaizenEngagementReport">'),__append(t("NAVBAR:KAIZEN:reports:engagement")),__append('</a>\n    <li data-privilege="USER" data-module="kaizen"><a href="#kaizenMetricsReport">'),__append(t("NAVBAR:KAIZEN:reports:metrics")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:KAIZEN:dictionaries")),__append('\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="kaizen"><a href="#kaizenSections">'),__append(t("NAVBAR:KAIZEN:sections")),__append('</a>\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="kaizen"><a href="#kaizenAreas">'),__append(t("NAVBAR:KAIZEN:areas")),__append('</a>\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="kaizen"><a href="#kaizenCategories">'),__append(t("NAVBAR:KAIZEN:categories")),__append('</a>\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="kaizen"><a href="#kaizenCauses">'),__append(t("NAVBAR:KAIZEN:causes")),__append('</a>\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="kaizen"><a href="#kaizenRisks">'),__append(t("NAVBAR:KAIZEN:risks")),__append('</a>\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="kaizen"><a href="#kaizenBehaviours">'),__append(t("NAVBAR:KAIZEN:behaviours")),__append('</a>\n    <li class="divider">\n    <li data-module="kaizen"><a href="#kaizenHelp">'),__append(t("NAVBAR:KAIZEN:help")),__append("</a>\n  </ul>\n")}.call(this),__append("\n      "),function(){__append('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:SUGGESTIONS:main")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">'),__append(t("NAVBAR:SUGGESTIONS:orders")),__append('\n    <li data-privilege="LOCAL USER" data-module class="navbar-with-button"><a href="#suggestions">'),__append(t("NAVBAR:SUGGESTIONS:all")),__append('</a><button class="btn btn-default" data-href="#suggestions;add"><i class="fa fa-plus"></i></button>\n    <li data-privilege="LOCAL USER" data-module><a href="#suggestions?status=in=(new,accepted,todo,inProgress,paused)&sort(-date)&limit(20)">'),__append(t("NAVBAR:SUGGESTIONS:open")),__append('</a>\n    <li data-privilege="USER" data-module><a href="#suggestions?observers.user.id=mine&sort(-date)&limit(20)">'),__append(t("NAVBAR:SUGGESTIONS:mine")),__append('</a>\n    <li data-privilege="USER" data-module><a href="#suggestions?observers.user.id=unseen&sort(-date)&limit(20)">'),__append(t("NAVBAR:SUGGESTIONS:unseen")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:SUGGESTIONS:reports")),__append('\n    <li data-privilege="USER" data-module="suggestions"><a href="#suggestionCountReport">'),__append(t("NAVBAR:SUGGESTIONS:reports:count")),__append('</a>\n    <li data-privilege="USER" data-module="suggestions"><a href="#suggestionSummaryReport">'),__append(t("NAVBAR:SUGGESTIONS:reports:summary")),__append('</a>\n    <li data-privilege="USER" data-module="suggestions"><a href="#suggestionEngagementReport">'),__append(t("NAVBAR:SUGGESTIONS:reports:engagement")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:SUGGESTIONS:dictionaries")),__append('\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="suggestions"><a href="#kaizenSections">'),__append(t("NAVBAR:SUGGESTIONS:sections")),__append('</a>\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="suggestions"><a href="#kaizenCategories">'),__append(t("NAVBAR:SUGGESTIONS:categories")),__append('</a>\n    <li data-privilege="KAIZEN:DICTIONARIES:VIEW" data-module="suggestions"><a href="#kaizenProductFamilies">'),__append(t("NAVBAR:SUGGESTIONS:productFamilies")),__append('</a>\n    <li class="divider">\n    <li data-module="suggestions"><a href="#suggestionHelp">'),__append(t("NAVBAR:SUGGESTIONS:help")),__append("</a>\n  </ul>\n")}.call(this),__append("\n      "),function(){__append('<li data-online data-loggedin class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:OPINION:main")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-module="opinionSurveys"><a href="/opinion" target="_blank">'),__append(t("NAVBAR:OPINION:current")),__append('</a>\n    <li data-module="opinionSurveys"><a href="#opinionSurveyReport">'),__append(t("NAVBAR:OPINION:report")),__append('</a>\n    <li data-module="opinionSurveys"><a href="#opinionSurveyActions">'),__append(t("NAVBAR:OPINION:actions")),__append('</a>\n    <li data-privilege="OPINION_SURVEYS:MANAGE" data-module="opinionSurveys"><a href="#opinionSurveyResponses">'),__append(t("NAVBAR:OPINION:responses")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:OPINION:scanning")),__append('\n    <li data-privilege="OPINION_SURVEYS:MANAGE" data-module="opinionSurveys"><a href="#opinionSurveyScanTemplates">'),__append(t("NAVBAR:OPINION:scanTemplates")),__append('</a>\n    <li data-privilege="OPINION_SURVEYS:MANAGE" data-module="opinionSurveys"><a href="#opinionSurveyOmrResults">'),__append(t("NAVBAR:OPINION:omrResults")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("NAVBAR:OPINION:dictionaries")),__append('\n    <li data-privilege="OPINION_SURVEYS:MANAGE" data-module="opinionSurveys"><a href="#opinionSurveys">'),__append(t("NAVBAR:OPINION:surveys")),__append('</a>\n    <li data-privilege="OPINION_SURVEYS:MANAGE" data-module="opinionSurveys"><a href="#opinionSurveyEmployers">'),__append(t("NAVBAR:OPINION:employers")),__append('</a>\n    <li data-privilege="OPINION_SURVEYS:MANAGE" data-module="opinionSurveys"><a href="#opinionSurveyDivisions">'),__append(t("NAVBAR:OPINION:divisions")),__append('</a>\n    <li data-privilege="OPINION_SURVEYS:MANAGE" data-module="opinionSurveys"><a href="#opinionSurveyQuestions">'),__append(t("NAVBAR:OPINION:questions")),__append("</a>\n  </ul>\n")}.call(this),__append("\n      "),function(){__append('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:DICTIONARIES")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-privilege="ORDERS:VIEW" data-module="orders"><a href="#mechOrders">'),__append(t("NAVBAR:MECH_ORDERS")),__append('</a>\n    <li data-privilege="ORDERS:VIEW" data-module><a href="#orders">'),__append(t("NAVBAR:OTHER_ORDERS")),__append('</a>\n    <li class="divider">\n    <li data-privilege="USERS:VIEW" data-module><a href="#users">'),__append(t("NAVBAR:USERS")),__append('</a>\n    <li class="divider">\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#divisions">'),__append(t("NAVBAR:DIVISIONS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#subdivisions">'),__append(t("NAVBAR:SUBDIVISIONS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#mrpControllers">'),__append(t("NAVBAR:MRP_CONTROLLERS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodFlows">'),__append(t("NAVBAR:PROD_FLOWS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#workCenters">'),__append(t("NAVBAR:WORK_CENTERS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodLines">'),__append(t("NAVBAR:PROD_LINES")),__append('</a>\n    <li class="divider">\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#companies">'),__append(t("NAVBAR:COMPANIES")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodFunctions">'),__append(t("NAVBAR:PROD_FUNCTIONS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#prodTasks">'),__append(t("NAVBAR:PROD_TASKS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#orderStatuses">'),__append(t("NAVBAR:ORDER_STATUSES")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#delayReasons">'),__append(t("NAVBAR:DELAY_REASONS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#downtimeReasons">'),__append(t("NAVBAR:DOWNTIME_REASONS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#lossReasons">'),__append(t("NAVBAR:LOSS_REASONS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#aors">'),__append(t("NAVBAR:AORS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#isaPalletKinds">'),__append(t("NAVBAR:ISA_PALLET_KINDS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module="printing"><a href="#printers">'),__append(t("NAVBAR:PRINTERS")),__append('</a>\n    <li data-privilege="DICTIONARIES:VIEW" data-module="orders"><a href="#pkhdStrategies">'),__append(t("NAVBAR:PKHD_STRATEGIES")),__append('</a>\n    <li class="divider">\n    <li data-privilege="DICTIONARIES:VIEW" data-module><a href="#licenses">'),__append(t("NAVBAR:LICENSES")),__append("</a>\n  </ul>\n")}.call(this),__append("\n      "),function(){__append('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:TOOLS")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-loggedin data-module><a href="#kanban">'),__append(t("NAVBAR:kanban")),__append('</a>\n    <li data-loggedin data-module><a href="#pfep/entries">'),__append(t("NAVBAR:pfep")),__append('</a>\n    <li data-privilege="TOOLCAL:VIEW" data-module="wmes-toolcal"><a href="#toolcal/tools">'),__append(t("NAVBAR:toolcal")),__append('</a>\n    <li data-privilege="LUMA2:VIEW" data-module="wmes-luma2-frontend"><a href="#luma2/events">'),__append(t("NAVBAR:luma2")),__append('</a>\n    <li data-privilege="LUCA:VIEW" data-module="wmes-luca-frontend"><a href="#luca/events">'),__append(t("NAVBAR:luca")),__append('</a>\n    <li data-privilege="ORDERS:VIEW" data-module="orders" data-item="invalidOrders"><a href="#invalidOrders">'),__append(t("NAVBAR:INVALID_ORDERS")),__append('</a></li>\n    <li data-privilege="ORDERS:VIEW" data-module="orders" data-item="iptCheck">\n      <a href="http://plrketchr8ms612.lux.intra.lighting.com/php/ipt-check/" target="_blank">\n        '),__append(t("NAVBAR:IPT_CHECK")),__append('\n        &nbsp;\n        <i class="fa fa-external-link"></i>\n      </a>\n    </li>\n    <li class="navbar-with-button" data-item="fixedAssets">\n      <a href="/loginIn/fa" target="_blank">\n        '),__append(t("NAVBAR:fa")),__append('\n        &nbsp;\n        <i class="fa fa-external-link"></i>\n      </a>\n      <a href="https://st.walkner.pl/#fa/help" class="btn btn-default" target="_blank"><i class="fa fa-question"></i></a>\n    </li>\n    <li class="divider"></li>\n    <li data-privilege="EVENTS:VIEW" data-module><a href="#events">'),__append(t("NAVBAR:EVENTS")),__append('</a>\n    <li data-privilege="SUPER" data-module><a href="#logs/browserErrors">'),__append(t("NAVBAR:logs:browserErrors")),__append("</a>\n  </ul>\n</li>\n")}.call(this),__append("\n    </ul>\n    "),function(){__append('<ul class="nav navbar-nav navbar-right">\n  <li class="dropdown navbar-account-dropdown">\n    <a href="#account" class="dropdown-toggle" data-toggle="dropdown">\n      <i class="fa fa-user fa-lg navbar-account-status"></i>\n      '),__append(user.getLabel()),__append('\n      <b class="caret"></b>\n    </a>\n    <ul class="dropdown-menu">\n      <li data-online data-loggedin><a href="#users/'),__append(user.data._id),__append('">'),__append(t("NAVBAR:MY_ACCOUNT")),__append('</a>\n      <li class="divider">\n      <li class="dropdown-header">'),__append(t("NAVBAR:UI_LOCALE")),__append('\n      <li><a class="navbar-account-locale" href="#" data-locale="pl">'),__append(t("NAVBAR:LOCALE_PL")),__append('</a>\n      <li><a class="navbar-account-locale" href="#" data-locale="en">'),__append(t("NAVBAR:LOCALE_US")),__append('</a>\n      <li class="divider">\n      <li data-online data-loggedin=0><a class="navbar-account-logIn" href="#login">'),__append(t("NAVBAR:LOG_IN")),__append('</a>\n      <li data-online data-loggedin><a class="navbar-account-logOut" href="/logout">'),__append(t("NAVBAR:LOG_OUT")),__append("</a>\n    </ul>\n  </li>\n</ul>\n")}.call(this),__append("\n    "),user.isAllowedTo("LOCAL","USER")&&(__append("\n    "),function(){__append('<form id="'),__append(idPrefix),__append('-search" class="navbar-form navbar-right navbar-search" autocomplete="off">\n  <div class="form-group has-feedback">\n    <input id="'),__append(idPrefix),__append('-searchPhrase" type="text" autocomplete="new-password" class="form-control navbar-search-phrase">\n    <span class="fa fa-search form-control-feedback"></span>\n  </div>\n  <ul id="'),__append(idPrefix),__append('-searchResults" class="dropdown-menu navbar-search-results"></ul>\n</form>\n')}.call(this),__append("\n    ")),__append('\n    <div class="navbar-right">\n      <a id="'),__append(idPrefix),__append('-mor" class="btn btn-link navbar-mor" href="#mor" title="'),__append(t("core","NAVBAR:mor")),__append('" style="width: 41px"><i class="fa fa-group"></i></a>\n    </div>\n  </div>\n</div>\n');return __output}});