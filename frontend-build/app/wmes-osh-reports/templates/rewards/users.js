define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<div class="list is-colored">\n<div class="table-responsive">\n  <table class="table table-bordered table-condensed table-hover">\n    <thead>\n    <tr>\n      <th class="is-min" rowspan="2">'),__append(t("rewards:employee")),__append('</th>\n      <th class="is-min text-center" colspan="'),__append(metrics.length),__append('">'),__append(t("rewards:count")),__append('</th>\n      <th class="is-min text-center" colspan="'),__append(metrics.length),__append('">'),__append(t("rewards:amount")),__append('</th>\n      <th class="is-min" rowspan="2">'),__append(t("rewards:lastCreatedAt")),__append('</th>\n      <th class="is-min" rowspan="2">'),__append(t("rewards:lastPaidAt")),__append('</th>\n      <th rowspan="2"></th>\n    </tr>\n    <tr>\n      '),metrics.forEach(n=>{__append('\n      <th class="is-min text-center">'),__append(t(`rewards:${n}`)),__append("</th>\n      ")}),__append("\n      "),metrics.forEach(n=>{__append('\n      <th class="is-min text-center">'),__append(t(`rewards:${n}`)),__append("</th>\n      ")}),__append("\n    </tr>\n    </thead>\n    <tbody>\n      "),loading?(__append('\n      <tr>\n        <td colspan="'),__append(1+2*metrics.length+3),__append('"><i class="fa fa-spinner fa-spin"></i></td>\n      </tr>\n      ')):(__append("\n      "),rows.length||(__append('\n      <tr>\n        <td colspan="'),__append(1+2*metrics.length+3),__append('">'),__append(t("core","LIST:NO_DATA")),__append("</td>\n      </tr>\n      ")),__append("\n      "),rows.forEach(n=>{__append('\n      <tr class="'),__append(n.payout[1]>=minPayout?"success":""),__append('">\n        <td class="is-min">'),__append(n.userInfo),__append("</td>\n        "),metrics.forEach(e=>{__append('\n        <td class="is-min is-number">'),__append(n[e][0].toLocaleString()),__append("</td>\n        ")}),__append("\n        "),metrics.forEach(e=>{__append('\n        <td class="is-min is-number">'),__append(currencyFormatter.format(n[e][1])),__append("</td>\n        ")}),__append('\n        <td class="is-min">'),__append(n.lastCreatedAt?time.format(n.lastCreatedAt,"LLLL"):""),__append('</td>\n        <td class="is-min">'),__append(n.lastPaidAt?time.format(n.lastPaidAt,"LLLL"):""),__append("</td>\n        <td></td>\n      </tr>\n      ")}),__append("\n      ")),__append("\n    </tbody>\n  </table>\n</div>\n</div>\n");return __output}});