define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div id="'),__append(idPrefix),__append('-jumpList" class="list-group orders-jumpList">\n  '),["details","fap","downtimes","childOrders","operations","documents","bom","eto","changes"].forEach(function(e){__append('\n  <a href="#orders-'),__append(e),__append('" class="list-group-item" data-section="'),__append(e),__append('">'),__append(t("orders","jumpList:"+e)),__append("</a>\n  ")}),__append("\n</div>\n");return __output.join("")}});