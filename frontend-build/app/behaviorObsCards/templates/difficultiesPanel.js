define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-warning">\n  <div class="panel-heading is-with-actions">\n    '),__append(helpers.t("PANEL:TITLE:difficulties")),__append("\n    "),model.suggestion&&(__append('\n    <div class="panel-actions">\n      <p>'),__append(helpers.t("PANEL:ACTION:suggestion")),__append(' <a href="#suggestions/'),__append(model.suggestion),__append('">#'),__append(model.suggestion),__append("</a></p>\n    </div>\n    ")),__append('\n  </div>\n  <div class="table-responsive">\n    <table class="table table-bordered table-hover behaviorObsCards-details-difficulties">\n      '),model.difficulties.length&&(__append("\n      <thead>\n      <tr>\n        <th>"),__append(helpers.t("PROPERTY:difficulties:problem")),__append("</th>\n        <th>"),__append(helpers.t("PROPERTY:difficulties:solution")),__append('</th>\n        <th class="is-min text-center">\n          '),__append(helpers.t("PROPERTY:difficulties:behavior:true")),__append("\n          /<br>\n          "),__append(helpers.t("PROPERTY:difficulties:behavior:false")),__append("\n        </th>\n      </tr>\n      </thead>\n      ")),__append("\n      <tbody>\n      "),model.difficulties.length||(__append('\n      <tr>\n        <td colspan="3">'),__append(t("core","LIST:NO_DATA")),__append("</td>\n      </tr>\n      ")),__append("\n      "),model.difficulties.forEach(function(e){__append('\n      <tr>\n        <td class="text-lines">'),__append(escapeFn(e.problem)),__append('</td>\n        <td class="text-lines">'),__append(escapeFn(e.solution)),__append('</td>\n        <td class="is-min text-center">'),__append(helpers.t("PROPERTY:difficulties:behavior:"+e.behavior)),__append("</td>\n      </tr>\n      ")}),__append("\n      </tbody>\n    </table>\n  </div>\n</div>\n");return __output.join("")}});