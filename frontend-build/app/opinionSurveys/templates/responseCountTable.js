define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="panel panel-default">\n  <div class="panel-heading">'),__output.push(t("opinionSurveys","report:responseCount:title")),__output.push('</div>\n  <table class="table table-bordered table-condensed table-striped table-hover">\n    <thead>\n    <tr>\n      <th class="is-min">'),__output.push(t("opinionSurveys","report:responseCount:survey")),__output.push("</th>\n      "),_.forEach(columns,function(t){__output.push("\n      "),_.forEach(t,function(t){__output.push('\n      <th class="is-min" colspan="3">'),__output.push(escape(t)),__output.push("</th>\n      ")}),__output.push("\n      ")}),__output.push("\n      <th></th>\n    </tr>\n    </thead>\n    <tbody>\n    "),_.forEach(rows,function(t){__output.push('\n    <tr>\n      <td class="is-min">'),__output.push(escape(t.survey)),__output.push("</td>\n      "),_.forEach(columns,function(u,n){__output.push("\n      "),_.forEach(u,function(u,s){__output.push("\n      "),t[n]&&t[n][s]?(__output.push('\n      <td class="is-number is-min">'),__output.push(t[n][s].responseCount),__output.push('</td>\n      <td class="is-number is-min">'),__output.push(t[n][s].employeeCount),__output.push('</td>\n      <td class="is-number is-min"><strong>'),__output.push(t[n][s].percent),__output.push("%</strong></td>\n      ")):__output.push('\n      <td class="is-number is-min">0</td>\n      <td class="is-number is-min">0</td>\n      <td class="is-number is-min"><strong>0%</strong></td>\n      '),__output.push("\n      ")}),__output.push("\n      ")}),__output.push("\n      <td></td>\n    </tr>\n    ")}),__output.push("\n    </tbody>\n  </table>\n</div>\n");return __output.join("")}});