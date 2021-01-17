define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<div class="table-responsive is-colored">\n  <table class="table table-bordered table-hover osh-report-engagement-users">\n    <thead>\n    <tr>\n      <th rowspan="2">'),__append(t("engagement:employee")),__append("</th>\n      "),months.forEach(e=>{__append('\n        <th colspan="7">'),__append(time.format(e,"MMMM YYYY")),__append("</th>\n      ")}),__append('\n      <th rowspan="2"></th>\n    </tr>\n    <tr>\n      '),months.forEach(e=>{__append('\n        <th class="osh-report-engagement-metric" data-metric="nearMisses">'),__append(t("engagement:nearMisses:header")),__append('</th>\n        <th class="osh-report-engagement-separator">/</th>\n        <th class="osh-report-engagement-metric" data-metric="kaizens">'),__append(t("engagement:kaizens:header")),__append('</th>\n        <th class="osh-report-engagement-separator">/</th>\n        <th class="osh-report-engagement-metric" data-metric="actions">'),__append(t("engagement:actions:header")),__append('</th>\n        <th class="osh-report-engagement-separator">/</th>\n        <th class="osh-report-engagement-metric" data-metric="observations">'),__append(t("engagement:observations:header")),__append("</th>\n      ")}),__append("\n    </tr>\n    </thead>\n    <tbody>\n    "),users.forEach((e,n)=>{__append('\n      <tr data-i="'),__append(n),__append('" data-id="'),__append(e.id),__append('">\n        <td>'),__append(e.info),__append("</td>\n        "),months.forEach(n=>{__append("\n          ");let a=e.months[n]?"":"danger";__append("\n          ");let t=e.months[n]||empty;__append('\n          <td class="osh-report-engagement-metric '),__append(a),__append('" data-month="'),__append(n),__append('" data-metric="nearMisses">'),__append(t[0].toLocaleString()),__append('</td>\n          <td class="osh-report-engagement-separator '),__append(a),__append('">/</td>\n          <td class="osh-report-engagement-metric '),__append(a),__append('" data-month="'),__append(n),__append('" data-metric="kaizens">'),__append(t[1].toLocaleString()),__append('</td>\n          <td class="osh-report-engagement-separator '),__append(a),__append('">/</td>\n          <td class="osh-report-engagement-metric '),__append(a),__append('" data-month="'),__append(n),__append('" data-metric="actions">'),__append(t[2].toLocaleString()),__append('</td>\n          <td class="osh-report-engagement-separator '),__append(a),__append('">/</td>\n          <td class="osh-report-engagement-metric '),__append(a),__append('" data-month="'),__append(n),__append('" data-metric="observations">'),__append(t[3].toLocaleString()),__append("</td>\n        ")}),__append("\n        <td></td>\n      </tr>\n    ")}),__append("\n    </tbody>\n  </table>\n</div>\n");return __output}});