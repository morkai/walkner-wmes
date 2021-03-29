define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(d){return void 0==d?"":String(d).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(d){return _ENCODE_HTML_RULES[d]||d}var __output="";function __append(d){void 0!==d&&null!==d&&(__output+=d)}with(locals||{})__append('<div class="production is-'),__append(locked?"locked":"unlocked"),__append(" "),__append(state?"is-"+state:""),__append(" "),__append(mechOrder?"is-mechOrder":""),__append(' hidden">\n  <div id="'),__append(id("controls")),__append('"></div>\n  <div id="'),__append(id("header")),__append('"></div>\n  <div id="'),__append(id("data")),__append('"></div>\n  <div id="'),__append(id("execution")),__append('"></div>\n  <div class="production-ft">\n    <div class="production-downtimes">\n      <h2 id="'),__append(id("downtimes-header")),__append('" class="production-sectionHeader">'),__append(t("section:downtimes")),__append('</h2>\n      <div id="'),__append(id("downtimes")),__append('"></div>\n    </div>\n    <div class="production-taktTime">\n      <h2 class="production-sectionHeader">'),__append(t("section:taktTime")),__append('</h2>\n      <div id="'),__append(id("taktTime")),__append('"></div>\n    </div>\n    <div class="production-quantities">\n      <h2 class="production-sectionHeader">'),__append(t("section:quantities")),__append('</h2>\n      <div id="'),__append(id("quantities")),__append('"></div>\n    </div>\n    <div class="production-isa">\n      <h2 class="production-sectionHeader">'),__append(t("isa:header")),__append('</h2>\n      <div id="'),__append(id("isa")),__append('"></div>\n    </div>\n  </div>\n  <div id="'),__append(id("currentDowntime")),__append('" class="production-currentDowntime hidden">\n    <div id="'),__append(id("currentDowntime-message")),__append('" class="production-currentDowntime-message">\n      <div id="'),__append(id("currentDowntime-reason")),__append('"></div>\n      <div id="'),__append(id("currentDowntime-aor")),__append('" class="production-currentDowntime-aor"></div>\n      <div id="'),__append(id("currentDowntime-duration")),__append('" class="production-currentDowntime-duration"></div>\n      <div id="'),__append(id("currentDowntime-elapsedTime")),__append('"></div>\n    </div>\n  </div>\n  <div id="'),__append(id("vkb")),__append('"></div>\n  <div id="'),__append(id("message")),__append('" class="production-message hidden">\n    <div id="'),__append(id("message-outer")),__append('" class="production-message-outer">\n      <div id="'),__append(id("message-inner")),__append('" class="production-message-inner"></div>\n    </div>\n  </div>\n</div>\n');return __output}});