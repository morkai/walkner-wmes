define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="production-execution">\n  <div class="production-execution-labels">\n    <div class="production-execution-label">'),__append(t("production","execution:todo")),__append('</div>\n    <div class="production-execution-label">'),__append(t("production","execution:done")),__append('</div>\n  </div>\n  <div class="production-execution-timelines">\n    <div id="'),__append(idPrefix),__append('-todo" class="production-execution-todo"></div>\n    <div id="'),__append(idPrefix),__append('-done" class="production-execution-done"></div>\n    <div id="'),__append(idPrefix),__append('-legend" class="production-execution-legend">\n      <div class="production-execution-legend-h">1</div>\n      <div class="production-execution-legend-h">2</div>\n      <div class="production-execution-legend-h">3</div>\n      <div class="production-execution-legend-h">4</div>\n      <div class="production-execution-legend-h">5</div>\n      <div class="production-execution-legend-h">6</div>\n      <div class="production-execution-legend-h">7</div>\n      <div class="production-execution-legend-h">8</div>\n      <div id="'),__append(idPrefix),__append('-time" class="production-execution-legend-time hidden" style="left: 50%">00:00:00<br></div>\n    </div>\n  </div>\n</div>\n');return __output.join("")}});