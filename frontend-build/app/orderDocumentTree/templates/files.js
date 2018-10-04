define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="orderDocumentTree-files is-'),__append(displayMode),__append(" "),__append(folders.length?"has-folders":"has-no-folders"),__append('">\n  <div id="'),__append(idPrefix),__append('-folders" class="orderDocumentTree-files-items">\n    '),folders.forEach(function(e){__append("\n    "),function(){__append('<div class="orderDocumentTree-files-item orderDocumentTree-files-folder" data-id="'),__append(e.id),__append('">\n  <span class="orderDocumentTree-files-icon"><i class="fa '),__append(e.icon),__append('"></i></span>\n  <span class="orderDocumentTree-files-label">'),__append(escapeFn(e.label)),__append("</span></span>\n</div>\n")}.call(this),__append("\n    ")}),__append('\n  </div>\n  <div id="'),__append(idPrefix),__append('-files" class="orderDocumentTree-files-items">\n    '),0===files.length&&0===folders.length&&(__append("\n    <p>"),__append(t("orderDocumentTree","files:"+(searchPhrase?"noResults":"empty"))),__append("</p>\n    ")),__append("\n    "),files.forEach(function(e){__append("\n    "),function(){__append('<div class="orderDocumentTree-files-item orderDocumentTree-files-file '),__append(e.selected?"is-selected":""),__append(" "),__append(e.marked?"is-marked":""),__append('" '),e.id&&(__append('data-id="'),__append(e.id),__append('"')),__append('>\n  <span class="orderDocumentTree-files-icon"><i class="fa '),__append(e.icon||"fa-file-o"),__append('"></i></span>\n  <span class="orderDocumentTree-files-label"><span class="orderDocumentTree-files-label-text">'),__append(e.text),__append('</span><span class="orderDocumentTree-files-label-smallText">'),__append(escapeFn(e.smallText)),__append("</span></span>\n  "),e.id&&(__append('\n  <span class="orderDocumentTree-files-files">\n    '),_.forEach(e.files,function(n,p){__append("\n    "),p<6&&(__append('\n    <a href="/orderDocuments/'),__append(e.id),__append("?pdf=1&hash="),__append(n.hash),__append('" target="_blank" data-file-id="'),__append(e.id),__append('" data-hash="'),__append(n.hash),__append('">'),__append(time.format(n.date,"L")),__append("</a>\n    ")),__append("\n    ")}),__append("\n  </span>\n  ")),__append("\n</div>\n")}.call(this),__append("\n    ")}),__append('\n  </div>\n  <div id="'),__append(idPrefix),__append('-preview" class="orderDocumentTree-files-preview hidden">\n    <div class="orderDocumentTree-files-preview-actions">\n      <i class="fa fa-3x fa-file-o"></i>\n      '),user.isAllowedTo("DOCUMENTS:MANAGE")&&(__append('\n      <button id="'),__append(idPrefix),__append('-recoverFile" class="btn btn-default" data-action="recoverFile" title="'),__append(t("orderDocumentTree","files:recover")),__append('"><i class="fa fa-undo"></i></button>\n      <button id="'),__append(idPrefix),__append('-editFile" class="btn btn-default" data-action="editFile" title="'),__append(t("orderDocumentTree","files:edit")),__append('"><i class="fa fa-edit"></i></button>\n      <button id="'),__append(idPrefix),__append('-removeFile" class="btn btn-default" data-action="removeFile" title="'),__append(t("orderDocumentTree","files:remove")),__append('"><i class="fa fa-trash-o"></i></button>\n      ')),__append('\n    </div>\n    <dl class="orderDocumentTree-files-preview-props">\n      '),["nc15","name","folders","files"].forEach(function(e){__append("\n      <dt>"),__append(t("orderDocumentTree","files:"+e)),__append('</dt>\n      <dd data-prop="'),__append(e),__append('"></dd>\n      ')}),__append('\n    </dl>\n    <i id="'),__append(idPrefix),__append('-closePreview" class="fa fa-remove" title="'),__append(t("orderDocumentTree","files:close")),__append('"></i>\n  </div>\n</div>\n');return __output.join("")}});