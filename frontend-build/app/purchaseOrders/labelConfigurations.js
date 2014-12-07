// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../i18n","../user"],function(e,r){function t(e,r){var t=[];i[r].forEach(function(e){t.push({id:"vendor/"+r+"/"+e,text:e})}),e.push({label:r,papers:t})}var a={4:{w:210,h:297},5:{w:148,h:210},6:{w:105,h:148},7:{w:74,h:105}},n=["a4","vendor/48003321/A7"],i={48003321:["A5","A6","A7"]};return{getBarcodes:function(){var t=[{id:"code128",text:e("purchaseOrders","barcode:code128")}];return r.data.super&&t.push({id:"qr",text:e("purchaseOrders","barcode:qr")}),t},getPaperGroups:function(){var a=[{label:e("purchaseOrders","paper:generic"),papers:[{id:"a4",text:e("purchaseOrders","paper:a4")},{id:"104x42",text:e("purchaseOrders","paper:104x42")}]}];return r.data.super||!r.data.vendor?Object.keys(i).forEach(function(e){t(a,e)}):i[r.data.vendor]&&t(a,r.data.vendor),a},getPaperOptions:function(e){var r=this.getPaperSize(e);return{orientation:this.getPaperOrientation(e),width:r.w,height:r.h}},getPaperOrientation:function(e){return-1===n.indexOf(e)?"portrait":"landscape"},getPaperSize:function(e){var r=e.match(/([0-9]+)x([0-9]+)/);return null!==r?{w:parseInt(r[1],10),h:parseInt(r[2],10)}:(r=e.match(/a([0-9])/i),null!==r&&a[r[1]]?a[r[1]]:a[4])}}});