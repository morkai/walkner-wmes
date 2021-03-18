define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<div class="osh-report-dataTable">\n  '),loading?__append('\n  <p><i class="fa fa-spinner fa-spin"></i></p>\n  '):(__append('\n  <table class="dataTable-padded cell-border">\n    <thead>\n    <tr>\n      <th class="is-min is-max-rowspan" rowspan="2">'),__append(t("engagement:leader")),__append("</th>\n      "),months.forEach((e,n)=>{__append('\n      <th class="text-center '),__append(n%2==1?"is-odd":"is-even"),__append('" colspan="7">'),__append(time.utc.format(e,"MMMM YYYY")),__append("</th>\n      ")}),__append('\n      <th class="is-max-rowspan is-last" rowspan="2"></th>\n    </tr>\n    <tr>\n      '),months.forEach((e,n)=>{__append("\n      ");var p=n%2==1?"is-odd":"is-even";__append("\n      "),["members","active","activePercent","nearMisses","kaizens","actions","observations"].forEach((e,n)=>{__append('\n      <th class="osh-report-dataTable-metric '),__append(p),__append('" title="'),__append(t(`engagement:${e}:title`)),__append('">'),__append(t(`engagement:${e}:header`)),__append("</th>\n      ")}),__append("\n      ")}),__append("\n    </tr>\n    </thead>\n    <tbody>\n      "),rows.forEach(e=>{__append('\n      <tr>\n        <td class="is-min">'),__append(e.userLabel),__append("</td>\n        "),e.months.forEach((e,p)=>{__append("\n        ");var a=p%2==1?"is-odd":"is-even";__append('\n        <td class="osh-report-dataTable-metric '),__append(a),__append(" "),__append(e.members.length?"":"is-zero"),__append('">'),__append(n(e.members.length)),__append('</td>\n        <td class="osh-report-dataTable-metric '),__append(a),__append(" "),__append(e.active?"":"is-zero"),__append('">'),__append(n(e.active)),__append('</td>\n        <td class="osh-report-dataTable-metric '),__append(a),__append(" "),__append(0===e.members.length?"is-zero":e.active<e.members.length?"is-invalid":""),__append('">\n          '),__append(e.members.length?n(Math.round(e.active/e.members.length*100)):"0"),__append('%\n        </td>\n        <td class="osh-report-dataTable-metric '),__append(a),__append(" "),__append(e.metrics[0]?"":"is-zero"),__append('">'),__append(n(e.metrics[0])),__append('</td>\n        <td class="osh-report-dataTable-metric '),__append(a),__append(" "),__append(e.metrics[1]?"":"is-zero"),__append('">'),__append(n(e.metrics[1])),__append('</td>\n        <td class="osh-report-dataTable-metric '),__append(a),__append(" "),__append(e.metrics[2]?"":"is-zero"),__append('">'),__append(n(e.metrics[2])),__append('</td>\n        <td class="osh-report-dataTable-metric '),__append(a),__append(" "),__append(e.metrics[3]?"":"is-zero"),__append('">'),__append(n(e.metrics[3])),__append("</td>\n        ")}),__append('\n        <td class="is-last"></td>\n      </tr>\n      ')}),__append("\n    </tbody>\n  </table>\n  ")),__append("\n</div>\n");return __output}});