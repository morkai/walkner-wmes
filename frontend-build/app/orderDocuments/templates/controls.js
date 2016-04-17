define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escape=escape||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="orderDocuments-controls">\n  <input id="'),__append(idPrefix),__append('-localFile" class="orderDocuments-localFile" type="file" tabindex="-1" accept="application/pdf">\n  <div class="orderDocuments-controls-components">\n    <div id="'),__append(idPrefix),__append('-prodLine" class="orderDocuments-prodLine"></div>\n    <div>\n      <div class="orderDocuments-buttons">\n        <button id="'),__append(idPrefix),__append('-openLocalFileDialog" type="button" class="btn btn-default" title="'),__append(t("orderDocuments","controls:openLocalFileDialog")),__append('"><i class="fa fa-folder-open"></i></button>\n        <button id="'),__append(idPrefix),__append('-openLocalOrderDialog" type="button" class="btn btn-default" title="'),__append(t("orderDocuments","controls:openLocalOrderDialog")),__append('"><i class="fa fa-search"></i></button>\n        <button id="'),__append(idPrefix),__append('-reloadDocument" type="button" class="btn btn-default" title="'),__append(t("orderDocuments","controls:reloadDocument")),__append('"><i class="fa fa-refresh"></i></button>\n        <button id="'),__append(idPrefix),__append('-openDocumentWindow" type="button" class="btn btn-default" title="'),__append(t("orderDocuments","controls:openDocumentWindow")),__append('"><i class="fa fa-external-link"></i></button>\n        <button id="'),__append(idPrefix),__append('-openSettingsDialog" type="button" class="btn btn-default" title="'),__append(t("orderDocuments","controls:openSettingsDialog")),__append('"><i class="fa fa-wrench"></i></button>\n        <button id="'),__append(idPrefix),__append('-openAddSuggestionWindow" type="button" class="btn btn-default" title="'),__append(t("orderDocuments","controls:openAddSuggestionWindow")),__append('"><i class="fa fa-lightbulb-o"></i></button>\n      </div>\n    </div>\n    <div id="'),__append(idPrefix),__append('-order" class="orderDocuments-order">\n      <span class="orderDocuments-order-no" data-property="orderNo"></span>\n      <span class="orderDocuments-order-name" data-property="orderName"></span>\n      <span class="orderDocuments-order-no" data-property="documentNc15"></span>\n      <span class="orderDocuments-order-name" data-property="documentName"></span>\n    </div>\n    <form id="'),__append(idPrefix),__append('-filterForm" class="orderDocuments-filter">\n      <input id="'),__append(idPrefix),__append('-filterPhrase" type="text" placeholder="&#61616; '),__append(t("orderDocuments","controls:filter:ph")),__append('" name="filterPhrase" autocomplete="off">\n    </form>\n    <div id="'),__append(idPrefix),__append('-documents" class="orderDocuments-documents" tabindex="-1"></div>\n  </div>\n</div>\n');return __output.join("")}});