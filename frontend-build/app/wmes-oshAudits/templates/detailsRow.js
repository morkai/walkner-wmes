define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<tr class="oshAudits-list-details">\n  <td colspan="99">\n  '),function(){__append('<div class="panel panel-default">\n  <div class="panel-heading">'),__append(t("PROPERTY:results")),__append('</div>\n  <div class="table-responsive">\n    <table class="table table-bordered table-hover oshAudits-details-results">\n      <thead>\n      <tr>\n        <th class="is-min">'),__append(t("PROPERTY:results:category")),__append('</th>\n        <th class="is-min text-center">'),__append(t("PROPERTY:results:ok:true")),__append("/"),__append(t("PROPERTY:results:ok:false")),__append("</th>\n        <th>"),__append(t("PROPERTY:results:comment")),__append('</th>\n        <th class="is-min">'),__append(t("PROPERTY:results:owner")),__append("</th>\n      </tr>\n      </thead>\n      <tbody>\n      "),model.results.forEach(function(n){__append("\n      "),null!==n.ok&&(__append('\n      <tr>\n        <td class="is-min">'),__append(escapeFn(n.fullName)),__append('</td>\n        <td class="is-min text-center"><i class="fa '),__append(n.ok?"fa-check":"fa-times"),__append('"></i></td>\n        <td class="text-lines">'),__append(escapeFn(n.comment)),__append('</td>\n        <td class="is-min">'),__append(n.owner),__append("</td>\n      </tr>\n      "))}),__append("\n      </tbody>\n    </table>\n  </div>\n</div>\n")}.call(this),__append("\n  </td>\n</tr>\n");return __output}});