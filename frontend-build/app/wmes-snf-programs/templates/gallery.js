define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-default snf-programs-gallery">\n  <div class="panel-heading">'),__append(helpers.t("PANEL:TITLE:gallery")),__append('</div>\n  <div class="panel-body">\n    '),user.isAllowedTo("XICONF:MANAGE")&&(__append('\n    <form class="thumbnail snf-programs-gallery-upload" method="post" enctype="multipart/form-data" action="/programs/'),__append(program._id),__append('/images">\n      <input id="'),__append(idPrefix),__append('-files" type="file" accept="image/*" multiple>\n      <button id="'),__append(idPrefix),__append('-upload" class="btn btn-link" type="button"><i class="fa fa-plus-circle"></i></button>\n      <div class="caption">\n        <p>'),__append(helpers.t("gallery:add")),__append("</p>\n      </div>\n    </form>\n    ")),__append("\n    "),program.images.forEach(function(n){__append("\n    "),function(){__append('<div class="thumbnail" data-id="'),__append(n._id),__append('">\n  <a href="/snf/programs/'),__append(program._id),__append("/images/"),__append(n._id),__append("."),__append(n.type),__append('"><img src="/snf/programs/'),__append(program._id),__append("/images/"),__append(n._id),__append("."),__append(n.type),__append('" alt=""></a>\n  <div class="caption">\n    <p class="thumbnail-label">'),__append(escapeFn(n.label)),__append('</p>\n    <p class="thumbnail-actions">\n      '),user.isAllowedTo("XICONF:MANAGE")&&__append('\n      <button type="button" class="btn btn-default snf-programs-image-edit"><i class="fa fa-edit"></i></button>\n      <button type="button" class="btn btn-default snf-programs-image-delete"><i class="fa fa-remove"></i></button>\n      '),__append('\n      <i class="fa fa-spinner fa-spin"></i>\n    </p>\n  </div>\n</div>\n')}.call(this),__append("\n    ")}),__append("\n  </div>\n</div>\n");return __output.join("")}});