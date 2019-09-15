define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(a){return _ENCODE_HTML_RULES[a]||a}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<li data-online data-module="fte" class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("NAVBAR:FTE")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-privilege="FTE:MASTER:VIEW" class="navbar-with-button"><a href="#fte/master">'),__append(t("NAVBAR:FTE:MASTER")),__append('</a><button class="btn btn-default" data-privilege="FTE:MASTER:MANAGE" data-href="#fte/master;add"><i class="fa fa-plus"></i></button>\n    <li data-privilege="FTE:LEADER:VIEW FTE:WH:VIEW" class="navbar-with-button"><a href="#fte/wh">'),__append(t("NAVBAR:FTE:WH")),__append('</a><button class="btn btn-default" data-privilege="FTE:LEADER:MANAGE" data-href="#fte/wh;add"><i class="fa fa-plus"></i></button>\n    <li data-privilege="FTE:LEADER:VIEW" class="navbar-with-button"><a href="#fte/leader">'),__append(t("NAVBAR:FTE:LEADER")),__append('</a><button class="btn btn-default" data-privilege="FTE:LEADER:MANAGE" data-href="#fte/leader;add"><i class="fa fa-plus"></i></button>\n    <li data-privilege="PROD_DATA:MANAGE"><a href="#fte;settings">'),__append(t("NAVBAR:FTE:SETTINGS")),__append("</a>\n  </ul>\n");return __output.join("")}});