define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div>\n  <div class="prodShifts-details-container"></div>\n  <div>\n    <h3 class="prodShifts-timeline-title">'),__append(t("prodShifts","timeline:title")),__append('</h3>\n    <div class="prodShifts-timeline-container"></div>\n  </div>\n  <div class="prodShifts-quantitiesDone-container"></div>\n</div>\n');return __output.join("")}});