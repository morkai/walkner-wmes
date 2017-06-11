define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="mor">\n  '),sections.forEach(function(n){__append('\n  <div class="mor-section '),__append(n.collapsed?"is-collapsed":""),__append('" data-section-id="'),__append(n._id),__append('">\n    <h3>\n      <i class="fa fa-caret-right"></i><i class="fa fa-caret-down"></i><span class="mor-section-name" draggable="'),__append(draggable),__append('">'),__append(escapeFn(n.label)),__append('</span>\n      <div class="btn-group">\n        '),watchActionsVisible&&n.addWatchVisible&&(__append('\n        <button class="btn btn-default" data-action="addWatch" title="'),__append(t("mor","action:addWatch")),__append('"><i class="fa fa-plus"></i></button>\n        ')),__append("\n        "),sectionActionsVisible&&(__append('\n        <button class="btn btn-default" data-action="editSection" title="'),__append(t("mor","action:editSection")),__append('"><i class="fa fa-edit"></i></button>\n        <button class="btn btn-default" data-action="removeSection" title="'),__append(t("mor","action:removeSection")),__append('"><i class="fa fa-remove"></i></button>\n        ')),__append("\n      </div>\n    </h3>\n    "),n.watchVisible&&(__append('\n    <table class="mor-watch">\n      <tbody>\n      '),n.watch.forEach(function(a){__append('\n      <tr data-user-id="'),__append(a.user._id),__append('">\n        <td><i class="fa fa-user-circle-o mor-user-presence '),__append(a.user.presence?"mor-user-present":"mor-user-notPresent"),__append('" data-user-id="'),__append(a.user._id),__append('"></i><span>'),__append(a.user.label),__append('</span></td>\n        <td><i class="fa fa-wrench"></i><span>'),__append(a.user.prodFunction),__append("</span></td>\n        "),n.watchAvailabilityVisible&&(__append('\n        <td><i class="fa fa-clock-o"></i><span>'),__append(a.user.availability||"06:00-06:00"),__append("</span></td>\n        ")),__append('\n        <td><i class="fa fa-phone"></i><span>'),__append(a.user.mobile),__append("</span></td>\n        <td>\n          "),linkEmails?(__append('\n          <a href="mailto:'),__append(escapeFn(a.user.email)),__append('"><i class="fa fa-envelope"></i><span>'),__append(escapeFn(a.user.email)),__append("</span></a>\n          ")):(__append('\n          <i class="fa fa-envelope"></i><span>'),__append(escapeFn(a.user.email)),__append("</span>\n          ")),__append("\n        </td>\n        "),watchActionsVisible&&__append('\n        <td class="actions">\n          <div class="btn-group">\n            <button class="btn btn-default" data-action="editWatch"><i class="fa fa-edit"></i></button>\n            <button class="btn btn-default" data-action="removeWatch"><i class="fa fa-remove"></i></button>\n          </div>\n        </td>\n        '),__append("\n      </tr>\n      ")}),__append("\n      </tbody>\n    </table>\n    ")),__append("\n    "),n.mrpsVisible&&(__append('\n    <table class="table table-bordered table-condensed table-hover mor-mrps">\n      <thead>\n      <tr>\n        '),n.mrpColumnVisible&&(__append('\n        <th class="is-min mor-is-editable">\n          MRP\n          '),mrpActionsVisible&&__append('\n          <div class="btn-group">\n            <button class="btn btn-default" data-action="addMrp"><i class="fa fa-plus"></i></button>\n          </div>\n          '),__append("\n        </th>\n        ")),__append("\n        "),n.prodFunctions.forEach(function(n){__append('\n        <th class="is-min">'),__append(escapeFn(n.label)),__append("</th>\n        ")}),__append("\n      </tr>\n      </thead>\n      <tbody>\n      "),n.mrps.forEach(function(a){__append('\n      <tr data-mrp-id="'),__append(a._id),__append('">\n        '),n.mrpColumnVisible&&(__append('\n        <td class="mor-mrp mor-is-editable">\n          <span class="mor-mrp-name">'),__append(escapeFn(a.name)),__append('</span>\n          <span class="mor-mrp-desc">'),__append(escapeFn(a.description)),__append("</span>\n          "),mrpActionsVisible&&__append('\n          <div class="btn-group">\n            <button class="btn btn-default" data-action="editMrp"><i class="fa fa-edit"></i></button>\n            <button class="btn btn-default" data-action="removeMrp"><i class="fa fa-remove"></i></button>\n          </div>\n          '),__append("\n        </td>\n        ")),__append("\n        "),a.prodFunctions.forEach(function(n){__append('\n        <td class="is-min mor-is-editable '),__append(n.common?"mor-is-common":""),__append('" data-prod-function-id="'),__append(n._id),__append('" rowspan="'),__append(escapeFn(n.rowspan)),__append('">\n          '),n.users.forEach(function(n){__append("\n          "),__append(n.no),__append('<span class="mor-user mor-user-presence '),__append(n.presence?"mor-user-present":"mor-user-notPresent"),__append('" data-user-id="'),__append(n._id),__append('">'),__append(escapeFn(n.label)),__append("</span><br>\n          ")}),__append('\n          <div class="btn-group">\n            <button class="btn btn-default" data-action="editProdFunction"><i class="fa fa-edit"></i></button>\n          </div>\n        </td>\n        ')}),__append("\n      </tr>\n      ")}),__append("\n      </tbody>\n    </table>\n    ")),__append("\n  </div>\n  ")}),__append('\n  <div id="'),__append(idPrefix),__append('-jumpList" class="list-group mor-jumpList">\n    '),sections.forEach(function(n){__append('\n    <a href="#" data-section-id="'),__append(n._id),__append('" class="list-group-item">'),__append(escapeFn(n.label)),__append("</a>\n    ")}),__append("\n  </div>\n  "),editModeVisible&&(__append('\n  <button id="'),__append(idPrefix),__append('-editMode" class="btn btn-default mor-btn-editMode" type="button"><i class="fa fa-edit"></i><span>'),__append(t.bound("mor","PAGE_ACTION:editMode")),__append("</span></button>\n  ")),__append("\n</div>\n");return __output.join("")}});