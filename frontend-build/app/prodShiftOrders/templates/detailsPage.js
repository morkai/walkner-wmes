define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escape=escape||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div>\n  <div id="'),__append(idPrefix),__append('-details" class="prodShiftOrders-details-container"></div>\n  <div id="'),__append(idPrefix),__append('-downtimes" class="panel panel-danger prodShiftOrders-downtimes-container">\n    <div class="panel-heading">'),__append(t("prodShiftOrders","PANEL:TITLE:downtimes")),__append('</div>\n  </div>\n  <div id="'),__append(idPrefix),__append('-order" class="prodShiftOrders-order-container"></div>\n  <div id="'),__append(idPrefix),__append('-operations" class="prodShiftOrders-operations-container"></div>\n  <div id="'),__append(idPrefix),__append('-serialNumbers" class="prodShiftOrders-serialNumbers-container"></div>\n</div>\n');return __output.join("")}});