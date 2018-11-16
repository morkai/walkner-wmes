define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(a){return _ENCODE_HTML_RULES[a]||a}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="dashboard-buttonAndMetrics">\n  <a class="btn btn-'),__append(buttonType),__append('" href="'),__append(buttonUrl),__append('">'),__append(buttonLabel),__append('</a>\n  <div class="dashboard-metrics">\n    <a class="well dashboard-metric" href="'),__append(browseUrl),__append('">\n      <span class="dashboard-metric-value">'),__append(total?total.allCount:"?"),__append('</span>\n      <span class="dashboard-metric-name">'),__append(t("dashboard","metrics:total:allCount")),__append('</span>\n    </a>\n    <a class="well dashboard-metric" href="'),__append(browseUrl),__append("?status=in=(new,accepted,todo,inProgress,paused)&sort(-"),__append(sortProperty),__append(')&limit(20)">\n      <span class="dashboard-metric-value">'),__append(total?total.openCount:"?"),__append('</span>\n      <span class="dashboard-metric-name">'),__append(t("dashboard","metrics:total:openCount")),__append('</span>\n    </a>\n    <div class="well dashboard-metric">\n      <span class="dashboard-metric-value">'),__append(total?total.monthCount:"?"),__append('</span>\n      <span class="dashboard-metric-name">'),__append(t("dashboard","metrics:total:monthCount")),__append('</span>\n    </div>\n  </div>\n  <div class="dashboard-metrics">\n    <a class="well dashboard-metric" href="'),__append(browseUrl),__append('?observers.user.id=mine&sort(-eventDate)&limit(20)">\n      <span class="dashboard-metric-value">'),__append(user?user.allCount:"?"),__append('</span>\n      <span class="dashboard-metric-name">'),__append(t("dashboard","metrics:user:allCount")),__append('</span>\n    </a>\n    <a class="well dashboard-metric" href="'),__append(browseUrl),__append("?status=in=(new,accepted,todo,inProgress,paused)&sort(-"),__append(sortProperty),__append(')&limit(20)&observers.user.id=mine">\n      <span class="dashboard-metric-value">'),__append(user?user.openCount:"?"),__append('</span>\n      <span class="dashboard-metric-name">'),__append(t("dashboard","metrics:user:openCount")),__append('</span>\n    </a>\n    <div class="well dashboard-metric">\n      <span class="dashboard-metric-value">'),__append(user?user.monthCount:"?"),__append('</span>\n      <span class="dashboard-metric-name">'),__append(t("dashboard","metrics:user:monthCount")),__append("</span>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});