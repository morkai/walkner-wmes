define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<a id="qzPrintInitWarning" class="message message-inline message-warning" href="#purchaseOrders;qzPrintHelp">\n  <p>'),__append(t("purchaseOrders","qzPrint:initWarning")),__append("</p>\n</a>\n");return __output.join("")}});