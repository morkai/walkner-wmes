define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="action-form" method="post" action="/snf/programs/'),__append(programId),__append("/images/"),__append(image._id),__append("."),__append(image.type),__append('">\n  <input type="hidden" name="_method" value="put">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-label" class="control-label">'),__append(t("snf-programs","PROPERTY:images.label")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-label" class="form-control" type="text" required autofocus maxlength="150" value="'),__append(escapeFn(image.label)),__append('">\n  </div>\n  <div class="form-actions">\n    <button type="submit" class="btn btn-primary">'),__append(t("snf-programs","gallery:edit:submit")),__append('</button>\n    <button type="button" class="cancel btn btn-link">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});