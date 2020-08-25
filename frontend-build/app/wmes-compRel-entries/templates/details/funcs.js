define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<div class="panel panel-default is-with-actions">\n  <div class="panel-heading">\n    <div class="panel-heading-title">'),__append(t("PANEL:TITLE:funcs")),__append('</div>\n    <div class="panel-heading-actions">\n      <button data-action="notify" class="btn btn-default" type="button" title="'),__append(t("notify:tooltip")),__append('"><i class="fa fa-bell"></i></button>\n      '),canAddUser&&(__append('\n      <button data-action="addFunc" class="btn btn-default" type="button" title="'),__append(t("addFunc:tooltip")),__append('"><i class="fa fa-plus"></i></button>\n      ')),__append("\n    </div>\n  </div>\n  "),funcs.length?(__append('\n  <div class="panel-body compRel-details-funcs">\n    '),funcs.forEach(function(n){__append('\n    <div class="compRel-details-func" data-id="'),__append(n._id),__append('" data-status="'),__append(n.status),__append('">\n      '),n.canAccept&&(__append('\n      <button class="btn btn-default compRel-details-accept" type="button" title="'),__append(t("accept:button")),__append('"><i class="fa fa-gavel"></i></button>\n      ')),__append('\n      <div class="form-group">\n        <label class="control-label">'),__append(escapeFn(n.label)),__append('</label>\n        <p class="form-control-static">'),__append(n.acceptedBy),__append('</p>\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__append(t("PROPERTY:funcs.status")),__append('</label>\n        <p class="form-control-static">'),__append(n.statusText),__append('</p>\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__append(t("PROPERTY:funcs.acceptedAt")),__append('</label>\n        <p class="form-control-static">'),__append(n.acceptedAt),__append('</p>\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__append(t("PROPERTY:funcs.comment")),__append('</label>\n        <p class="form-control-static text-lines">'),__append(escapeFn(n.comment)),__append('</p>\n      </div>\n      <div class="form-group">\n        <label class="control-label">\n          '),__append(t("PROPERTY:funcs.users")),__append("\n          "),canAddUser&&(__append('\n          <a data-action="addUser" href="javascript:void(0)" style="padding: 0 7px 0 3px" title="'),__append(t("addUser:tooltip")),__append('"><i class="fa fa-plus"></i></a>\n          ')),__append("\n        </label>\n        <ul>\n          "),n.users.forEach(function(n){__append("\n          <li>"),__append(n),__append("</li>\n          ")}),__append("\n        </ul>\n      </div>\n    </div>\n    ")}),__append("\n  </div>\n  ")):(__append('\n  <div class="panel-body">\n    <p>'),__append(t("funcs:empty")),__append("</p>\n  </div>\n  ")),__append("\n</div>\n");return __output}});