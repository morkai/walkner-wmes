define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<div class="table-responsive">\n  <table class="table table-bordered table-hover osh-report-engagement-users">\n    <thead>\n    <tr>\n      <th rowspan="2">'),__append(t("engagement:leader")),__append("</th>\n      "),months.forEach(e=>{__append('\n        <th class="osh-report-engagement-group" colspan="7">'),__append(time.utc.format(e,"MMMM YYYY")),__append("</th>\n      ")}),__append('\n      <th rowspan="2"></th>\n    </tr>\n    <tr>\n      '),months.forEach(e=>{__append('\n        <th class="osh-report-engagement-metric osh-report-engagement-group" title="'),__append(t("engagement:members:title")),__append('">'),__append(t("engagement:members:header")),__append('</th>\n        <th class="osh-report-engagement-metric" title="'),__append(t("engagement:active:title")),__append('">'),__append(t("engagement:active:header")),__append('</th>\n        <th class="osh-report-engagement-metric" title="'),__append(t("engagement:activePercent:title")),__append('">'),__append(t("engagement:activePercent:header")),__append('</th>\n        <th class="osh-report-engagement-metric" title="'),__append(t("engagement:nearMisses:title")),__append('">'),__append(t("engagement:nearMisses:header")),__append('</th>\n        <th class="osh-report-engagement-metric" title="'),__append(t("engagement:kaizens:title")),__append('">'),__append(t("engagement:kaizens:header")),__append('</th>\n        <th class="osh-report-engagement-metric" title="'),__append(t("engagement:actions:title")),__append('">'),__append(t("engagement:actions:header")),__append('</th>\n        <th class="osh-report-engagement-metric" title="'),__append(t("engagement:observations:title")),__append('">'),__append(t("engagement:observations:header")),__append("</th>\n      ")}),__append("\n    </tr>\n    </thead>\n    <tbody>\n    "),brigades.forEach((e,n)=>{__append("\n      <tr>\n        <td>"),__append(e.info),__append("</td>\n        "),months.forEach(n=>{__append("\n          ");let t=e.months[n]||empty;__append('\n          <td class="osh-report-engagement-metric osh-report-engagement-group">'),__append(t.members.length.toLocaleString()),__append('</td>\n          <td class="osh-report-engagement-metric">'),__append(t.active.toLocaleString()),__append('</td>\n          <td class="osh-report-engagement-metric '),__append(t.active<t.members.length?"":"is-invalid"),__append('">\n            '),__append(t.members.length?`${Math.round(t.active/t.members.length*100).toLocaleString()}%`:"0%"),__append('\n          </td>\n          <td class="osh-report-engagement-metric '),__append(t.metrics[0]?"":"is-invalid"),__append('">'),__append(t.metrics[0].toLocaleString()),__append('</td>\n          <td class="osh-report-engagement-metric '),__append(t.metrics[1]?"":"is-invalid"),__append('">'),__append(t.metrics[1].toLocaleString()),__append('</td>\n          <td class="osh-report-engagement-metric '),__append(t.metrics[2]?"":"is-invalid"),__append('">'),__append(t.metrics[2].toLocaleString()),__append('</td>\n          <td class="osh-report-engagement-metric '),__append(t.metrics[3]?"":"is-invalid"),__append('">'),__append(t.metrics[3].toLocaleString()),__append("</td>\n        ")}),__append("\n        <td></td>\n      </tr>\n    ")}),__append("\n    </tbody>\n  </table>\n</div>\n");return __output}});