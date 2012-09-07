
Ext.data.Protocol = Ext.extend(Object, {

	constructor: function(config) {
		this.url= config.url;
		this.database_name= config.id;
		this.key= config.key;		
		var l= this.url.length;
		if (this.url[l-1]=='/') {
			this.url= this.url.substring(0,l-1); 
		}
		this.url= this.url+"/database/"+this.database_name
  },

	sync: function(local, callback, scope) {
		//
		// JCM callback if something is going to take a long time...
		// JCM like changing the replica number
		// JCM or clearing after a generation change
		//
		if (callback===undefined) { callback= function(){} } // JCM maybe should warn the caller...
	  this.send_create_database(local.definition,function(response) {
			switch (response.r) {
			case 'ok':
				//
				// The remote CSV describes the state of updated-ness of the
				// server this client is talking to. We add any replica numbers
				// that are new to us to our local CSV.
				//
			  var remote_csv= response.csv;
			  local.addReplicaNumbers(remote_csv);
				//
				// And we update the CS generator with the maximum CS in the
				// CSV, so that the local time is bumped forward if one of 
				// the other replicas is ahead of us.
				//
				local.generator.seen(remote_csv.maxChangeStamp());
				//
				this.sync_datastore(local,remote_csv,callback,scope);
				break;
			case 'new_replica_number':
				//
				// A replica number collision, or re-initialization, has occured. 
				// In either case we must change our local replica number.
				//
		    local.setReplicaNumber(response.replica_number,function(){
					this.sync(local,callback,scope); // JCM beware of infinite loop
				},this);
				break;
			case 'new_generation_number':
				//
				// The database generation has changed. We clear out the database,
				// and update the definition. 
				//
				if (response.generation>local.definition.generation) {
					local.definition.set({generation:response.generation},function(){
						local.clear(function(){
							this.sync(local,callback,scope); // JCM beware of infinite loop
						},this);
					},this);
				} else {
					// local is the same, or greater than the server.
				}
				break;
			default:
				callback.call(scope);
				break;
			}
		},this);
	},
	
	// private

	send_create_database: function(definition,callback,scope) {
	  var request= definition.encode();
	  this.sendRequest('POST',definition.database_name,undefined,{},request,function(response){
			response.csv= new Ext.data.CSV().decode(response.csv);
			callback.call(scope, response);
		},this);
	},

	sync_datastore: function(local, remote_csv, callback, scope) {
		//
		// JCM In theory... we could send and receive at the same time...
		//
	  local.getUpdates(remote_csv,function(updates,updates_csv){
		  this.put_database_updates(local.definition,updates,updates_csv,function(response){			
		  	if (remote_csv.dominates(local.csv)) {
			  	this.get_database_updates(local,callback,scope);
				} else {
					callback.call(scope);
				}
			},this);
		},this);
	},

	put_database_updates: function(definition,updates,updates_csv,callback,scope) {
		if(updates){
			this.send_put_database_updates(definition,updates,updates_csv,function(response){
				callback.call(scope);
			},this);
		}else{
			callback.call(scope, {r:"ok"});
		}
	},

	send_put_database_updates: function(definition,updates,updates_csv,callback,scope) {
    var request= {
      updates: Ext.encode(updates.encode()),
	    //JCM csv: updates_csv.encode()
    };
		if(!updates.isEmpty()){
			console.log('sent',Ext.encode(updates))
		}
    this.sendRequest('POST',definition.database_name,'updates',{},request,callback,scope);
	},

	get_database_updates: function(local,callback,scope) {
		this.send_get_database_updates(local.definition,local.csv,function(response){
			//
			// JCM perhaps an 'event' should be fired for each object changed
			// JCM which serves as a trigger for the UI to update
			//
			if (response.r=='ok') {
			  local.putUpdates(response.updates,response.csv,function() {
					if (response.remaining>0 && !response.updates.isEmpty()) {
						this.get_database_updates(local,callback,scope);
					} else {
						callback.call(scope);
					}
				},this);
			} else {
				callback.call(scope)
			}
		},this);
	},

	send_get_database_updates: function(definition,csv,callback,scope) {
	  var params= {
	    csv: csv.encode()
	  };
	  this.sendRequest('GET',definition.database_name,'updates',params,undefined,function(response){
			// JCM response.csv= new Ext.data.CSV().decode(response.csv);
			response.updates= new Ext.data.Updates().decode(response.updates);
			if(!response.updates.isEmpty()){
				console.log('received',Ext.encode(response.updates))
			}
			callback.call(scope, response);
		},this);
	},

	sendRequest: function(http_method,database_name,method,params,request,callback,scope) {
		var url= this.url;
		if (method) {
			url= url+"/"+method;
		}
		params.key= this.key;
		Ext.Ajax.useDefaultXhrHeader= false;
		Ext.Ajax.request({
			method: http_method,
			url: url,
			params: params,
			jsonData: request,
			success: function(response){
				callback.call(scope,Ext.decode(response.responseText));
			},
			failure: function(response, options) {
				callback.call(scope,{r:'error',status:response.status,statusText:response.statusText});
			}
		});
	},
	
});
