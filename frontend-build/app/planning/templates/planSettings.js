define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="planning-settings-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-freezeHour">'),__append(t("planning","settings:freezeHour")),__append('</label>\n        <p class="help-block">'),__append(t("planning","settings:freezeHour:help")),__append('</p>\n        <input id="'),__append(idPrefix),__append('-freezeHour" name="freezeHour" class="form-control" type="text" autocomplete="new-password" required pattern="^(1?[0-9]|2[0-3])$" data-object="plan" style="width: 100px">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-lateHour">'),__append(t("planning","settings:lateHour")),__append('</label>\n        <p class="help-block">'),__append(t("planning","settings:lateHour:help")),__append('</p>\n        <input id="'),__append(idPrefix),__append('-lateHour" name="lateHour" class="form-control" type="text" autocomplete="new-password" required pattern="^(1?[0-9]|2[0-3])$" data-object="plan" style="width: 100px">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-schedulingRate">'),__append(t("planning","settings:schedulingRate")),__append('</label>\n        <p class="help-block">'),__append(t("planning","settings:schedulingRate:help")),__append('</p>\n        <textarea id="'),__append(idPrefix),__append('-schedulingRate" name="schedulingRate" class="form-control text-mono" required data-object="plan" rows="4"></textarea>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-ignoredWorkCenters">'),__append(t("planning","settings:ignoredWorkCenters")),__append('</label>\n        <p class="help-block">'),__append(t("planning","settings:ignoredWorkCenters:help")),__append('</p>\n        <input id="'),__append(idPrefix),__append('-ignoredWorkCenters" name="ignoredWorkCenters" class="form-control text-mono" data-object="plan">\n      </div>\n      '),["requiredStatuses","ignoredStatuses","completedStatuses"].forEach(function(n){__append('\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append("-"),__append(n),__append('">'),__append(t("planning","settings:"+n)),__append('</label>\n        <p class="help-block">'),__append(t("planning","settings:"+n+":help")),__append('</p>\n        <input id="'),__append(idPrefix),__append("-"),__append(n),__append('" name="'),__append(n),__append('" type="text" autocomplete="new-password" data-object="plan">\n      </div>\n      ')}),__append('\n      <div class="checkbox">\n        <label class="control-label">\n          <input id="'),__append(idPrefix),__append('-ignoreCompleted" name="ignoreCompleted" type="checkbox" value="true" data-object="plan">\n          '),__append(t("planning","settings:ignoreCompleted")),__append('\n        </label>\n        <p class="help-block">'),__append(t("planning","settings:ignoreCompleted:help")),__append('</p>\n      </div>\n      <div class="checkbox">\n        <label class="control-label">\n          <input id="'),__append(idPrefix),__append('-useRemainingQuantity" name="useRemainingQuantity" type="checkbox" value="true" data-object="plan">\n          '),__append(t("planning","settings:useRemainingQuantity")),__append('\n        </label>\n        <p class="help-block">'),__append(t("planning","settings:useRemainingQuantity:help")),__append('</p>\n      </div>\n      <hr>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-line">'),__append(t("planning","settings:line")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-line" type="text" autocomplete="new-password">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-mrpPriority">'),__append(t("planning","settings:mrpPriority")),__append('</label>\n        <p class="help-block">'),__append(t("planning","settings:mrpPriority:help")),__append('</p>\n        <input id="'),__append(idPrefix),__append('-mrpPriority" type="text" autocomplete="new-password">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-activeTime">'),__append(t("planning","settings:activeTime")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-activeTime" name="activeTime" class="form-control" type="text" autocomplete="new-password" placeholder="06:00-06:00" pattern="^[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}(,\\s*[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2})*$" data-object="line">\n      </div>\n      <hr>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-mrp">'),__append(t("planning","settings:mrp")),__append('</label>\n        <p class="help-block">'),__append(t("planning","settings:mrp:help")),__append('</p>\n        <input id="'),__append(idPrefix),__append('-mrp" type="text" autocomplete="new-password">\n      </div>\n      <div class="row">\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-extraOrderSeconds">'),__append(t("planning","settings:extraOrderSeconds")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-extraOrderSeconds" name="extraOrderSeconds" class="form-control" type="number" min="0" max="600" step="1" data-object="mrp">\n          <p class="help-block">'),__append(t("planning","settings:extraOrderSeconds:help")),__append('</p>\n        </div>\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-extraShiftSeconds-1">'),__append(t("planning","settings:extraShiftSeconds:1")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-extraShiftSeconds-1" name="extraShiftSeconds" class="form-control" type="number" min="0" max="3600" step="1" data-object="mrp">\n          <p class="help-block">'),__append(t("planning","settings:extraShiftSeconds:help")),__append('</p>\n        </div>\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-extraShiftSeconds-2">'),__append(t("planning","settings:extraShiftSeconds:2")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-extraShiftSeconds-2" name="extraShiftSeconds" class="form-control" type="number" min="0" max="3600" step="1" data-object="mrp">\n        </div>\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-extraShiftSeconds-3">'),__append(t("planning","settings:extraShiftSeconds:3")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-extraShiftSeconds-3" name="extraShiftSeconds" class="form-control" type="number" min="0" max="3600" step="1" data-object="mrp">\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-bigOrderQuantity">'),__append(t("planning","settings:bigOrderQuantity")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-bigOrderQuantity" name="bigOrderQuantity" class="form-control" type="number" min="0" max="9999" step="1" data-object="mrp">\n          <p class="help-block">'),__append(t("planning","settings:bigOrderQuantity:help")),__append('</p>\n        </div>\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-hardOrderManHours">'),__append(t("planning","settings:hardOrderManHours")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-hardOrderManHours" name="hardOrderManHours" class="form-control" type="number" min="0" max="9999" step="0.001" data-object="mrp">\n          <p class="help-block">'),__append(t("planning","settings:hardOrderManHours:help")),__append('</p>\n        </div>\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-splitOrderQuantity">'),__append(t("planning","settings:splitOrderQuantity")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-splitOrderQuantity" name="splitOrderQuantity" class="form-control" type="number" min="0" max="9999" step="1" data-object="mrp">\n          <p class="help-block">'),__append(t("planning","settings:splitOrderQuantity:help")),__append('</p>\n        </div>\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-maxSplitLineCount">'),__append(t("planning","settings:maxSplitLineCount")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-maxSplitLineCount" name="maxSplitLineCount" class="form-control" type="number" min="0" max="99" step="1" data-object="mrp">\n          <p class="help-block">'),__append(t("planning","settings:maxSplitLineCount:help")),__append('</p>\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-hardComponents">'),__append(t("planning","settings:hardComponents")),__append('</label>\n        <p class="help-block">'),__append(t("planning","settings:hardComponents:help")),__append('</p>\n        <input id="'),__append(idPrefix),__append('-hardComponents" name="hardComponents" type="text" autocomplete="new-password" data-object="mrp">\n      </div>\n      <div class="form-group">\n        <label>'),__append(t("planning","settings:groups")),__append('</label>\n        <table class="table table-bordered table-condensed">\n          <thead>\n          <tr>\n            <th class="is-min">'),__append(t("planning","settings:groups:no")),__append('</th>\n            <th class="is-min">'),__append(t("planning","settings:groups:lines")),__append('</th>\n            <th class="is-min">'),__append(t("planning","settings:groups:splitOrderQuantity")),__append("</th>\n            <th>"),__append(t("planning","settings:groups:components")),__append("</th>\n            <th>"),__append(t("core","LIST:COLUMN:actions")),__append('</th>\n          </tr>\n          </thead>\n          <tbody id="'),__append(idPrefix),__append('-groups"></tbody>\n        </table>\n        <button id="'),__append(idPrefix),__append('-addGroup" type="button" class="btn btn-default" disabled>\n          <i class="fa fa-plus"></i>\n          <span>'),__append(t("planning","settings:groups:add")),__append('</span>\n        </button>\n      </div>\n      <hr>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-mrpLine">'),__append(t("planning","settings:mrpLine")),__append('</label>\n        <p class="help-block">'),__append(t("planning","settings:mrpLine:help")),__append('</p>\n        <input id="'),__append(idPrefix),__append('-mrpLine" type="text" autocomplete="new-password">\n      </div>\n      <div class="row">\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-workerCount">'),__append(t("planning","settings:workerCount")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-workerCount" name="workerCount" class="form-control" type="number" min="0" max="9999" step="1" data-object="mrpLine">\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-orderPriority">'),__append(t("planning","settings:orderPriority")),__append('</label>\n        <p class="help-block">'),__append(t("planning","settings:orderPriority:help")),__append('</p>\n        <input id="'),__append(idPrefix),__append('-orderPriority" type="text" autocomplete="new-password">\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button id="'),__append(idPrefix),__append('-submit" type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});