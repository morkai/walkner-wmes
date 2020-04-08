define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form class="orderDocumentTree-editFile" method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(escapeFn(formMethod)),__append('">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-nc15" class="control-label">'),__append(t("files:nc15")),__append('</label>\n    <p class="form-control-static">'),__append(escapeFn(model._id)),__append('</p>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-name" class="control-label">'),__append(t("files:name")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-name" name="name" class="form-control" type="text" autocomplete="new-password" required autofocus>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-folders" class="control-label">'),__append(t("files:folders")),__append("</label>\n    "),folders.forEach(function(e){__append('\n    <div class="checkbox">\n      <label>\n        <input type="checkbox" name="folders[]" value="'),__append(e.id),__append('"> '),__append(escapeFn(e.path)),__append("\n      </label>\n    </div>\n    ")}),__append('\n  </div>\n  <div class="form-group" style="position: relative">\n    <label for="'),__append(idPrefix),__append('-components" class="control-label" style="display: flex">\n      <span title="'),__append(t("files:components:help")),__append('">\n        '),__append(t("files:components")),__append('\n        <i class="fa fa-question-circle"></i>\n      </span>\n      <a id="'),__append(idPrefix),__append('-components-addByName-toggle" href="javascript:void(0)" style="margin-left: auto">'),__append(t("files:components:addByName")),__append('</a>\n    </label>\n    <input id="'),__append(idPrefix),__append('-components" name="components" type="text">\n    <div id="'),__append(idPrefix),__append('-components-addByName" class="hidden" style="position: absolute; top: 0; right: 0; width: 200px; display: flex; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5)">\n      <input type="text" class="form-control" placeholder="'),__append(t("files:components:addByName:placeholder")),__append('" style="flex: 1 1 auto">\n      <button type="button" class="btn btn-default" style="flex: 0; margin-left: -1px"><i class="fa fa-plus"></i></button>\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-stations" class="control-label">'),__append(t("files:stations")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-stations" name="stations" class="form-control" type="text" autocomplete="new-password" placeholder="1, 2, 3, 4, 5, 6, 7">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-folders" class="control-label">'),__append(t("files:files")),__append("</label>\n    "),files.forEach(function(e,n){__append('\n    <div class="checkbox">\n      <label>\n        <input class="orderDocumentTree-editFile-checkbox" type="checkbox" name="files['),__append(n),__append('].hash" value="'),__append(e.hash),__append('">\n        <input type="hidden" name="files['),__append(n),__append('].type" value="application/pdf">\n        <input type="date" name="files['),__append(n),__append('].date" class="form-control" required min="2000-01-01" max="'),__append(time.getMoment().startOf("day").add(1,"year").format("YYYY-MM-DD")),__append('">\n      </label>\n      <a class="btn btn-default" href="/orderDocuments/'),__append(model._id),__append("?original=1&hash="),__append(e.hash),__append('" target="_blank" title="'),__append(t("editFile:openFile:original")),__append('"><i class="fa '),__append(e.icon),__append('"></i></a>\n      <a class="btn btn-default '),__append("pdf"===e.ext?"":"disabled"),__append('" href="/orderDocuments/'),__append(model._id),__append("?hash="),__append(e.hash),__append('" target="_blank" title="'),__append(t("editFile:openFile:img")),__append('"><i class="fa fa-file-image-o"></i></a>\n      <button data-action="forceConvert" data-hash="'),__append(e.hash),__append('" class="btn btn-default" type="button" '),__append("pdf"===e.ext?"":"disabled"),__append(' title="'),__append(t("editFile:forceConvert")),__append('"><i class="fa fa-wrench"></i></button>\n      '),e.updatedAt&&e.updater&&(__append('\n      <span style="margin-left: 10px; line-height: 34px; vertical-align: middle">\n        <i class="fa fa-clock-o"></i><span style="margin-right: 10px">'),__append(time.format(e.updatedAt,"D.M.YYYY HH:mm")),__append('</span>\n        <i class="fa fa-user"></i><span>'),__append(escapeFn(e.updater.label)),__append("</span>\n      </span>\n      ")),__append("\n    </div>\n    ")}),__append('\n  </div>\n  <div class="form-actions">\n    <button class="btn btn-primary" type="submit">'),__append(t("editFile:submit")),__append('</button>\n    <button class="btn btn-link cancel" type="button">'),__append(t("editFile:cancel")),__append("</button>\n  </div>\n</form>\n");return __output}});