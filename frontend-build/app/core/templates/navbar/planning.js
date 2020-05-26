define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(a){return _ENCODE_HTML_RULES[a]||a}var __output="";function __append(a){void 0!==a&&null!==a&&(__output+=a)}with(locals||{})__append('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:PLANNING:main")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">\n      <span class="navbar-group-header">\n        <span>'),__append(t("NAVBAR:PLANNING:plans")),__append('</span>\n        <a data-privilege="PLANNING:VIEW" data-group="planning/daily" class="active" href="javascript:void(0)">'),__append(t("NAVBAR:PLANNING:daily")),__append('</a>\n        <a data-privilege="HOURLY_PLANS:VIEW" data-group="planning/hourly" href="javascript:void(0)">'),__append(t("NAVBAR:PLANNING:hourly")),__append('</a>\n      </span>\n    </li>\n    <li data-privilege="PLANNING:VIEW" data-module data-group="planning/daily"><a href="#planning/plans">'),__append(t("NAVBAR:PLANNING:all")),__append('</a></li>\n    <li data-privilege="PLANNING:VIEW" data-module data-group="planning/daily"><a href="#planning/plans/-1d">'),__append(t("NAVBAR:PLANNING:-1d")),__append('</a></li>\n    <li data-privilege="PLANNING:VIEW" data-module data-group="planning/daily"><a href="#planning/plans/0d">'),__append(t("NAVBAR:PLANNING:0d")),__append('</a></li>\n    <li data-privilege="PLANNING:VIEW" data-module data-group="planning/daily"><a href="#planning/plans/1d">'),__append(t("NAVBAR:PLANNING:1d")),__append('</a></li>\n    <li data-privilege="PLANNING:VIEW" data-module data-group="planning/daily"><a href="#planning/plans/2d">'),__append(t("NAVBAR:PLANNING:2d")),__append('</a></li>\n    <li class="navbar-with-button" data-privilege="HOURLY_PLANS:VIEW" data-module data-group="planning/hourly">\n      <a href="#hourlyPlans">'),__append(t("NAVBAR:PLANNING:all")),__append('</a>\n      <button class="btn btn-default" data-privilege="HOURLY_PLANS:MANAGE PROD_DATA:MANAGE" data-href="#hourlyPlans;add"><i class="fa fa-plus"></i></button>\n    </li>\n    <li class="navbar-with-button" data-privilege="HOURLY_PLANS:VIEW" data-module data-group="planning/hourly">\n      <a href="#hourlyPlans?date=0-1d&sort(-date)&limit(20)">'),__append(t("NAVBAR:PLANNING:0d")),__append('</a>\n      <button class="btn btn-default" data-privilege="HOURLY_PLANS:MANAGE PROD_DATA:MANAGE" data-href="#hourlyPlans;add?date=0d"><i class="fa fa-edit"></i></button>\n    </li>\n    <li class="navbar-with-button" data-privilege="HOURLY_PLANS:VIEW" data-module data-group="planning/hourly">\n      <a href="#hourlyPlans?date=1-2d&sort(-date)&limit(20)">'),__append(t("NAVBAR:PLANNING:1d")),__append('</a>\n      <button class="btn btn-default" data-privilege="HOURLY_PLANS:MANAGE PROD_DATA:MANAGE" data-href="#hourlyPlans;add?date=1d"><i class="fa fa-edit"></i></button>\n    </li>\n    <li class="navbar-with-button" data-privilege="HOURLY_PLANS:VIEW" data-module data-group="planning/hourly">\n      <a href="#hourlyPlans?date=2-3d&sort(-date)&limit(20)">'),__append(t("NAVBAR:PLANNING:2d")),__append('</a>\n      <button class="btn btn-default" data-privilege="HOURLY_PLANS:MANAGE PROD_DATA:MANAGE" data-href="#hourlyPlans;add?date=2d"><i class="fa fa-edit"></i></button>\n    </li>\n    <li class="divider"></li>\n    <li class="dropdown-header">\n      <span class="navbar-group-header">\n        <a data-privilege="PAINT_SHOP:VIEW" data-group="ps/ps" class="active" href="javascript:void(0)">'),__append(t("NAVBAR:PLANNING:paintShop")),__append('</a>\n        <a data-privilege="DRILLING:VIEW" data-group="ps/drill" href="javascript:void(0)">'),__append(t("NAVBAR:PLANNING:drilling")),__append('</a>\n        <a data-privilege="WIRING:VIEW" data-group="ps/wire" href="javascript:void(0)">'),__append(t("NAVBAR:PLANNING:wiring")),__append('</a>\n      </span>\n    </li>\n    <li data-privilege="PAINT_SHOP:VIEW" data-module data-group="ps/ps"><a href="#paintShop/-1d">'),__append(t("NAVBAR:PLANNING:-1d")),__append('</a></li>\n    <li data-privilege="PAINT_SHOP:VIEW" data-module data-group="ps/ps"><a href="#paintShop/0d">'),__append(t("NAVBAR:PLANNING:0d")),__append('</a></li>\n    <li data-privilege="PAINT_SHOP:VIEW" data-module data-group="ps/ps"><a href="#paintShop/1d">'),__append(t("NAVBAR:PLANNING:1d")),__append('</a></li>\n    <li data-privilege="PAINT_SHOP:VIEW" data-module data-group="ps/ps"><a href="#paintShop/2d">'),__append(t("NAVBAR:PLANNING:2d")),__append('</a></li>\n    <li data-privilege="PAINT_SHOP:VIEW" data-module data-group="ps/ps"><a href="#paintShop/load">'),__append(t("NAVBAR:PLANNING:paintShop:load")),__append('</a></li>\n    <li data-privilege="DRILLING:VIEW" data-module="wmes-drilling" data-group="ps/drill"><a href="#drilling/-1d">'),__append(t("NAVBAR:PLANNING:-1d")),__append('</a></li>\n    <li data-privilege="DRILLING:VIEW" data-module="wmes-drilling" data-group="ps/drill"><a href="#drilling/0d">'),__append(t("NAVBAR:PLANNING:0d")),__append('</a></li>\n    <li data-privilege="DRILLING:VIEW" data-module="wmes-drilling" data-group="ps/drill"><a href="#drilling/1d">'),__append(t("NAVBAR:PLANNING:1d")),__append('</a></li>\n    <li data-privilege="DRILLING:VIEW" data-module="wmes-drilling" data-group="ps/drill"><a href="#drilling/2d">'),__append(t("NAVBAR:PLANNING:2d")),__append('</a></li>\n    <li data-privilege="WIRING:VIEW" data-module="wmes-wiring" data-group="ps/wire"><a href="#wiring/-1d">'),__append(t("NAVBAR:PLANNING:-1d")),__append('</a></li>\n    <li data-privilege="WIRING:VIEW" data-module="wmes-wiring" data-group="ps/wire"><a href="#wiring/0d">'),__append(t("NAVBAR:PLANNING:0d")),__append('</a></li>\n    <li data-privilege="WIRING:VIEW" data-module="wmes-wiring" data-group="ps/wire"><a href="#wiring/1d">'),__append(t("NAVBAR:PLANNING:1d")),__append('</a></li>\n    <li data-privilege="WIRING:VIEW" data-module="wmes-wiring" data-group="ps/wire"><a href="#wiring/2d">'),__append(t("NAVBAR:PLANNING:2d")),__append('</a></li>\n    <li class="divider"></li>\n    <li id="'),__append(idPrefix),__append('-wh-hd" class="dropdown-header">\n      <span class="navbar-group-header">\n        <span>'),__append(t("NAVBAR:PLANNING:wh")),__append('</span>\n        <a class="active" href="javascript:void(0)" data-group="wh/old">'),__append(t("NAVBAR:PLANNING:wh:old")),__append('</a>\n        <a href="javascript:void(0)" data-group="wh/new">'),__append(t("NAVBAR:PLANNING:wh:new")),__append('</a>\n      </span>\n    </li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/old"><a href="#planning/wh/-1d">'),__append(t("NAVBAR:PLANNING:-1d")),__append('</a></li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/old"><a href="#planning/wh/0d">'),__append(t("NAVBAR:PLANNING:0d")),__append('</a></li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/old"><a href="#planning/wh/1d">'),__append(t("NAVBAR:PLANNING:1d")),__append('</a></li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/old"><a href="#planning/wh/2d">'),__append(t("NAVBAR:PLANNING:2d")),__append('</a></li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/new"><a href="#wh/pickup/0d">'),__append(t("NAVBAR:PLANNING:wh:pickup")),__append('</a></li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/new"><a href="#wh/delivery/components">'),__append(t("NAVBAR:PLANNING:wh:delivery:components")),__append('</a></li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/new"><a href="#wh/delivery/packaging">'),__append(t("NAVBAR:PLANNING:wh:delivery:packaging")),__append('</a></li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/new"><a href="#wh/problems">'),__append(t("NAVBAR:PLANNING:wh:problems")),__append('</a></li>\n    <li data-privilege="WH:VIEW PLANNING:VIEW" data-module data-group="wh/new"><a href="#wh/deliveredOrders?sort(date,set,startTime)&limit(-1337)&status=in=(todo,blocked)">'),__append(t("NAVBAR:PLANNING:wh:deliveredOrders")),__append('</a></li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/new"><a href="#wh/downtimes">'),__append(t("NAVBAR:PLANNING:wh:downtimes")),__append('</a></li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/new"><a href="#wh/setCarts">'),__append(t("NAVBAR:PLANNING:wh:setCarts")),__append('</a></li>\n    <li data-privilege="WH:VIEW PLANNING:VIEW" data-module data-group="wh/new"><a href="#wh/lines">'),__append(t("NAVBAR:PLANNING:wh:lines")),__append('</a></li>\n    <li data-privilege="WH:VIEW" data-module data-group="wh/new"><a href="#wh/events">'),__append(t("NAVBAR:PLANNING:wh:events")),__append('</a></li>\n    <li data-privilege="WH:MANAGE" data-module data-group="wh/new"><a href="#wh/settings">'),__append(t("NAVBAR:PLANNING:wh:settings")),__append("</a></li>\n  </ul>\n</li>\n");return __output}});