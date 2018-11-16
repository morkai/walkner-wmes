define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-default">\n  <div class="panel-heading">'),__append(helpers.t("PANEL:TITLE:observations")),__append('</div>\n  <table class="table table-bordered table-hover behaviorObsCards-details-observations">\n    <thead>\n    <tr>\n      <th class="is-min">'),__append(helpers.t("PROPERTY:observations:category")),__append('</th>\n      <th class="is-min text-center">\n        '),__append(helpers.t("PROPERTY:observations:safe:true")),__append("\n        /<br>\n        "),__append(helpers.t("PROPERTY:observations:safe:false")),__append("\n      </th>\n      <th>"),__append(helpers.t("PROPERTY:observations:observation")),__append("</th>\n      <th>"),__append(helpers.t("PROPERTY:observations:cause")),__append('</th>\n      <th class="is-min text-center">\n        '),__append(helpers.t("PROPERTY:observations:easy:true")),__append("\n        /<br>\n        "),__append(helpers.t("PROPERTY:observations:easy:false")),__append("\n      </th>\n    </tr>\n    </thead>\n    <tbody>\n    "),model.observations.forEach(function(e){__append('\n    <tr>\n      <td class="is-min">'),__append(escapeFn(e.behavior)),__append('</td>\n      <td class="is-min text-center">'),__append(helpers.t("PROPERTY:observations:safe:"+e.safe)),__append('</td>\n      <td class="text-lines">'),__append(escapeFn(e.safe?"":e.observation)),__append('</td>\n      <td class="text-lines">'),__append(escapeFn(e.safe?"":e.cause)),__append('</td>\n      <td class="is-min text-center">'),__append(e.safe?"":helpers.t("PROPERTY:observations:easy:"+e.easy)),__append("</td>\n    </tr>\n    ")}),__append("\n    </tbody>\n  </table>\n</div>\n");return __output.join("")}});