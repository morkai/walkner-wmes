define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<li class="orderDocumentTree-folders-folder '),__append(selected?"is-selected":""),__append(" "),__append(expanded?"is-expanded":""),__append(" "),__append(cut?"is-cut":""),__append(" "),__append(children.length?"has-children":"has-no-children"),__append(" "),__append(isNew?"is-new":""),__append(" "),__append(isEditing?"is-editing":""),__append('" data-folder-id="'),__append(id),__append('">\n  <span class="orderDocumentTree-folders-item" title="'),__append(escapeFn(label)),__append('">\n    <span class="orderDocumentTree-folders-toggle">\n      <i class="fa fa-chevron-right"></i>\n      <i class="fa fa-chevron-down"></i>\n    </span>\n    '),isEditing&&(__append('\n    <input class="form-control orderDocumentTree-folders-editor" type="text" value="'),__append(escapeFn(label)),__append('" '),isNew,__append(' placeholder="'),__append(isNew?t("orderDocumentTree","folders:newFolder:placeholder"):""),__append('">\n    ')),__append('\n    <span class="orderDocumentTree-folders-label">\n      <i class="fa fa-cut"></i>\n      <span>'),__append(escapeFn(label)),__append('</span>\n    </span>\n  </span>\n  <ul class="orderDocumentTree-folders-children">\n    '),children.forEach(function(e){__append("\n    "),__append(renderFolder(e)),__append("\n    ")}),__append("\n  </ul>\n</li>\n");return __output.join("")}});