define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<div>\n  <div id="'),__append(id("details")),__append('" class="prodShifts-details-container"></div>\n  <div>\n    <h3 class="prodShifts-timeline-title">'),__append(t("timeline:title")),__append('</h3>\n    <div id="'),__append(id("timeline")),__append('" class="prodShifts-timeline-container"></div>\n  </div>\n  <div id="'),__append(id("quantitiesDone")),__append('" class="prodShifts-quantitiesDone-container"></div>\n</div>\n');return __output}});