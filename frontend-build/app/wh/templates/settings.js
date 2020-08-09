define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<form class="settings planning-settings" autocomplete="off">\n  <div class="list-group">\n    <a class="list-group-item" href="#wh/settings?tab=planning" data-tab="planning" data-privileges="WH:MANAGE">'),__append(t("settings:tab:planning")),__append('</a>\n    <a class="list-group-item" href="#wh/settings?tab=pickup" data-tab="pickup" data-privileges="WH:MANAGE">'),__append(t("settings:tab:pickup")),__append('</a>\n    <a class="list-group-item" href="#wh/settings?tab=delivery" data-tab="delivery" data-privileges="WH:MANAGE">'),__append(t("settings:tab:delivery")),__append('</a>\n    <a class="list-group-item" href="#wh/settings?tab=users" data-tab="users" data-privileges="WH:MANAGE:USERS">'),__append(t("settings:tab:users")),__append('</a>\n  </div>\n  <div class="panel panel-primary">\n    <div class="panel-body" data-tab="planning">\n      '),__append(helpers.formGroup({name:"wh.planning.groupDuration",label:"settings:",type:"number",min:1,max:24})),__append("\n      "),__append(helpers.formGroup({name:"wh.planning.groupExtraItems",label:"settings:",helpBlock:!0,type:"number",min:0,max:100})),__append("\n      "),__append(helpers.formGroup({name:"wh.planning.ignoredMrps",label:"settings:",helpBlock:!0,type:"select2",rows:6,inputAttrs:{"data-setting":null}})),__append("\n      "),__append(helpers.formGroup({name:"wh.planning.enabledMrps",label:"settings:",helpBlock:!0,type:"select2",rows:6,inputAttrs:{"data-setting":null}})),__append("\n      "),__append(helpers.formGroup({name:"wh.planning.lineGroups",label:"settings:",helpBlock:!0,type:"textarea",rows:6,inputClassName:"text-fixed",inputAttrs:{"data-keyup-delay":1e4}})),__append('\n    </div>\n    <div class="panel-body" data-tab="pickup">\n      <div class="form-group">\n        <label class="control-label">'),__append(t("settings:wh.planning.ignorePsStatus")),__append('</label>\n        <span class="help-block" style="margin-bottom: 0">'),__append(t("settings:wh.planning.ignorePsStatus:help")),__append('</span>\n        <div class="checkbox" style="margin-top: 5px">\n          <label>\n            <input type="checkbox" disabled>\n            '),__append(t("planning","orders:psStatus:unknown")),__append("\n          </label>\n        </div>\n        "),["new","aside","started","partial","finished","cancelled"].forEach(function(n){__append('\n        <div class="checkbox">\n          <label>\n            <input type="checkbox" name="wh.planning.ignorePsStatus[]" value="'),__append(n),__append('">\n            '),__append(t("planning","orders:psStatus:"+n)),__append("\n          </label>\n        </div>\n        ")}),__append('\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__append(t("settings:wh.planning.psPickupStatus")),__append('</label>\n        <span class="help-block" style="display: block; margin-bottom: -5px">'),__append(t("settings:wh.planning.psPickupStatus:help")),__append("</span>\n        "),["new","aside","started","partial","finished","cancelled"].forEach(function(n){__append('\n        <div class="checkbox">\n          <label>\n            <input type="checkbox" name="wh.planning.psPickupStatus[]" value="'),__append(n),__append('">\n            '),__append(t("planning","orders:psStatus:"+n)),__append("\n          </label>\n        </div>\n        ")}),__append('\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__append(t("settings:wh.planning.psPickupReadyFuncs")),__append('</label>\n        <span class="help-block" style="display: block; margin-bottom: -5px">'),__append(t("settings:wh.planning.psPickupReadyFuncs:help")),__append("</span>\n        "),["fmx","kitter","platformer","packer"].forEach(function(n){__append('\n          <div class="checkbox">\n            <label>\n              <input type="checkbox" name="wh.planning.psPickupReadyFuncs[]" value="'),__append(n),__append('">\n              '),__append(t("func:"+n)),__append("\n            </label>\n          </div>\n        ")}),__append("\n      </div>\n      "),__append(helpers.formGroup({name:"wh.planning.maxSetSize",label:"settings:",type:"number",min:1,max:20})),__append("\n      "),__append(helpers.formGroup({name:"wh.planning.minSetDuration",label:"settings:",helpBlock:!0,type:"number",min:1,max:600})),__append("\n      "),__append(helpers.formGroup({name:"wh.planning.maxSetDuration",label:"settings:",helpBlock:!0,type:"number",min:1,max:600})),__append("\n      "),__append(helpers.formGroup({name:"wh.planning.maxSetDifference",label:"settings:",helpBlock:!0,type:"number",min:1,max:600})),__append('\n      <div class="checkbox">\n        <label class="control-label">\n          <input name="wh.planning.pendingOnly" type="checkbox" value="true">\n          '),__append(t("settings:wh.planning.pendingOnly")),__append('\n        </label>\n        <span class="help-block" style="margin-bottom: 0">'),__append(t("settings:wh.planning.pendingOnly:help")),__append("</span>\n      </div>\n      "),__append(helpers.formGroup({name:"wh.planning.maxSetsPerLine",label:"settings:",type:"number",min:1,max:100})),__append("\n      "),__append(helpers.formGroup({name:"wh.planning.availableTimeThreshold",label:"settings:",helpBlock:!0,type:"number",min:0,max:1440})),__append("\n      "),__append(helpers.formGroup({name:"wh.planning.minPickupDowntime",label:"settings:",helpBlock:!0,type:"number",min:1,max:28800})),__append("\n      "),__append(helpers.formGroup({name:"wh.planning.maxPickupDowntime",label:"settings:",helpBlock:!0,type:"number",min:1,max:1440})),__append("\n      "),__append(helpers.formGroup({name:"wh.planning.unassignSetDelay",label:"settings:",helpBlock:!0,type:"number",min:0,max:475})),__append('\n    </div>\n    <div class="panel-body" data-tab="delivery">\n      <div class="form-group">\n        <label for="'),__append(id("wh-planning-deliveryFuncs")),__append('" style="display: block; margin-bottom: -5px">'),__append(t("settings:wh.planning.deliveryFuncs")),__append("</label>\n        "),["fmx","kitter","platformer","packer","painter","dist-components","dist-packaging"].forEach(function(n){__append('\n        <div class="checkbox">\n          <label>\n            <input type="checkbox" name="wh.planning.deliveryFuncs[]" value="'),__append(n),__append('">\n            '),__append(t("func:"+n)),__append("\n          </label>\n        </div>\n        ")}),__append("\n      </div>\n      "),__append(helpers.formGroup({name:"wh.planning.minTimeForDelivery",label:"settings:",helpBlock:!0,type:"number",min:1,max:480})),__append("\n      "),__append(helpers.formGroup({name:"wh.planning.lateDeliveryTime",label:"settings:",helpBlock:!0,type:"number",min:1,max:480})),__append("\n      "),__append(helpers.formGroup({name:"wh.planning.maxDeliveryStartTime",label:"settings:",helpBlock:!0,type:"number",min:1,max:10080})),__append("\n      "),__append(helpers.formGroup({name:"wh.planning.maxFifoCartsPerDelivery",label:"settings:",helpBlock:!0,type:"number",min:1,max:100})),__append("\n      "),__append(helpers.formGroup({name:"wh.planning.maxPackCartsPerDelivery",label:"settings:",helpBlock:!0,type:"number",min:1,max:100})),__append("\n      "),__append(helpers.formGroup({name:"wh.planning.minDeliveryDowntime",label:"settings:",helpBlock:!0,type:"number",min:1,max:28800})),__append("\n      "),__append(helpers.formGroup({name:"wh.planning.maxDeliveryDowntime",label:"settings:",helpBlock:!0,type:"number",min:1,max:1440})),__append('\n    </div>\n    <div class="panel-body" data-tab="users">\n      '),["fmx","kitter","platformer","packer","painter","dist-components","dist-packaging"].forEach(function(n){__append('\n      <div class="form-group">\n        <label>'),__append(t("func:"+n)),__append('</label>\n        <input type="text" autocomplete="new-password" data-user-func="'),__append(n),__append('">\n      </div>\n      ')}),__append("\n    </div>\n  </div>\n</form>\n");return __output}});