define([
	"dojo/_base/declare",
	"dojo/_base/lang"
], function(declare, lang  ) {
	
	return declare("dcc/datatools/utils/RegExpEx", null, {
		
		regExp: null,
		
		getRequest: function(){
			return new Request();
		},
		
		createDeferred: function(){
			return new Deferred();
		},
		
		errorHandler: function(error){
			console.error(error);
		},
		
		emitDataReadyEvent: function(dataToRenderView){
			this.emit(cons.RESPONSE_INIT_VIEW_DATA_READY, dataToRenderView);
		},
		
		sendInitRequest: function(url){
			var _self = this;
			var req = this.getRequest();
			req.sendRequest(url, {
				noRedirect: true,
				successHandler: lang.hitch(_self, "initRequestReadyHandler")
			});				
		},
		
		initRequestReadyHandler: function(response){
			var result = this.dataWrapperForViewer(response);
			this.emitDataReadyEvent(result);
		},
		
		dataWrapperForViewer: function(response){
			
		}
	})
})