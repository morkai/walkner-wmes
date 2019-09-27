define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<table class="table table-bordered table-condensed table-hover suggestions-details-attachments">\n  <thead>\n    <tr>\n      <th class="is-min">'),__append(helpers.t("PROPERTY:attachments:description")),__append("</th>\n      <th>"),__append(helpers.t("PROPERTY:attachments:file")),__append('</th>\n      <th class="actions">'),__append(t("core","LIST:COLUMN:actions")),__append("</th>\n    </tr>\n  </thead>\n  <tbody>\n    "),model.attachments.length||(__append('\n    <tr>\n      <td colspan="3">'),__append(helpers.t("attachments:noData")),__append("</td>\n    </tr>\n    ")),__append("\n    "),model.attachments.forEach(function(n){__append('\n    <tr>\n      <td class="is-min">'),__append(escapeFn(t.has("suggestions","attachments:"+n.description)?helpers.t("attachments:"+n.description):n.description)),__append("</td>\n      <td>"),__append(escapeFn(n.name)),__append('</td>\n      <td class="actions">\n        <div class="actions-group">\n          <a class="btn btn-default" href="/suggestions/'),__append(model._id),__append("/attachments/"),__append(n._id),__append('" title="'),__append(helpers.t("attachments:actions:view")),__append('"><i class="fa fa-file-text-o"></i></a>\n          <a class="btn btn-default" href="/suggestions/'),__append(model._id),__append("/attachments/"),__append(n._id),__append('?download=1" title="'),__append(helpers.t("attachments:actions:download")),__append('"><i class="fa fa-download"></i></a>\n        </div>\n      </td>\n    </tr>\n    ')}),__append("\n  </tbody>\n</table>\n");return __output.join("")}});