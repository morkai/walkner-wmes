define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<form class="orderDocuments-settings" autocomplete="off">\n  <div class="message message-inline message-warning">'),__output.push(t("orderDocuments","settings:msg:localServer:checking")),__output.push('</div>\n  <div class="message message-inline message-success hidden">'),__output.push(t("orderDocuments","settings:msg:localServer:success")),__output.push('</div>\n  <div class="message message-inline message-error hidden">'),__output.push(t("orderDocuments","settings:msg:localServer:failure")),__output.push('</div>\n  <input name="fake-login" type="text" style="display: none">\n  <input name="fake-password" type="password" style="display: none">\n  <div class="form-group" title="'),__output.push(t("orderDocuments","settings:prodLineId:help")),__output.push('">\n    <label for="'),__output.push(idPrefix),__output.push('-prodLineId" class="control-label is-required">'),__output.push(t("orderDocuments","settings:prodLineId")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-prodLineId" name="prodLineId" class="form-control" type="text" required>\n  </div>\n  <div class="form-group" title="'),__output.push(t("orderDocuments","settings:prodLineName:help")),__output.push('">\n    <label for="'),__output.push(idPrefix),__output.push('-prodLineName" class="control-label is-required">'),__output.push(t("orderDocuments","settings:prodLineName")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-prodLineName" name="prodLineName" class="form-control" type="text" required>\n  </div>\n  <div class="form-group">\n    <div class="radio">\n      <label class="control-label">\n        <input name="prefixFilterMode" type="radio" value="inclusive">\n        '),__output.push(t("orderDocuments","settings:prefixFilter:inclusive")),__output.push('\n      </label>\n    </div>\n    <div class="radio">\n      <label class="control-label">\n        <input name="prefixFilterMode" type="radio" value="exclusive">\n        '),__output.push(t("orderDocuments","settings:prefixFilter:exclusive")),__output.push('\n      </label>\n    </div>\n    <input id="'),__output.push(idPrefix),__output.push('-prefixFilter" name="prefixFilter" class="form-control" type="text">\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-localServerUrl" class="control-label">'),__output.push(t("orderDocuments","settings:localServerUrl")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-localServerUrl" name="localServerUrl" class="form-control" type="url">\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-localServerPath" class="control-label">'),__output.push(t("orderDocuments","settings:localServerPath")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-localServerPath" name="localServerPath" class="form-control" type="text">\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-login" class="control-label is-required">'),__output.push(t("orderDocuments","settings:login")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-login" name="login" class="form-control" type="text" required>\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-password" class="control-label is-required">'),__output.push(t("orderDocuments","settings:password")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-password" name="password" class="form-control" type="password" required>\n  </div>\n  <div class="form-actions">\n    <button id="'),__output.push(idPrefix),__output.push('-submit" class="btn btn-primary" type="submit"><i class="fa fa-save"></i><span>'),__output.push(t("orderDocuments","settings:submit")),__output.push("</span></button>\n  </div>\n</form>\n");return __output.join("")}});