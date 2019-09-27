define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="production-orderQueue">\n  <p class="message message-inline message-info">'),__append(t("production","orderQueue:message:order")),__append('</p>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-order">'),__append(t("production","orderQueue:order:label")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-order" class="form-control" type="text" autocomplete="new-password" placeholder="'),__append(t("production","orderQueue:order:placeholder")),__append('" data-ignore-key="1">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-operation">'),__append(t("production","orderQueue:operation:label")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-operation" class="form-control" type="text" autocomplete="new-password" placeholder="'),__append(t("production","orderQueue:operation:placeholder")),__append('" maxlength="4" pattern="^[0-9]+$" data-ignore-key="1">\n  </div>\n  <div class="form-group">\n    <button id="'),__append(idPrefix),__append('-enqueue" type="button" class="btn btn-lg btn-default">'),__append(t("production","orderQueue:enqueue")),__append('</button>\n    <button id="'),__append(idPrefix),__append('-clear" type="button" class="btn btn-lg btn-link">'),__append(t("production","orderQueue:clear")),__append('</button>\n  </div>\n  <p id="'),__append(idPrefix),__append('-empty" class="message message-inline message-info">'),__append(t("production","orderQueue:message:empty")),__append('</p>\n  <div class="form-group hidden" id="'),__append(idPrefix),__append('-queue">\n    <table class="table table-condensed table-bordered table-hover">\n      <tbody id="'),__append(idPrefix),__append('-rows"></tbody>\n    </table>\n  </div>\n  <div class="form-actions">\n    <button id="'),__append(idPrefix),__append('-submit" type="button" class="btn btn-lg btn-primary">'),__append(t("production","orderQueue:submit")),__append('</button>\n    <button type="button" class="cancel btn btn-lg btn-link">'),__append(t("production","orderQueue:cancel")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});