define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(d){return void 0==d?"":String(d).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(d){return _ENCODE_HTML_RULES[d]||d}var __output="";function __append(d){void 0!==d&&null!==d&&(__output+=d)}with(locals||{})__append('<div class="osh-entries-details">\n  <div id="'),__append(id("props")),__append('"></div>\n  <div class="row">\n    <div class="col-lg-6">\n      <div id="'),__append(id("problem")),__append('"></div>\n      <div id="'),__append(id("reason")),__append('"></div>\n      <div id="'),__append(id("before")),__append('"></div>\n    </div>\n    <div class="col-lg-6">\n      <div id="'),__append(id("suggestion")),__append('"></div>\n      <div id="'),__append(id("solution")),__append('"></div>\n      <div id="'),__append(id("after")),__append('"></div>\n    </div>\n  </div>\n  <div id="'),__append(id("attachments")),__append('"></div>\n  <div id="'),__append(id("history")),__append('"></div>\n</div>\n');return __output}});