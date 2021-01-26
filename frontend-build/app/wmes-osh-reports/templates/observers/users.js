define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<div class="table-responsive">\n  <table class="table table-bordered table-hover osh-report-observers-users">\n    <thead>\n    <tr>\n      <th rowspan="2">'),__append(t("observers:observer")),__append("</th>\n      "),months.forEach(e=>{__append('\n        <th class="osh-report-engagement-group" colspan="6">'),__append(time.format(e,"MMMM YYYY")),__append("</th>\n      ")}),__append('\n      <th rowspan="2"></th>\n    </tr>\n    <tr>\n      '),months.forEach(e=>{__append('\n        <th class="osh-report-observers-metric osh-report-observers-group" title="'),__append(t("observers:cards:title")),__append('">'),__append(t("observers:cards:header")),__append('</th>\n        <th class="osh-report-observers-metric" title="'),__append(t("observers:observations:title")),__append('">'),__append(t("observers:observations:header")),__append('</th>\n        <th class="osh-report-observers-metric" title="'),__append(t("observers:safe:title")),__append('">'),__append(t("observers:safe:header")),__append('</th>\n        <th class="osh-report-observers-metric" title="'),__append(t("observers:risky:title")),__append('">'),__append(t("observers:risky:header")),__append('</th>\n        <th class="osh-report-observers-metric" title="'),__append(t("observers:easy:title")),__append('">'),__append(t("observers:easy:header")),__append('</th>\n        <th class="osh-report-observers-metric" title="'),__append(t("observers:hard:title")),__append('">'),__append(t("observers:hard:header")),__append("</th>\n      ")}),__append("\n    </tr>\n    </thead>\n    <tbody>\n    "),users.forEach((e,r)=>{__append("\n      <tr>\n        <td>"),__append(e.info),__append("</td>\n        "),months.forEach(r=>{__append("\n          ");let t=e.months[r]||empty;__append('\n          <td class="osh-report-observers-metric osh-report-observers-group '),__append(t[0]<settings.minObsCards?"is-invalid":""),__append('">'),__append(t[0].toLocaleString()),__append('</td>\n          <td class="osh-report-observers-metric">'),__append(t[1].toLocaleString()),__append('</td>\n          <td class="osh-report-observers-metric">'),__append(t[3].toLocaleString()),__append('</td>\n          <td class="osh-report-observers-metric">'),__append((t[4]+t[7]).toLocaleString()),__append('</td>\n          <td class="osh-report-observers-metric">'),__append((t[5]+t[8]).toLocaleString()),__append('</td>\n          <td class="osh-report-observers-metric">'),__append((t[6]+t[9]).toLocaleString()),__append("</td>\n        ")}),__append("\n        <td></td>\n      </tr>\n    ")}),__append("\n    </tbody>\n  </table>\n</div>\n");return __output}});