define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escape=escape||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="orderDocumentTree-folderSelector" data-parent-folder-id="'),__append(parentFolderId),__append('">\n  '),folders.forEach(function(e){__append('\n  <div class="orderDocumentTree-folderSelector-item" data-folder-id="'),__append(e.id),__append('">'),__append(escape(e.label)),__append("</div>\n  ")}),__append("\n</div>\n");return __output.join("")}});