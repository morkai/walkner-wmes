define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(a){return _ENCODE_HTML_RULES[a]||a}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="dropup embedded-actions '),__append(left?"embedded-left":"embedded-right"),__append('" data-app="'),__append(app),__append('">\n  <button data-action="switch" class="btn btn-default btn-lg" type="button" title="'),__append(t("core","embedded:actions:switch")),__append('">\n    <i class="fa fa-window-restore"></i>\n  </button>\n  <button class="btn btn-default btn-lg dropdown-toggle" type="button" data-toggle="dropdown">\n    <i class="fa fa-cogs"></i>\n  </button>\n  <ul class="dropdown-menu '),__append(left?"":"dropdown-menu-right"),__append('">\n    <li><a data-action="switch"><i class="fa fa-window-restore"></i><span>'),__append(t("core","embedded:actions:switch")),__append('</span></a></li>\n    <li><a data-action="refresh"><i class="fa fa-refresh"></i><span>'),__append(t("core","embedded:actions:refresh")),__append('</span></a></li>\n    <li><a data-action="config"><i class="fa fa-wrench"></i><span>'),__append(t("core","embedded:actions:config")),__append('</span></a></li>\n    <li><a data-action="reboot"><i class="fa fa-undo"></i><span>'),__append(t("core","embedded:actions:reboot")),__append('</span></a></li>\n    <li><a data-action="shutdown"><i class="fa fa-power-off"></i><span>'),__append(t("core","embedded:actions:shutdown")),__append("</span></a></li>\n  </ul>\n</div>\n");return __output.join("")}});