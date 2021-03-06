define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	'dojo/Deferred',
	'dojo/_base/array',
	'dojo/json',
	"dcc/datatools/common/BaseModel",
	'dcc/datatools/context/AppContext',
	"./AppHelper",
	"./AppCommandHandler",
	"dcc/datatools/command/CommandHandler"

], function(declare, lang, Deferred, array, json, 
		BaseModel, AppContext, AppHelper, appCommandHandler, CommandHandler ) {

	
	return declare("dcc/datatools/app/AppModel", BaseModel, {
		
		modules : null,
		
		openedModules : null,

		workspaceModules : null,
		
		constructor: function(){
			this.modules = {};
			this.openedViews = {};
			this.openedModules = {};
			this.workspaceModules = {};
			this.workspaceName = AppContext.workspaceToLoad;
			this.workspaceSetting = null;
			this.registerEvents();
			this.loadWorkspaceSetting();
		},
		
		loadWorkspaceModules: function(){
			var _self = this;
			array.forEach(workspaceModules, function(module){
				var _moduleID = module.moduleID;
				_self.moduleHandler(_moduleID);
				
				/*
				deferred.then(function(view){
					_self.emit(AppHelper.RESOPNSE_WORKSPACE_LOADED, view)
				})
				*/
				
			})	
		},
		
		loadWorkspaceSetting: function(){
			var _self = this;
			if(_self.workspaceName != null && _self.workspaceName != ''){
				var deferred = new Deferred();
				AppHelper.loadWorkspace(_self.workspaceName, deferred);
				deferred.then(function(result){
					var workspace = result.result;
					_self.workspaceSetting = lang.isString(workspace) ? json.parse(workspace):workspace;
					_self.renderMainContainerWorkspace(_self.workspaceSetting);
				})
			}
		},
		
		renderMainContainerWorkspace: function(workspaceSetting){
			var _self = this;
			array.forEach(workspaceSetting, function(tabDef){
				var deferred = appCommandHandler.renderAutoRefreshView(tabDef);
				deferred.then(function(view){
					_self.emit(AppHelper.RESOPNSE_WORKSPACE_LOADED, view)
				})				
			})	
		},
		
		registerEvents: function(){
			AppHelper.generalCommandHandler(AppHelper.COMMAND_HANDLER, lang.hitch(this, 'commandHandler'));
			AppHelper.generalCommandHandler(AppHelper.CLOSE_TAB_VIEW, lang.hitch(this, 'unRegisterView'));
		},
		
		getView: function(viewId){
			if(viewId!=null && viewId !='') {
				return this.openedViews[viewId];
			}
		},
		
		registerView: function(viewId, view){
			if(viewId!=undefined && viewId!=null ) {
				this.openedViews[viewId] = view;
			}
		},
		
		unRegisterView: function(viewId) {
			var _tmp = {};
			var _viewId = viewId.viewId;
			if(_viewId!=undefined && _viewId!=null ) {
				
				for(var _tmpId in this.openedViews) {
		    		if (_tmpId == _viewId) {
		    			delete this.openedViews[_viewId];
		    		}
		    	}
			}
		},
		
		isViewOpened: function(viewId){
			if(viewId!=undefined && viewId!=null && viewId!='') {
				for(var _viewId in this.openedViews) {
		    		if (viewId == _viewId) {
		    			return true;
		    		}
		    	}
			}
			return false;
		},
		
		registerModule: function(moduleInfo){
			var _moduleID = moduleInfo.moduleID;
			this.modules[_moduleID] = moduleInfo;
		},
		
		registerWorkspaceModule: function(moduleInfo){
			var _moduleID = moduleInfo.moduleID;
			this.workspaceModules[_moduleID] = moduleInfo;
		},
		
		commandHandler: function(data){
			var _self = this;
			var commandDef = data.commandDef;
			var _viewId = commandDef.viewId;
			if(this.isViewOpened(_viewId)) {
				_self.emit(AppHelper.SELECT_TAB_VIEW, _viewId);
				
			} else {
				if(commandDef != null && commandDef.moduleID != null){
					var deferred = appCommandHandler.renderView(commandDef.moduleID, data);
					deferred.then(function(resultInfo){
						_self.emit(AppHelper.RESOPNSE_RESULT_READY, resultInfo);
					})
				}
			}
		},
	
		databaseObjectHandler: function(data){
			console.log('databaseObjectHandler...' + data);
		},
		
		moduleHandler: function(moduleID){
			var _module = this.modules[moduleID];
			if(_module!=undefined && _module!=null) {
				var _moduleID = _module.moduleID;
				var _moduleRenderView = _module.moduleRenderView;
				var _restServiceUrl = _module.restServiceUrl;
				if(_restServiceUrl!=null && _restServiceUrl!="") {
					var commandHandler = new CommandHandler({
						  args: _module.args,
						  context: null,
						  commandText: _module.displayTitle,
						  commandDef: _module
					  });
					
					  commandHandler.execute();
					  return commandHandler.defer;
				}
			}
		},
		
		persistentWorkspaceSetting: function(commandOptions){
			if(commandOptions != null && commandOptions.length > 0){
				var optionString = json.stringify(commandOptions);
				console.log('save workspace setting ' + optionString);
			}
		}

	})
})