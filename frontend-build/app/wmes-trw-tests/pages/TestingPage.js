define(["underscore","jquery","viewerjs","app/i18n","app/viewport","app/data/localStorage","app/core/Model","app/core/View","app/core/util/embedded","app/core/util/uuid","app/production/views/VkbView","app/planning/util/contextMenu","app/wmes-trw-testers/Tester","app/wmes-trw-programs/Program","../Test","../views/WorkstationPickerDialogView","../views/OrderPickerDialogView","../views/TesterPickerDialogView","../views/ProgramPickerDialogView","app/wmes-trw-tests/templates/testing"],function(e,t,o,s,i,r,n,a,l,d,c,h,m,u,g,p,f,w,T,v){"use strict";return a.extend({layoutName:"blank",template:v,pageId:"trw-testing",events:{'click [data-prop="workstation"]':function(e){e.currentTarget.classList.contains("is-unclickable")||this.showWorkstationPickerDialog()},'click [data-prop="order"]':function(){this.model.get("line")?this.showOrderPickerDialog():this.showWorkstationPickerDialog()},'click [data-prop="program"]':function(){this.model.tester.get("name")?this.showProgramPickerDialog():this.showTesterPickerDialog()},"click #-menu":function(){h.show(this,60,window.innerWidth-60,{className:"trw-testing-menu",menu:[{label:this.t("testing:menu:workstation"),handler:this.showWorkstationPickerDialog.bind(this)},{label:this.t("testing:menu:tester"),handler:this.showTesterPickerDialog.bind(this)}]})},"click .trw-testing-ft":function(){var e=this.model.get("state");"test-success"!==e&&"error"!==e||this.startTest()}},localTopics:{"socket.connected":function(){this.loadTesterAndProgram()}},remoteTopics:{"trw.testers.edited":function(e){e.model._id===this.model.tester.id&&this.model.tester.set(e.model)},"trw.testers.deleted":function(e){e.model._id===this.model.tester.id&&this.model.tester.clear()},"trw.programs.edited":function(e){var t=Object.assign({},e.model),o=this.model.program;t._id===o.id&&(t.tester===this.model.tester.id?(t.tester=this.model.tester.toJSON(),o.set(t)):o.clear())},"trw.programs.deleted":function(e){e.model._id===this.model.program.id&&this.model.program.clear()}},initialize:function(){var e=this.model=Object.assign(new n({ready:!1,state:"unknown",error:null,step:1,test:null,line:r.getItem("TRW:LINE")||"",workstation:parseInt(r.getItem("TRW:WORKSTATION"),10)||0,order:sessionStorage.getItem("TRW:ORDER")||"",qtyTodo:parseInt(sessionStorage.getItem("TRW:QTY_TODO"),10)||0,qtyDone:-1}),{nlsDomain:"wmes-trw-tests",tester:new m({_id:r.getItem("TRW:TESTER")||null}),program:new u({_id:sessionStorage.getItem("TRW:PROGRAM")||null}),test:new g});this.vkbView=new c,this.listenTo(e,"change:state",this.updateState),this.listenTo(e,"change:step",this.updateMessage),this.listenTo(e,"change:qtyTodo change:qtyDone",this.updateOrder),this.listenTo(e,"change:order",this.onOrderChange),this.listenTo(e,"change:line change:workstation",this.onLineChange),this.listenTo(e.tester,"error",this.onTesterError),this.listenTo(e.tester,"change",this.onTesterChange),this.listenTo(e.program,"error",this.onProgramError),this.listenTo(e.program,"change",this.onProgramChange),this.setView("#-vkb",this.vkbView)},destroy:function(){document.body.classList.remove("trw-testing-page"),t(".modal.fade").addClass("fade")},beforeRender:function(){document.body.classList.add("trw-testing-page")},afterRender:function(){t(".modal.fade").removeClass("fade"),l.render(this),this.updateWorkstation(),this.updateOrder(),this.updateProgramName(),this.updateMessage(),this.loadTesterAndProgram(),this.setUpViewer(),window.IS_EMBEDDED?(window.parent.postMessage({type:"ready",app:"trw"},"*"),this.scheduleAction(function(){this.model.set("ready",!0),this.startTest()},3333)):(this.model.set("ready",!0),this.startTest())},loadTesterAndProgram:function(){var e=this;if(!e.model.tester.id)return e.model.program.clear(),void e.model.tester.clear();var t=e.model.program.id,o=e.model.tester.fetch();o.fail(function(){404===o.status&&e.model.tester.clear()}),o.done(function(){t&&(e.model.program.set({_id:t}),(o=e.model.program.fetch()).fail(function(){404===o.status&&e.model.program.clear()}),o.done(function(){var t=e.model.program.get("tester");t&&t._id===e.model.tester.id||e.model.program.clear()}))})},setUpViewer:function(){new o(this.$id("viewer-images")[0],{inline:!0,button:!1,keyboard:!1,navbar:!1,title:!1,tooltip:!1,backdrop:!1,initialViewIndex:0,toolbar:{},toggleOnDblclick:!1,view:function(e){console.log("viewer#view",e)},rendering:function(){console.log("viewer#rendering")},rendered:function(){console.log("viewer#rendered")},viewed:function(){console.log("viewer#viewed")}}).show()},updateWorkstation:function(){var t,o=this.model.get("line"),s=this.model.get("workstation"),i=!1;o&&s?t=e.escape(o)+" • "+s:(t=this.t("testing:noWorkstation"),i=!0),this.$prop("workstation",t).toggleClass("is-unclickable",!i)},updateOrder:function(){var e=this.model.get("order"),t=this.model.get("qtyTodo"),o=this.model.get("qtyDone");this.model.get("line")?e?t&&(e+=" • "+(o>=0?o:"?")+"/"+t):e=this.t("testing:noOrder"):e=this.t("testing:noWorkstation"),this.$prop("order",e)},updateProgramName:function(){var e=this.model.program.get("name");this.model.tester.get("name")?e||(e=this.t("testing:noProgram")):e=this.t("testing:noTester"),this.$prop("program",e)},updateState:function(){this.el.dataset.state=this.model.get("state"),this.updateMessage()},updateMessage:function(){var e=this.model.get("state"),t=e+"?";if(s.has(this.model.nlsDomain,"state:"+e))t=this.t("state:"+e);else if("test"===e){var o=this.model.test.get("program"),i=this.model.get("step"),r=o.steps[i-1];r&&(t=this.t("state:step:prefix",{n:i})+u.colorize(r.name))}else"error"===e&&(t=this.model.get("error"));this.$id("message").html(t)},showWorkstationPickerDialog:function(){var e=new p({model:this.model,vkb:this.vkbView});this.listenTo(e,"picked",function(e){this.model.set({line:e.line,workstation:e.workstation}),i.closeDialog()}),i.showDialog(e,this.t("workstationPicker:title"))},showOrderPickerDialog:function(){var e=new f({model:this.model,vkb:this.vkbView});this.listenTo(e,"picked",function(e){this.model.set({order:e.order,qtyTodo:e.qtyTodo}),sessionStorage.removeItem("TRW:PROGRAM"),i.closeDialog()}),i.showDialog(e,this.t("orderPicker:title"))},showTesterPickerDialog:function(){var e=new w({model:this.model,vkb:this.vkbView});this.listenTo(e,"picked",function(e){this.model.tester.set(e.tester),i.closeDialog()}),i.showDialog(e,this.t("testerPicker:title"))},showProgramPickerDialog:function(){var e=new T({model:this.model,vkb:this.vkbView});this.listenTo(e,"picked",function(e){this.model.program.set(e.program),i.closeDialog()}),i.showDialog(e,this.t("programPicker:title"))},$prop:function(e,t){var o=this.$('.trw-testing-hd-prop[data-prop="'+e+'"]');return 2===arguments.length&&o.find(".trw-testing-hd-prop-value").html(t),o},onTesterError:function(){this.model.tester.clear()},onTesterChange:function(){this.model.tester.id?r.setItem("TRW:TESTER",this.model.tester.id):r.removeItem("TRW:TESTER"),this.model.program.clear(),this.updateProgramName(),this.startTest()},onProgramError:function(){this.model.program.clear()},onProgramChange:function(){this.model.program.id?r.setItem("TRW:PROGRAM",this.model.program.id):r.removeItem("TRW:PROGRAM"),this.updateProgramName(),this.loadCounter(),this.startTest()},onOrderChange:function(){this.model.get("line")?(sessionStorage.setItem("TRW:ORDER",this.model.get("line")),sessionStorage.setItem("TRW:QTY_TODO",this.model.get("qtyTodo"))):(sessionStorage.removeItem("TRW:ORDER"),sessionStorage.removeItem("TRW:QTY_TODO")),this.model.program.clear(),this.loadCounter(),this.updateOrder()},onLineChange:function(){this.model.get("line")?(r.setItem("TRW:LINE",this.model.get("line")),r.setItem("TRW:WORKSTATION",this.model.get("workstation"))):(r.removeItem("TRW:LINE"),r.removeItem("TRW:WORKSTATION")),this.updateWorkstation(),this.updateOrder()},loadCounter:function(){var e=this;e.counterSub&&(e.counterSub.cancel(),e.counterSub=null),e.counterReq&&(e.counterReq.abort(),e.counterReq=null);var t=e.model.get("order"),o=e.model.program.id;if(e.model.set("qtyDone",0),t&&o){e.counterSub=e.pubsub.subscribe("trw.counters.updated."+t+"."+o,function(t){e.model.set("qtyDone",t.count)});var s=e.counterReq=e.ajax({url:"/trw/counters?limit(1)&populate(order,(qty))&order="+t+"&program="+o});e.counterReq.done(function(t){if(1===t.totalCount){var o=t.collection[0];e.model.set({qtyTodo:o.order?o.order.qty:0,qtyDone:o.count})}}),e.counterReq.always(function(){e.counterReq===s&&(e.counterReq=null)})}},scheduleAction:function(e,t){var o=this,s=o.model.get("test");o.timers.nextAction&&(clearTimeout(o.timers.nextAction),o.timers.nextAction=null),o.timers.nextAction=setTimeout(function(){o.model.get("test")===s&&e.call(o)},t||1)},startTest:function(){return this.model.get("ready")?(this.timers.nextAction&&(clearTimeout(this.timers.nextAction),this.timers.nextAction=null),this.model.get("line")?this.model.tester.get("name")?this.model.program.get("name")?this.model.get("order")?void this.scheduleAction(this.runTest):this.model.set({state:"no-order"}):this.model.set({state:"no-program"}):this.model.set({state:"no-tester"}):this.model.set({state:"no-line"})):this.model.set({state:"not-ready"})},runTest:function(){var e=this.model.program.toJSON(),t={};e.tester.io.forEach(function(e){t[e._id]=e}),this.model.test.clear(),this.model.test.set({startedAt:new Date,finishedAt:null,line:this.model.get("line"),workstation:this.model.get("workstation"),order:this.model.get("order"),pce:-1,program:e}),this.model.set({state:"test",step:1,error:null,test:d(),allIo:t,setIo:{},checkIo:{}}),this.setIo(!0,this.runStep)},runStep:function(){var e=this.model.test.get("program"),t=this.model.get("step"),o=e.steps[t-1],s=this.model.get("allIo"),i=this.model.get("setIo"),r=this.model.get("checkIo");o.setIo.forEach(function(e){i[e]=s[e]}),o.checkIo.forEach(function(e){r[e]=s[e]}),this.setIo(!1,this.checkIo)},setIo:function(t,o){var s=this,i=[],r=s.model.get("allIo"),n=s.model.get("setIo");e.forEach(r,function(e){"output"===e.type&&i.push({device:e.device,channel:e.channel,value:!t&&n[e._id]?0:8e3})}),s.runCommand("setIo",{outputs:i},function(e){if(e)return s.model.set({state:"error",error:s.t("testing:error:setIo",{error:e.message})}),s.scheduleAction(s.startTest,1e4);s.scheduleAction(o)})},checkIo:function(){var t=this,o=[],s=t.model.get("checkIo");e.forEach(s,function(e){"input"===e.type&&o.push({device:e.device,channel:e.channel})}),t.runCommand("getIo",{inputs:o},function(o,i){if(o)return t.model.set({state:"error",error:t.t("testing:error:getIo",{error:o.message})}),t.scheduleAction(t.startTest,1e4);var r=[],n=[];if(e.forEach(s,function(e){i[e.device][e.channel]>900?r.push(e._id):n.push(e._id)}),n.length)t.scheduleAction(t.checkIo,100);else{var a=t.model.get("step");t.model.test.get("program").steps[a]?(t.model.set("step",a+1),t.scheduleAction(t.runStep)):t.scheduleAction(t.tearDown)}})},tearDown:function(){/^TEST/.test(this.model.get("line"))?this.setIo(!0,this.saveTest):(this.model.set({state:"test-teardown"}),this.checkTearDown())},checkTearDown:function(){var t=this,o=[],s=t.model.get("checkIo");e.forEach(s,function(e){o.push({device:e.device,channel:e.channel})}),t.runCommand("getIo",{inputs:o},function(o,i){if(o)return t.model.set({state:"error",error:t.t("testing:error:getIo",{error:o.message})}),t.scheduleAction(t.startTest,1e4);var r=[],n=[];e.forEach(s,function(e){i[e.device][e.channel]<100?r.push(e._id):n.push(e._id)}),n.length?t.scheduleAction(t.checkTearDown,100):t.setIo(!0,t.saveTest)})},saveTest:function(){this.model.test.set({finishedAt:new Date}),this.model.set({state:"test-saving"}),this.scheduleAction(this.trySaveTest.bind(this,1))},trySaveTest:function(e){var t=this,o=t.ajax({method:"POST",url:"/trw/tests",data:JSON.stringify(t.model.test.toJSON())});o.fail(function(){if(3===e){var s=o.responseJSON&&o.responseJSON.error&&o.responseJSON.error.message||o.statusText;return t.model.set({state:"error",error:t.t("testing:error:save",{error:s})})}t.scheduleAction(t.trySaveTest.bind(t,e+1),1e3*e)}),o.done(function(){t.scheduleAction(t.finishTest)})},finishTest:function(){this.model.test.clear(),this.model.set({state:"test-success"}),/^TEST/.test(this.model.get("line"))||this.scheduleAction(this.startTest,5e3)},runCommand:function(e,t,o){var s={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)};fetch("http://localhost/trw/"+e,s).then(function(e){if(e.ok)return e.json();throw new Error("status code: "+e.status)}).then(function(e){if(e.error)throw e.error;o(null,e)}).catch(o)}})});