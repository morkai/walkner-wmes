define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="orderDocuments-controls">\n  <input id="'),__output.push(idPrefix),__output.push('-localFile" class="orderDocuments-localFile" type="file" tabindex="-1" accept="application/pdf">\n  <div class="orderDocuments-controls-components">\n    <div id="'),__output.push(idPrefix),__output.push('-prodLine" class="orderDocuments-prodLine"></div>\n    <div>\n      <div class="orderDocuments-buttons">\n        <button id="'),__output.push(idPrefix),__output.push('-openLocalFileDialog" type="button" class="btn btn-default" title="'),__output.push(t("orderDocuments","controls:openLocalFileDialog")),__output.push('"><i class="fa fa-folder-open"></i></button>\n        <button id="'),__output.push(idPrefix),__output.push('-openLocalOrderDialog" type="button" class="btn btn-default" title="'),__output.push(t("orderDocuments","controls:openLocalOrderDialog")),__output.push('"><i class="fa fa-search"></i></button>\n        <button id="'),__output.push(idPrefix),__output.push('-reloadDocument" type="button" class="btn btn-default" title="'),__output.push(t("orderDocuments","controls:reloadDocument")),__output.push('"><i class="fa fa-refresh"></i></button>\n        <button id="'),__output.push(idPrefix),__output.push('-openDocumentWindow" type="button" class="btn btn-default" title="'),__output.push(t("orderDocuments","controls:openDocumentWindow")),__output.push('"><i class="fa fa-external-link"></i></button>\n        <button id="'),__output.push(idPrefix),__output.push('-openSettingsDialog" type="button" class="btn btn-default" title="'),__output.push(t("orderDocuments","controls:openSettingsDialog")),__output.push('"><i class="fa fa-wrench"></i></button>\n      </div>\n    </div>\n    <div id="'),__output.push(idPrefix),__output.push('-order" class="orderDocuments-order">\n      <span class="orderDocuments-order-no" data-property="orderNo"></span>\n      <span class="orderDocuments-order-name" data-property="orderName"></span>\n      <span class="orderDocuments-order-no" data-property="documentNc15"></span>\n      <span class="orderDocuments-order-name" data-property="documentName"></span>\n    </div>\n    <form id="'),__output.push(idPrefix),__output.push('-filterForm" class="orderDocuments-filter">\n      <input id="'),__output.push(idPrefix),__output.push('-filterPhrase" type="text" placeholder="&#61616; '),__output.push(t("orderDocuments","controls:filter:ph")),__output.push('" name="filterPhrase" autocomplete="off">\n    </form>\n    <div id="'),__output.push(idPrefix),__output.push('-documents" class="orderDocuments-documents" tabindex="-1"></div>\n  </div>\n</div>\n');return __output.join("")}});