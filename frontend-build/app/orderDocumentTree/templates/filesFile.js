define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="orderDocumentTree-files-item orderDocumentTree-files-file '),__append(file.selected?"is-selected":""),__append(" "),__append(file.marked?"is-marked":""),__append('" '),file.id&&(__append('data-id="'),__append(file.id),__append('"')),__append('>\n  <span class="orderDocumentTree-files-icon"><i class="fa '),__append(file.icon||"fa-file-o"),__append('"></i></span>\n  <span class="orderDocumentTree-files-label"><span class="orderDocumentTree-files-label-text">'),__append(file.text),__append('</span><span class="orderDocumentTree-files-label-smallText">'),__append(escapeFn(file.smallText)),__append("</span></span>\n  "),file.id&&(__append('\n  <span class="orderDocumentTree-files-files">\n    '),_.forEach(file.files,function(e,n){__append("\n    "),n<3&&(__append('\n    <a href="/orderDocuments/'),__append(file.id),__append("?pdf=1&hash="),__append(e.hash),__append('" target="_blank" data-file-id="'),__append(file.id),__append('" data-hash="'),__append(e.hash),__append('">'),__append(time.format(e.date,"L")),__append("</a>\n    ")),__append("\n    ")}),__append("\n  </span>\n  ")),__append("\n</div>\n");return __output.join("")}});