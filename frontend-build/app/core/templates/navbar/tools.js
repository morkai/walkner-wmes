define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(a){return _ENCODE_HTML_RULES[a]||a}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<li data-online class="dropdown">\n  <a class="dropdown-toggle" data-toggle="dropdown">\n    '),__append(t("core","NAVBAR:TOOLS")),__append('\n    <b class="caret"></b>\n  </a>\n  <ul class="dropdown-menu">\n    <li data-loggedin data-module><a href="#kanban">'),__append(t("core","NAVBAR:kanban")),__append('</a>\n    <li data-loggedin data-module><a href="#pfep/entries">'),__append(t("core","NAVBAR:pfep")),__append('</a>\n    <li data-privilege="TOOLCAL:VIEW" data-module="wmes-toolcal"><a href="#toolcal/tools">'),__append(t("core","NAVBAR:toolcal")),__append('</a>\n    <li data-privilege="LUMA2:VIEW" data-module="wmes-luma2-frontend"><a href="#luma2/events">'),__append(t("core","NAVBAR:luma2")),__append('</a>\n    <li data-privilege="ORDERS:VIEW" data-module="orders"><a href="#invalidOrders">'),__append(t("core","NAVBAR:INVALID_ORDERS")),__append('</a></li>\n    <li data-privilege="ORDERS:VIEW" data-module="orders">\n      <a href="http://pww.ket.lighting.philips.com/php/ipt-check/" target="_blank">\n        '),__append(t("core","NAVBAR:IPT_CHECK")),__append('\n        &nbsp;\n        <i class="fa fa-external-link"></i>\n      </a>\n    </li>\n    <li class="divider"></li>\n    <li data-privilege="EVENTS:VIEW" data-module><a href="#events">'),__append(t("core","NAVBAR:EVENTS")),__append("</a>\n  </ul>\n</li>\n");return __output.join("")}});