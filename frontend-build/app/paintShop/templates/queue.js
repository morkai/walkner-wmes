define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="paintShop-queue">\n  '),orders.length?(__append('\n  <table id="'),__append(idPrefix),__append('-orders" class="paintShop-orders">\n    '),orders.forEach(function(e){__append("\n    "),__append(renderQueueOrder(e)),__append("\n    ")}),__append("\n  </table>\n  <hr>\n  ")):(__append('\n  <p id="'),__append(idPrefix),__append('-empty" class="paintShop-queue-empty">'),__append(t("paintShop","empty")),__append("</p>\n  ")),__append("\n</div>\n");return __output.join("")}});