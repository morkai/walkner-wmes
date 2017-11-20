define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(a){return _ENCODE_HTML_RULES[a]||a}escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<li data-online data-privilege="HOURLY_PLANS:VIEW PROD_DATA:VIEW PLANNING:VIEW" data-module="hourlyPlans" class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("core","NAVBAR:PLANNING:main")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li class="dropdown-header">'),__append(t("core","NAVBAR:PLANNING:hourly")),__append('\n    <li class="navbar-with-button">\n      <a href="#hourlyPlans">'),__append(t("core","NAVBAR:PLANNING:all")),__append('</a>\n      <button class="btn btn-default" data-privilege="HOURLY_PLANS:MANAGE PROD_DATA:MANAGE" data-href="#hourlyPlans;add"><i class="fa fa-plus"></i></button>\n    <li class="navbar-with-button">\n      <a href="#hourlyPlans?date=0-1d&sort(-date)&limit(20)">'),__append(t("core","NAVBAR:PLANNING:0d")),__append('</a>\n      <button class="btn btn-default" data-privilege="HOURLY_PLANS:MANAGE PROD_DATA:MANAGE" data-href="#hourlyPlans;add?date=0d"><i class="fa fa-edit"></i></button>\n    <li class="navbar-with-button">\n      <a href="#hourlyPlans?date=1-2d&sort(-date)&limit(20)">'),__append(t("core","NAVBAR:PLANNING:1d")),__append('</a>\n      <button class="btn btn-default" data-privilege="HOURLY_PLANS:MANAGE PROD_DATA:MANAGE" data-href="#hourlyPlans;add?date=1d"><i class="fa fa-edit"></i></button>\n    <li class="navbar-with-button">\n      <a href="#hourlyPlans?date=2-3d&sort(-date)&limit(20)">'),__append(t("core","NAVBAR:PLANNING:2d")),__append('</a>\n      <button class="btn btn-default" data-privilege="HOURLY_PLANS:MANAGE PROD_DATA:MANAGE" data-href="#hourlyPlans;add?date=2d"><i class="fa fa-edit"></i></button>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("core","NAVBAR:PLANNING:daily")),__append('\n    <li data-privilege="PLANNING:VIEW"><a href="#planning/plans" data-module="planning">'),__append(t("core","NAVBAR:PLANNING:all")),__append('</a>\n    <li data-privilege="PLANNING:VIEW"><a href="#planning/plans/-1d" data-module="planning">'),__append(t("core","NAVBAR:PLANNING:-1d")),__append('</a>\n    <li data-privilege="PLANNING:VIEW"><a href="#planning/plans/0d" data-module="planning">'),__append(t("core","NAVBAR:PLANNING:0d")),__append('</a>\n    <li data-privilege="PLANNING:VIEW"><a href="#planning/plans/1d" data-module="planning">'),__append(t("core","NAVBAR:PLANNING:1d")),__append('</a>\n    <li class="planning-navbar-2d" data-privilege="PLANNING:VIEW" title="'),__append(t("core","NAVBAR:PLANNING:2d:help")),__append('"><a href="#planning/plans/2d" data-module="planning">'),__append(t("core","NAVBAR:PLANNING:2d")),__append('</a>\n    <li class="divider">\n    <li class="dropdown-header">'),__append(t("core","NAVBAR:PLANNING:paintShop")),__append('\n    <li data-privilege="PAINT_SHOP:VIEW" data-module><a href="#paintShop/-1d" data-module="planning">'),__append(t("core","NAVBAR:PLANNING:-1d")),__append('</a>\n    <li data-privilege="PAINT_SHOP:VIEW" data-module><a href="#paintShop/0d" data-module="planning">'),__append(t("core","NAVBAR:PLANNING:0d")),__append('</a>\n    <li data-privilege="PAINT_SHOP:VIEW" data-module><a href="#paintShop/1d" data-module="planning">'),__append(t("core","NAVBAR:PLANNING:1d")),__append('</a>\n    <li class="planning-navbar-2d" data-privilege="PAINT_SHOP:VIEW" title="'),__append(t("core","NAVBAR:PLANNING:2d:help")),__append('"><a href="#paintShop/2d" data-module="planning">'),__append(t("core","NAVBAR:PLANNING:2d")),__append("</a>\n  </ul>\n");return __output.join("")}});