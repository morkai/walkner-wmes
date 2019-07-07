define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="orderDocumentTree-files is-'),__append(displayMode),__append(" "),__append(folders.length?"has-folders":"has-no-folders"),__append('">\n  <div id="'),__append(idPrefix),__append('-folders" class="orderDocumentTree-files-items">\n    '),folders.forEach(function(e){__append("\n    "),function(){__append('<div class="orderDocumentTree-files-item orderDocumentTree-files-folder" data-id="'),__append(e.id),__append('">\n  <span class="orderDocumentTree-files-icon"><i class="fa '),__append(e.icon),__append('"></i></span>\n  <span class="orderDocumentTree-files-label">'),__append(escapeFn(e.label)),__append("</span></span>\n</div>\n")}.call(this),__append("\n    ")}),__append('\n  </div>\n  <div id="'),__append(idPrefix),__append('-files" class="orderDocumentTree-files-items">\n    '),0===files.length&&0===folders.length&&(__append("\n    <p>"),__append(helpers.t("files:"+(searchPhrase?"noResults":"empty"))),__append("</p>\n    ")),__append("\n    "),files.forEach(function(e){__append("\n    "),function(){__append('<div class="orderDocumentTree-files-item orderDocumentTree-files-file '),__append(e.selected?"is-selected":""),__append(" "),__append(e.marked?"is-marked":""),__append('" '),e.id&&(__append('data-id="'),__append(e.id),__append('"')),__append('>\n  <span class="orderDocumentTree-files-icon"><i class="fa '),__append(e.icon||"fa-file-o"),__append('"></i></span>\n  <span class="orderDocumentTree-files-label"><span class="orderDocumentTree-files-label-text">'),__append(e.text),__append('</span><span class="orderDocumentTree-files-label-smallText">'),__append(escapeFn(e.smallText)),__append("</span></span>\n  "),e.id&&(__append('\n  <span class="orderDocumentTree-files-files">\n    '),_.forEach(e.files,function(n,p){__append("\n    "),p<6&&(__append('\n    <a href="/orderDocuments/'),__append(e.id),__append("?pdf=1&hash="),__append(n.hash),__append('" target="_blank" data-file-id="'),__append(e.id),__append('" data-hash="'),__append(n.hash),__append('" title="'),__append(escapeFn(n.title)),__append('">'),__append(n.date),__append("</a>\n    ")),__append("\n    ")}),__append("\n  </span>\n  ")),__append("\n</div>\n")}.call(this),__append("\n    ")}),__append('\n  </div>\n  <div id="'),__append(idPrefix),__append('-preview" class="orderDocumentTree-files-preview hidden">\n    <div class="orderDocumentTree-files-preview-actions">\n      <i class="fa fa-3x fa-file-o"></i>\n      '),user.isAllowedTo("USER","DOCUMENTS:VIEW")&&(__append('\n      <button id="'),__append(idPrefix),__append('-subFile" class="btn btn-default" disabled><i class="fa"></i></button>\n      ')),__append("\n      "),user.isAllowedTo("DOCUMENTS:MANAGE")&&(__append('\n      <button id="'),__append(idPrefix),__append('-recoverFile" class="btn btn-default" data-action="recoverFile" title="'),__append(helpers.t("files:recover")),__append('"><i class="fa fa-undo"></i></button>\n      <button id="'),__append(idPrefix),__append('-editFile" class="btn btn-default" data-action="editFile" title="'),__append(helpers.t("files:edit")),__append('"><i class="fa fa-edit"></i></button>\n      <button id="'),__append(idPrefix),__append('-removeFile" class="btn btn-default" data-action="removeFile" title="'),__append(helpers.t("files:remove")),__append('"><i class="fa fa-trash-o"></i></button>\n      ')),__append('\n    </div>\n    <dl class="orderDocumentTree-files-preview-props">\n      '),["nc15","name","folders","files"].forEach(function(e){__append("\n      <dt>"),__append(helpers.t("files:"+e)),__append('</dt>\n      <dd data-prop="'),__append(e),__append('"></dd>\n      ')}),__append("\n      "),user.isAllowedTo("DOCUMENTS:VIEW")?(__append('\n      <dt><a id="'),__append(idPrefix),__append('-showChanges" href="javascript:void(0)">'),__append(helpers.t("files:updatedAt")),__append("</a></dt>\n      ")):(__append("\n      <dt>"),__append(helpers.t("files:updatedAt")),__append("</dt>\n      ")),__append('\n      <dd data-prop="updatedAt"></dd>\n    </dl>\n    <i id="'),__append(idPrefix),__append('-closePreview" class="fa fa-remove" title="'),__append(helpers.t("files:close")),__append('"></i>\n  </div>\n</div>\n');return __output.join("")}});