define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<div class="table-responsive">\n  <table class="table table-bordered table-hover osh-report-observers-orgUnits">\n    <thead>\n    <tr>\n      <th class="is-min">'),__append(t("wmes-osh-common","orgUnit:division")),__append('</th>\n      <th class="is-min">'),__append(t("wmes-osh-common","orgUnit:workplace")),__append('</th>\n      <th class="is-min">'),__append(t("wmes-osh-common","orgUnit:department")),__append('</th>\n      <th class="is-min">'),__append(t("engagement:employed")),__append('</th>\n      <th class="is-min">'),__append(t("engagement:engaged")),__append('</th>\n      <th class="is-min text-center" title="'),__append(t("engagement:engagedPercent")),__append('">%</th>\n      <th class="is-min">'),__append(t("engagement:nearMisses:title")),__append('</th>\n      <th class="is-min">'),__append(t("engagement:kaizens:title")),__append('</th>\n      <th class="is-min">'),__append(t("engagement:actions:title")),__append('</th>\n      <th class="is-min">'),__append(t("engagement:observations:title")),__append("</th>\n      <th></th>\n    </tr>\n    </thead>\n    <tbody>\n    "),rows.forEach(e=>{__append("\n      <tr>\n        "),"division"===e.type?(__append('\n          <td class="is-min" rowspan="'),__append(e.children),__append('">'),__append(escapeFn(e.division)),__append('</td>\n          <td class="is-min"></td>\n          <td class="is-min"></td>\n        ')):"workplace"===e.type?(__append('\n          <td class="is-min" rowspan="'),__append(e.children),__append('">'),__append(escapeFn(e.workplace)),__append('</td>\n          <td class="is-min"></td>\n        ')):"department"===e.type?(__append('\n          <td class="is-min">'),__append(escapeFn(e.department)),__append("</td>\n        ")):"unknown"===e.type?__append('\n          <td class="is-min">?</td>\n          <td class="is-min">?</td>\n          <td class="is-min">?</td>\n        '):(__append('\n          <td class="is-min text-right" colspan="3">'),__append(t("engagement:total")),__append("</td>\n        ")),__append('\n        <td class="is-min is-number">'),__append(n(e.employed)),__append('</td>\n        <td class="is-min is-number">'),__append(n(e.engaged)),__append('</td>\n        <td class="is-min is-number '),__append(e.engagedInvalid?"is-invalid":""),__append('">\n          '),e.engagedPercent>=0&&(__append("\n          "),__append(n(e.engagedPercent)),__append("%\n          ")),__append('\n        </td>\n        <td class="is-min is-number">'),__append(n(e.metrics[0])),__append('</td>\n        <td class="is-min is-number">'),__append(n(e.metrics[1])),__append('</td>\n        <td class="is-min is-number">'),__append(n(e.metrics[2])),__append('</td>\n        <td class="is-min is-number">'),__append(n(e.metrics[3])),__append("</td>\n        <td></td>\n      </tr>\n    ")}),__append("\n    </tbody>\n  </table>\n</div>\n");return __output}});