
                            /**
                            *@NApiVersion 2.1
                            *@NScriptType ClientScript
                            */
define(["N/crypto/random"],function(n){return r={468:function(e){e.exports=n},772:function(e,n,r){r=[r(468)],n=function(r){return{pageInit:function pageInit(e){(e=e.currentRecord.getValue({fieldId:"custpage_nx_message"}))&&window.parent.nx_addMessage(JSON.parse(e)),(e=document.getElementById("submitter"))&&e.click()},saveRecord:function saveRecord(e){var e=e.currentRecord,n=new Array(32).fill().map(function(){return String.fromCharCode(r.generateInt({min:33,max:126}))}).join("");return e.setValue({fieldId:"custpage_nx_account_key",value:n}),!0}}}.apply(n,r);void 0!==n&&(e.exports=n)}},t={},function __webpack_require__(e){var n=t[e];return void 0===n&&(n=t[e]={exports:{}},r[e](n,n.exports,__webpack_require__)),n.exports}(772);var r,t});