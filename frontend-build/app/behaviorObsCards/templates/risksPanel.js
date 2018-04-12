define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-danger">\n  <div class="panel-heading is-with-actions">\n    '),__append(t("behaviorObsCards","PANEL:TITLE:risks")),__append("\n    "),model.nearMiss&&(__append('\n    <div class="panel-actions">\n      <p>'),__append(t("behaviorObsCards","PANEL:ACTION:nearMiss")),__append(' <a href="#kaizenOrders/'),__append(model.nearMiss),__append('">#'),__append(model.nearMiss),__append("</a></p>\n    </div>\n    ")),__append('\n  </div>\n  <table class="table table-bordered table-hover behaviorObsCards-details-risks">\n    '),model.risks.length&&(__append("\n    <thead>\n    <tr>\n      <th>"),__append(t("behaviorObsCards","PROPERTY:risks:risk")),__append("</th>\n      <th>"),__append(t("behaviorObsCards","PROPERTY:risks:cause")),__append('</th>\n      <th class="is-min text-center">\n        '),__append(t("behaviorObsCards","PROPERTY:risks:easy:true")),__append("\n        /<br>\n        "),__append(t("behaviorObsCards","PROPERTY:risks:easy:false")),__append("\n      </th>\n    </tr>\n    </thead>\n    ")),__append("\n    <tbody>\n    "),model.risks.length||(__append('\n    <tr>\n      <td colspan="3">'),__append(t("core","LIST:NO_DATA")),__append("</td>\n    </tr>\n    ")),__append("\n    "),model.risks.forEach(function(n){__append('\n    <tr>\n      <td class="text-lines">'),__append(escapeFn(n.risk)),__append('</td>\n      <td class="text-lines">'),__append(escapeFn(n.cause)),__append('</td>\n      <td class="is-min text-center">'),__append(t("behaviorObsCards","PROPERTY:risks:easy:"+n.easy)),__append("</td>\n    </tr>\n    ")}),__append("\n    </tbody>\n  </table>\n</div>\n");return __output.join("")}});