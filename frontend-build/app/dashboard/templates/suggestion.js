define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(d){return _ENCODE_HTML_RULES[d]||d}escapeFn=escapeFn||function(d){return void 0==d?"":String(d).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="dashboard-suggestion">\n  <div class="dashboard-metricsAndList">\n    <div id="'),__append(idPrefix),__append('-suggestion-metrics" class="dashboard-metricsAndList-metrics"></div>\n    <div class="dashboard-top-container">\n      <div class="dashboard-top-card">\n        <div id="'),__append(idPrefix),__append('-suggestion-top10-current" class="dashboard-metricsAndList-top"></div>\n        <div id="'),__append(idPrefix),__append('-suggestion-top10-previous" class="dashboard-metricsAndList-top"></div>\n      </div>\n    </div>\n    <div id="'),__append(idPrefix),__append('-suggestion-list" class="dashboard-metricsAndList-list"></div>\n  </div>\n</div>\n');return __output.join("")}});