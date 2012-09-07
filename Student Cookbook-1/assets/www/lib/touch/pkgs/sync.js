
Ext.data.SyncStore = Ext.extend(Object, {
	
	constructor: function(config) {
		Ext.data.utilities.check('SyncStore', 'constructor', 'config', config, ['database_name','localStorageProxy']);
		this.local= config.localStorageProxy;
		this.readConfig('index',function(data) {
			this.index= data||{};
		},this);
  },

  create: function(records, callback, scope) {
		//console.log('SyncStore - create -',records[0].getId(),Ext.encode(records[0].data))
		var operation= new Ext.data.Operation({records:records});
		this.local.create(operation,callback,scope);
  },

  read: function(oid, callback, scope) {
		//console.log('SyncStore - read -',oid)
		var operation= new Ext.data.Operation({action:'read',id:oid});
		this.local.read(operation,function(operation2) {
			var record;
			if (operation2.resultSet.count==1) {
				record= operation2.resultSet.records[0];
				Ext.apply(record,Ext.data.SyncModel);
				//console.log('SyncStore - read -',oid,'=>',Ext.encode(record.data));
			} else {
				//console.log('SyncStore - read -',oid,'=> not_found')
			}
			callback.call(scope,record);
		},this);
  },

  update: function(records, callback, scope) {
		//console.log('SyncStore - update',Ext.encode(records))
		var operation= new Ext.data.Operation({action:'update',records:records});
		this.local.update(operation,callback,scope);
  },

  destroy: function(oid, callback, scope) {
		//console.log('SyncStore - destroy -',oid)
		var data= {};
		data[Ext.data.SyncModel.OID]= oid;
		var records= [new this.local.model(data)];
		var operation= new Ext.data.Operation({action:'destroy',records:records});
		this.local.destroy(operation,callback,scope);
  },

	clear: function(callback, scope) {
		this.local.clear();
		callback.call(scope);
	},

  setModel: function(model, setOnStore) {
		//console.log('SyncStore - setModel',model)
		this.model= model;
		this.local.setModel(model, setOnStore);
  },

	readConfig: function(oid, callback, scope) {
		var item= this.local.getStorageObject().getItem(this.local.id+"-"+oid);
		var data= item ? Ext.decode(item) : {};
		callback.call(scope,data)
	},
	
	writeConfig: function(oid, data, callback, scope) {
		this.local.getStorageObject().setItem(this.local.id+"-"+oid,Ext.encode(data));
		callback.call(scope,data);
	},

	indexUpdate: function(id, oid, callback, scope) {
		if (!callback) { throw "ERROR - SyncStore - indexUpdate - no callback provided" }
		//console.log('SyncStore - indexUpdate -',id,'=>',oid)
		this.index[id]= oid;
		this.writeConfig('index',this.index,callback,scope);
	},

	indexLookup: function(id, callback, scope) {
		if (!callback) { throw "ERROR - SyncStore - indexLookup - no callback provided" }
		var oid= this.index[id];
		//console.log('SyncStore - indexLookup -',id,'=>',oid)
		callback.call(scope,oid)
	},
	
	readValue: function(key, callback, scope) {
		var value= this.local.getStorageObject().getItem(key);
		callback.call(scope,value);
	},
	
	writeValue: function(key, value, callback, scope) {
		this.local.getStorageObject().setItem(key,value);
		callback.call(scope);
	},
	
	forEachRecordAsync: function(each_callback, each_scope, done_callback, done_scope) { // JCM this is expensive... nothing should really call this.....
		//console.log('SyncStore - forEachRecordAsync')
		if (!each_callback) { throw "ERROR - SyncStore - forEachRecordAsync - no 'each' callback provided" }
		if (!done_callback) { throw "ERROR - SyncStore - forEachRecordAsync - no 'done' callback provided" }
		var operation= new Ext.data.Operation({action:'read'});
		var ids= this.local.getIds();
		Ext.data.array.forEachAsync(ids,function(id,next_callback,next_scope){
			if(id!=="") {
				operation.id= id;
				this.local.read(operation,function(operation){
					if (operation.resultSet.count==1) {
						var record= operation.resultSet.records[0];
						//console.log('SyncStore - forEachRecordAsync - record',Ext.encode(record))
						each_callback.call(each_scope,record,next_callback,next_scope);
					} else {
						console.log("WARNING - SyncStore - forEachRecordAsync - ",operation.resultSet.count," records for id ",id);
						next_callback.call(next_scope);
					}
				},this);
			} else {
				next_callback.call(next_scope);
			}
		},this,done_callback,done_scope);
	},

});



Ext.data.SyncProxy = Ext.extend(Ext.data.Proxy, {
	
	definition: undefined,
	csv: undefined,
	generator: undefined,
	model: undefined,
	store: undefined,
	idProperty: undefined,
	idDefaultProperty: undefined,
	
	// JCM constructor should not be async, delay until first operation
	
	constructor: function(config,callback,scope) {
		//
		Ext.data.utilities.check('SyncProxy', 'constructor', 'config', config, ['store','database_name','key']);
		//
		Ext.data.SyncProxy.superclass.constructor.call(this, config);
		this.store= config.store;
		//
		// System Name
		//
		this.store.readValue('Sencha.Sync.system_name',function(system_name){
			config.system_name= system_name || Ext.data.UUIDGenerator.generate();
			this.store.writeValue('Sencha.Sync.system_name',config.system_name,function(){
				//
				// Load Configuration
				//
				Ext.data.utilities.apply(this,[
					'readConfig_DatabaseDefinition',
					'readConfig_CSV',
					'readConfig_Generator'],[config],function(){
					if (this.definition.system_name===undefined) {
						this.definition.set({system_name:Ext.data.UUIDGenerator.generate()});
					}
					//console.log("SyncProxy - Opened database '"+config.key+"/"+config.database_name+"/"+config.datastore_name+"'")
					if (callback) { callback.call(scope,this) }
				},this);
			},this);
		},this);
  },

  create: function(operation, callback, scope) {
		operation.records.forEach(function(record) {
			record.setCreateState(this.makeGenerator());
			// if there's no user id, then use the oid.
			if (record.get(this.idProperty)===this.idPropertyDefaultValue) {
				var p= record.getPair(Ext.data.SyncModel.OID);
				record.data[this.idProperty]= p.v;
			}
			// JCM check that the id is unique
		},this)
		var records= this.encodeRecords(operation.records)
		return this.store.create(records,function() {
			this.indexCreatedRecords(records,function(){
				operation.records.forEach(function(record) {
					record.needsAdd= false;
				},this)				
				//console.log('create',operation);
				this.doCallback(callback,scope,operation);
			},this);
		},this);
  },

  read: function(operation, callback, scope) {
	
		function makeResultSet(operation,records,no_system_records) {
			records= this.decodeRecords(records);
			records= Ext.data.array.select(records,function(record){
				return record.isNotDestroyed() && !record.phantom && (!no_system_records || !record.isSystemModel());
			},this);
	    operation.resultSet = new Ext.data.ResultSet({
	        records: records,
	        total  : records.length,
	        loaded : true
	    });
		};
		
		if (operation.id!==undefined) {
			this.store.indexLookup(operation.id,function(oid) {
				// JCM if the id is not in the index, then it doesn't exist, so we can return now...
				this.store.read(oid,function(record) {
					makeResultSet.call(this,operation,[record],true);
					this.doCallback(callback,scope,operation);
				},this);
			},this);
		} else if (operation[Ext.data.SyncModel.OID]!==undefined) {
				this.store.read(operation[Ext.data.SyncModel.OID],function(record) {
					makeResultSet.call(this,operation,[record],false);
					this.doCallback(callback,scope,operation);
				},this);
		} else {
			var records= [];
			this.store.forEachRecordAsync(function(record,next_callback,next_scope) {
				//console.log(Ext.encode(record))
				records.push(record);
				next_callback.call(next_scope);
			},this,function(){
				makeResultSet.call(this,operation,records,true);
				this.doCallback(callback,scope,operation);
			},this);
		}
  },

  update: function(operation, callback, scope) {
		operation.records.forEach(function(record) {
			record.setUpdateState(this.makeGenerator());
		},this)
		// JCM make sure that the id has not been changed.
		var records= this.encodeRecords(operation.records);
		return this.store.update(records,function(operation) {
			this.doCallback(callback,scope,operation);
		},this);
  },

  destroy: function(operation, callback, scope) {
		var records= [];
		Ext.data.array.forEachAsync(operation.records,function(record,next_callback,next_scope){
			record.setDestroyState(this.makeGenerator());
			var oid= record.oid();
			if (!oid) {
				var id= record.data[this.idProperty];
				this.store.indexLookup(id,function(oid) {
					// JCM if the id is not in the index, then it doesn't exist, so we don't need to try deleting it.
					if (oid) {
						record.data[Ext.data.SyncModel.OID]= oid;
						records.push(record);
					}
					next_callback.call(next_scope);
				},this);
			} else {
				records.push(record);
				next_callback.call(next_scope);
			}
		},this,function(){
			records= this.encodeRecords(records);
			this.store.update(records,function(operation) {
				operation.action= 'destroy';
				this.indexDestroyedRecords(records,function(){
					this.doCallback(callback,scope,operation);
				},this);
			},this);
		},this);
  },

	clear: function(callback, scope) {
		this.store.clear(callback, scope);
	},

  setModel: function(model, setOnStore) {
		this.model= model;
		this.idProperty= this.model.prototype.idProperty;
		var fields = this.model.prototype.fields.items,
	      length = fields.length,
	      field, i;
	  for (i = 0; i < length; i++) {
	      field = fields[i];
				if (field.name===this.idProperty) {
					this.idPropertyDefaultValue= field.defaultValue;
				}
	  }
		this.definition.set({idProperty:this.idProperty,idPropertyDefaultValue:this.idPropertyDefaultValue},function(){},this);
		// extend the user's model with the replication state data,
		Ext.apply(model.prototype, Ext.data.SyncModel);
		// and create a local storage model, based on the user's model.
		this.storageModel= model.prototype.createReplStorageModel(this.modelName); // JCM shouldn't need to pass the name in
		this.store.setModel(this.storageModel, setOnStore);
  },

	replicaNumber: function() {
		return this.generator.r;
	},

	addReplicaNumbers: function(csv,callback,scope) {
		this.csv.addReplicaNumbers(csv,callback,scope);
	},

	setReplicaNumber: function(new_replica_number,callback,scope) {
		if (!callback) { throw "ERROR - SyncProxy - setReplicaNumber - no callback provided." }
  	var old_replica_number= this.replicaNumber();
		//console.log('SyncProxy.setReplicaNumber from',old_replica_number,'to',new_replica_number)
    this.changeReplicaNumber(old_replica_number,new_replica_number,function(){
			this.definition.setReplicaNumber(new_replica_number,function(){
		  	this.csv.changeReplicaNumber(old_replica_number,new_replica_number,function(){
				  this.generator.setReplicaNumber(new_replica_number,callback,scope);
				},this);
			},this);
		},this);
	},

  changeReplicaNumber: function(old_replica_number,new_replica_number,callback,scope) {
		//console.log('SyncProxy.changeReplicaNumber from',old_replica_number,'to',new_replica_number)
		if (!callback) { throw "ERROR - SyncProxy - changeReplicaNumber - no callback provided." }
		this.forEachRecordAsync(function(record,next_callback,next_scope) {
			if (!record.isSystemModel()){
				var old_oid= record.oid();
				if (record.changeReplicaNumber(old_replica_number,new_replica_number)) {
					var records= this.encodeRecords([record])
					this.store.create(records,function(){ 
						this.indexCreatedRecords(records,function(){
							this.store.destroy(old_oid,next_callback,next_scope);
						},this);
					},this);
				} else {
					next_callback.call(next_scope);
				}
			} else {
				next_callback.call(next_scope);
			}
		},this,callback,scope);
	},

	getUpdates: function(csv,callback,scope) {
		if(this.csv.dominates(csv)){
			console.log('getUpdates - scanning');
			this.csv.addReplicaNumbers(csv,function(){
		    csv.addReplicaNumbers(this.csv,function(){
					// JCM full scan - expensive - maintain a cs index?
					// JCM might also be too big... perhaps there should be a limit on the number
					// JCM of updates that can be collected...
					// JCM could also exhaust the stack
					// JCM could have a fixed sized list, discarding newest to add older
					// JCM could have a full update protocol as well as an incremental protocol
					var updates= [];
					this.forEachRecordAsync(function(record,next_callback,next_scope) {
						updates= updates.concat(record.getUpdates(csv));
						next_callback.call(next_scope);
					},this,function(){
						//
						// This sequence of updates will bring the client up to the point
						// described by the csv received plus the csv here. Note that there
						// could be no updates, but that the csv could have still been brought
						// forward. 
						//
				    //callback.call(scope,new Ext.data.Updates(updates),csv.add(this.csv));
				    callback.call(scope,new Ext.data.Updates(updates),undefined);
					},this);
				},this);
			},this);
		}else{
	    callback.call(scope,undefined,undefined);
		}
  },

	putUpdates: function(updates,updates_csv,callback,scope) {
		//
		// JCM could batch updates by object, to save on wasteful repeated gets and sets of the same object
		//
		// A client or server could receive a large number of updates, which 
		// because of the recursive nature of the following code, could 
		// exhaust the stack. (Most browsers have a limit of 1000 frames.)
		// Also, on the client, hogging the cpu can cause the UI to feel
		// unresponsive to the user. So, we chunk the updates and process
		// each in turn, yielding the cpu between them.  
		//
		var chunks= updates.chunks(10);
		Ext.data.array.forEachYielding(chunks,function(chunk,next_callback,next_scope){
			Ext.data.array.forEachAsync(chunk.updates,function(update,next_callback2,next_scope2) {
				this.applyUpdate(update,function() {
					// make sure to bump forward our clock, just in case one of our peers has run ahead
					this.generator.seen(update.c);
					// update the local csv, after the update has been processed.
					this.csv.add(update.c,next_callback2,next_scope2);
				},this);
			},this,next_callback,next_scope);
		},this,function(){
			//
			// This sequence of updates will bring the client up to the point
			// described by the csv received plus the csv here. Note that there
			// could be no updates, but that the csv could have still been brought
			// forward. 
			//
			//JCM this.csv.add(updates_csv);
			callback.call(scope);
		},this);
	},

  applyUpdate: function(update,callback,scope,last_ref) { // Attribute Value - Conflict Detection and Resolution
		//if (last_ref) {
		//	console.log('ref ==> ',this.us(update));
		//} else {
		//	console.log('applyUpdate',this.us(update));
		//}
		this.store.read(update.i,function(record) {
			if (record) {
				var ref= record.ref();
				if (ref && update.p[0]!='_') { // JCM this is a bit sneaky
					if (update.i===ref) {
						console.log("Error - applyUpdate - Infinite loop following reference. ",ref);
						callback.call(scope);
					} else {
						update.i= ref;
						this.applyUpdate(update,callback,scope,ref);
					}
				} else {
					if (update.p===this.idProperty) {
						this.applyUpdateToRecordForUniqueID(record,update,callback,scope);
					} else {
						this.applyUpdateToRecord(record,update,callback,scope);
					}
				}
			} else {
				this.applyUpdateCreatingNewRecord(update,callback,scope);
			}
		},this);
  },

	applyUpdateCreatingNewRecord: function(update,callback,scope) {
		// no record with that oid is in the local store...
		if (update.p===Ext.data.SyncModel.OID) {
			// ...which is ok, because the update is intending to create it
			var record= this.createNewRecord(update.v,update.c);
			//console.log('applyUpdate',Ext.encode(record.data),'( create )');
			this.store.create([record],callback,scope); 
		} else {
			// ...which is not ok, because given the strict ordering of updates
			// by change stamp the update creating the object must be sent first.
			// But, let's be forgiving and create the record to receive the update. 
			console.log("Warning - Update received for unknown record "+update.i,update)
			var record= this.createNewRecord(update.i,update.i);
			record.setPair(update.p,update.v,update.c);
			this.store.create([record],callback,scope);
		}
	},
	
	applyUpdateToRecordForUniqueID: function(record,update,callback,scope) {
		// update is to the id, for which we maintain uniqueness
		if (record.data[update.p]===update.v) {
			// re-asserting same value for the id
			this.applyUpdateToRecordForUniqueId(record,update,callback,scope);
		} else {
			// different value for the id, so check if a record already exists with that value
			this.store.indexLookup(update.v,function(existing_record_oid) {
				//console.log(this.us(update),'id already exists')		
				if (existing_record_oid) {
					//console.log('existing_record_oid',existing_record_oid)		
					this.readById(update.v,existing_record_oid,function(existing_record) {
						//console.log('existing_record',Ext.encode(existing_record.data))		
						// JCM if the process were to fail part way through these updates...
						// JCM would the system be hoarked?
						this.applyUpdateToRecordForUniqueId(record,update,function(){
							var r_cs= new Ext.data.CS(record.oid());
							var er_cs= new Ext.data.CS(existing_record.oid());
							var r_before, r_after;
							if (r_cs.greaterThan(er_cs)) {
								// the record being updated is more recent then the existing record
								//console.log(this.us(update),'existing record is older');
								r_before= existing_record;
								r_after= record;
							} else {
								// the existing record is more recent than the record being updated
								//console.log(this.us(update),'existing record is newer');
								r_before= record;
								r_after= existing_record;
							}
							this.resolveUniqueIDConflict(r_before,r_after,function() {
								this.store.indexUpdate(update.v,r_before.oid(),callback,scope);
							},this);
						},this);
					},this);
				} else {
					// the new id value did not exist at the time of the update
					this.applyUpdateToRecordForUniqueId(record,update,callback,scope);
				}
			},this);
		}
	},

	applyUpdatesToRecord: function(record,updates,callback,scope) {
		if (updates.length>0) {
			Ext.data.array.forEachAsync(updates,function(update,next_callback,next_scope) {
				this.applyUpdateToRecord(record,update,next_callback,next_scope);
			},this,callback,scope);
		} else {
			callback.call(scope);
		}
	},

	applyUpdateToRecordForUniqueId: function(record,update,callback,scope) {
		var value_before= record.data[update.p];
		var value_after= update.v;
		this.applyUpdateToRecord(record,update,function(changed){
			if (changed) {
				this.store.indexUpdate(value_after,record.oid(),function(){
					if (value_before) {
						this.store.indexUpdate(value_before,undefined,function(){
							callback.call(scope,changed);
						},this);
					} else {
						callback.call(scope,changed);
					}
				},this);
			} else {
				callback.call(scope,changed);
			}
		},this);
	},

	applyUpdateToRecord: function(record,update,callback,scope) {
		if (record.putUpdate(update)) {
			//console.log(this.us(update),'accepted')		
			this.store.update([record],function() {
				callback.call(scope,true);
			},scope);
		} else {
			//console.log(this.us(update),'rejected')		
			callback.call(scope,false);
		}
	},

	readById: function(id,oid,callback,scope) { // JCM move into applyUpdateToUniqueID?
		this.store.read(oid,function(record) {
			if (record) {
				callback.call(scope,record);
			} else {
				console.log('ERROR - SyncProxy - applyUpdateToUniqueID - ID Index refers to an non-existant object:',id,'=>',oid,'(This should not be possible.)');
			}
		},this);
	},

	resolveUniqueIDConflict: function(r1,r2,callback,scope) { // JCM move into applyUpdateToUniqueID?
		var updates= this.updatesForMergeRecords(r1,r2);
		this.applyUpdatesToRecord(r1,updates,function() {
			var updates= this.updatesForMakeReference(r2,r1);
			this.applyUpdatesToRecord(r2,updates,function() {
				callback.call(scope);
			},this);
		},this);
	},
	
	updatesForMergeRecords: function(r1,r2) { // merge r2 into r1 // JCM move into applyUpdateToUniqueID?
		// r1 receives all updates from r2
		var csv= r1.getCSV();
		var updates1= r2.getUpdates(csv);
		var updates2= [];
		var r1_oid= r1.oid();
		updates1.forEach(function(update) {
			if (update.p!==this.idProperty && update.p!==Ext.data.SyncModel.OID) {
				update.i= r1_oid;
				updates2.push(update);
			}
		},this);
		//console.log('updatesForMergeRecords - csv',csv);
		//console.log('updatesForMergeRecords - r1',r1.data);
		//console.log('updatesForMergeRecords - r2',r2.data);
		//console.log('updatesForMergeRecords - updates',updates2);
		return updates2;
	},

	updatesForMakeReference: function(r1,r2) { // JCM move into applyUpdateToUniqueID?
		if (r1.oid()===r2.oid()) { 
			console.log('updatesForMakeReference',r1.data,r2.data);
			throw "Error - SyncProxy - Tried to create reference to self."
		}
		var cs1= this.generateChangeStamp();
		var cs2= this.generateChangeStamp();
		var updates= [{
			i: r1.oid(),
			p: Ext.data.SyncModel.REF,
			v: r2.oid(),
			c: cs1
		},{
			i: r1.oid(),
			p: Ext.data.SyncModel.TOMBSTONE,
			v: cs2.to_s(),
			c: cs2
		}];
		//console.log('updatesForMakeReference',updates);
		return updates; 
	},
	
	createNewRecord: function(oid,cs) {
		var record= new this.storageModel();
		record.phantom= false;
		Ext.apply(record,Ext.data.SyncModel);
		record.setPair(Ext.data.SyncModel.OID,oid,cs);
		return record;
	},
	
	indexCreatedRecords: function(records, callback, scope) {
		//console.log('indexCreatedRecords');
		Ext.data.array.forEachAsync(records,function(record,next_callback,next_scope){
			var record_id= record.data[this.idProperty];
			if (record_id) {
				this.store.indexUpdate(record_id,record.data[Ext.data.SyncModel.OID],next_callback,next_scope);
			} else {
				next_callback.call(next_scope);
			}
		},this,callback,scope);
	},

	indexDestroyedRecords: function(records, callback, scope) {
		//console.log('indexDestroyedRecords');
		Ext.data.array.forEachAsync(records,function(record,next_callback,next_scope){
			var record_id= record.data[this.idProperty];
			if (record_id) {
				this.store.indexUpdate(record_id,undefined,next_callback,next_scope);
			} else {
				next_callback.call(next_scope);
			}
		},this,callback,scope);
	},

	makeGenerator: function() {
		var me= this;
		return function() { return me.generateChangeStamp() }
	},

  generateChangeStamp: function() {
		var cs= this.generator.get();
		this.csv.add(cs);
		return cs;
	},
	
	equals: function(x,callback,scope) { // for testing
		if (this.csv.equals(x.csv)) {
			this.hasSameRecords(x,function(r){
				if (r) {
					x.hasSameRecords(this,callback,scope)
				} else {
					callback.call(scope,false)
				}
			},this)
		} else {
			callback.call(scope,false)
		}
	},

	hasSameRecords: function(x,callback,scope) { // for testing
		this.forEachRecordAsync(function(r1,next_callback,next_scope){
			this.store.read(r1.oid(),function(r2) {
				if (r2) {
					r= r1.equals(r2);
					if (r) {
						next_callback.call(next_scope);
					} else {
						console.log('hasSameRecords - false - ',this.replicaNumber(),x.replicaNumber())
						callback.call(scope,false);
					}
				} else {
					console.log('hasSameRecords - false - ',this.replicaNumber(),x.replicaNumber())
					callback.call(scope,false);
				}
			},this);
		},this,function(){
			callback.call(scope,true);
		},this);
	},

	console_log: function(text,callback,scope) { // for testing
		console.log('---- ',text);
		this.forEachRecordAsync(function(r1,next_callback,next_scope){
			console.log(Ext.encode(r1.data));
			next_callback.call(next_scope);
		},this,function(){
			console.log('----');
			callback.call(scope);
		},this);
	},
		
	forEachRecordAsync: function(each_callback, each_scope, done_callback, done_scope) { // JCM this is expensive... nothing should really call this.....
		var Model= this.model;
		this.store.forEachRecordAsync(function(record,next_callback,next_scope){
			each_callback.call(each_scope,new Model(record.data),next_callback,next_scope); 
		},this,done_callback,done_scope);
	},

	encodeRecords: function(records) {
		var Model= this.storageModel;
		return Ext.data.array.collect(records,function(){ 
			var record= new Model(this.data);
			record.internalId= this.internalId;
			record.phantom= false;
			return record; 
		});
	},

	decodeRecords: function(records) {
		var Model= this.model;
		return Ext.data.array.collect(records,function(){
			var record= new Model(this.data);
			record.internalId= this.internalId;
			record.phantom= false;
			return record; 
		});
	},
	
	readConfig_DatabaseDefinition: function(config,callback,scope) {
		var default_data= {
			key: config.key,
			system_name: config.system_name,
			generation: 0,
			replica_number: 0
		};
		var overwrite_data= {
			database_name: config.database_name, 
			replica_type: config.replica_type
		};
		this.readConfig(Ext.data.DatabaseDefinition,'definition',default_data,overwrite_data,function(definition) {
			this.definition= definition;
			callback.call(scope);
		},this);
	},

	readConfig_Generator: function(config,callback,scope) {
		var overwrite_data= {
			r: this.definition.replica_number,
			clock: config.clock
		};
		this.readConfig(Ext.data.CSGenerator,'generator',{},overwrite_data,function(generator){
			this.generator= generator;
			callback.call(scope);
		},this); 
	},

	readConfig_CSV: function(config,callback,scope) {
		this.readConfig(Ext.data.CSV,'csv',{},{},function(csv){
			this.csv= csv;
			callback.call(scope);
		},this); 
	},
				
	writeConfig: function(id, object, callback, scope) {
		this.store.writeConfig(id,object.as_data(),function(data){
			object.set(data);
			callback.call(scope)
		},this);
	},

	readConfig: function(Klass, id, default_data, overwrite_data, callback, scope) {
		this.store.readConfig(id,function(data) {
			if (default_data!==undefined) {
				if (data===undefined) {
					data= default_data;
				} else {
					for(var name in default_data) {
						if (data[name]===undefined) {
							data[name]= default_data[name];
							changed= true;
						}
					}
				}
			}
			if (overwrite_data!==undefined) {
				if (data===undefined) {
					data= overwrite_data;
				} else {
					for(var name in overwrite_data) {
						if (data[name]!==overwrite_data[name]) {
							data[name]= overwrite_data[name];
							changed= true;
						}
					}
				}
			}
			var me= this;
			data.config_id= id;
			data.write_fn= function(object, write_callback, write_scope) { 
				me.writeConfig.call(me,id,object,write_callback,write_scope);
			};
			callback.call(scope,new Klass(data));
		},this);
	},

	doCallback: function(callback, scope, operation) {
    if (typeof callback == 'function') {
			callback.call(scope || this, operation);
    }
	},

	us: function(u) {
		var p= Ext.isArray(u.p) ? u.p.join() : u.p;
		var v= u.v;
		switch (typeof u.v) {
			case 'object':
				v= Ext.encode(u.v);
		}
		return '('+u.i+' . '+p+' = \''+v+'\' @ '+u.c.to_s()+')';
	}
	
});



Ext.data.SyncStorageProxy = Ext.extend(Ext.data.Proxy, {
	
	constructor: function(config) {
		//
		// JCM ensure that the url ends with a '/'
		config.url= config.url || "http://50.18.118.102/";
		Ext.data.utilities.check('SyncStorageProxy', 'constructor', 'config', config, ['id','url','key']);
		//
		Ext.data.SyncStorageProxy.superclass.constructor.call(this, config);
		//
		// Local Storage Proxy
		//
		config.database_name= config.id;
		config.datastore_name= 'data';
		config.localStorageProxy= config.localStorageProxy || Ext.data.ProxyMgr.create({
			type: 'localstorage',
			id: config.database_name
		});
		config.store= config.store || new Ext.data.SyncStore(config);
		//
		// Sync Storage Proxy (combines local and remote proxies)
		//
		this.proxy= new Ext.data.SyncProxy(config);
		Ext.data.utilities.delegate(this,this.proxy,['create','read','update','destroy','setModel']);
		//
		// Sync Protocol
		//
		this.protocol= new Ext.data.Protocol(config);
  },

  sync: function(callback,scope) {
		this.protocol.sync(this.proxy,callback,scope);
	},

});

Ext.data.ProxyMgr.registerType('syncstorage', Ext.data.SyncStorageProxy);


Ext.data.array= {
	
	select: function(a,fn,scope) {
		var r= [];
		if (a) {
			a.forEach(function(i) {
				if (i!==undefined && fn.call(scope||i,i)) { r.push(i) } 
			})
		}
		return r;
	},

	index: function(a,fn,scope) {
		if (a) {
			var j, l= a.length;
			for(var i= 0;i<l;i++) {
				j= a[i];
				if(fn.call(scope||j,j)) { return i }
			}
		}
	},

	collect: function(a,fn,scope) {
		var r= [];
		if (a) {
			a.forEach(function(i){ if (i!==undefined) { r.push(fn.call(scope||i,i)) }})
		}
		return r;
	},
	
	includes: function(a,v) {
		if (a) {
			var l= a.length;
			for(var i= 0;i<l;i++) {
				if(a[i]===v) { return true }
			}
		}
		return false;
	},

	remove: function(a,v) {
		var r= [];
		if (a) {
			var j, l= a.length;
			for(var i= 0;i<l;i++) {
				j= a[i];
				if(j!==v) { r.push(j) }
			}
		}
		return r;
	},

	any: function(a,fn,scope) {
		var j, l= a.length;
		for(var i= 0;i<l;i++) {
			j= a[i];
			if(fn.call(scope||j,j)) { return true }
		}
		return false
	},

	all: function(a,fn,scope) {
		var j, l= a.length;
		for(var i= 0;i<l;i++) {
			var j= a[i];
			if(!fn.call(scope||j,j)) { return false }
		}
		return true
	},
	
	forEachAsync: function(a,each_fn,each_scope,done_fn,done_scope) {
		if (!each_fn) { throw "ERROR - Ext.data.Array - forEachAsync - no 'each' function provided" }
		if (!done_fn) { throw "ERROR - Ext.data.Array - forEachAsync - no 'done' function provided" }
		var i= 0;
		var l= a.length;
		var f= function f() {
			if (i<l) {
				var j= a[i];
				var scope= each_scope||j;
				i= i+1;
				each_fn.call(scope,j,f,scope);
			} else {
				done_fn.call(done_scope);
			}
		};
		f();
	},

	forEachYielding: function(a,each_fn,each_scope,done_fn,done_scope) {
		var i= 0;
		var l= a.length;
		function f() {
			if (i<l) {
				each_fn.call(each_scope,a[i],function(){
					i= i+1;
					setTimeout(f,20); // ms
				},this);
			} else {
				done_fn.call(done_scope);
			}
		};
		f();
	}	
};




Ext.data.utilities= {

	delegate: function(from_instance, to_instance, methods) {
		if (to_instance===undefined) { throw "Error - Tried to delegate '"+methods+"' to undefined instance." }
		methods.forEach(function(method){
			var to_method= to_instance[method];
			if (to_method===undefined) { throw "Error - Tried to delegate undefined method '"+method+"' to "+to_instance }
			from_instance[method]= function() {
				return to_method.apply(to_instance, arguments);
			}
		})
	},
	
	apply: function(instance,methods,a,done_callback,done_scope) {
		var first= true;
		Ext.data.array.forEachAsync(methods,function(method,next_callback,next_scope){
			if (first) {
				a.push(next_callback);
				a.push(next_scope);
				first= false;
			}
			instance[method].apply(instance,a);
		},instance,done_callback,done_scope);
	},

	copy: function(from_instance,to_instance,properties) {
		var changed= false;
		properties.forEach(function(property){
			var from_v= from_instance[property]
			var to_v= to_instance[property]
			if (from_v!==undefined && from_v!==to_v) {
				to_instance[property]= from_v;
				changed= true;
			}
		});
		return changed;
	},

	copyIfUndefined: function(from_instance,to_instance,properties) {
		var changed= false;
		properties.forEach(function(property){
			var from_v= from_instance[property]
			var to_v= to_instance[property]
			if (from_v!==undefined && to_v===undefined) {
				to_instance[property]= from_v;
				changed= true;
			}
		});
		return changed;
	},

	check: function(class_name, method_name, instance_name, instance, properties) {
		if (instance===undefined) {
			var message= "Error - "+class_name+"."+method_name+" - "+instance_name+" not provided.";
			console.log(message);
			throw message;
		} else {
			properties.forEach(function(property) {
				var value= instance[property];
				if (value===undefined) {
					var message= "Error - "+class_name+"."+method_name+" - "+instance_name+"."+property+" not provided.";
					console.log(message);
					throw message;
				}
			});
		}
	},

	minus: function(a,b) { // minus(a,b) is all the name value pairs in a that are not in b 
		var n, r= {};
		for(n in a) {
			if (a.hasOwnProperty(n)) {
				if (b[n]===undefined) {
					r[n]= a[n];
				}
			}
		}
		return r;
	},
	
	intersection: function(a,b) { 
		var n, r= {};
		for(n in a) {
			if (a.hasOwnProperty(n)) {
				if (b[n]!==undefined) {
					r[n]= a[n];
				}
			}
		}
		return r;
	},
		
};



Ext.data.Clock = Ext.extend(Object, {
	
	constructor: function() {
		this.epoch= new Date(2011,0,1);
	},
	
  now: function() {
		return this.ms_to_s(new Date().getTime()-this.epoch);	
	},
	
	ms_to_s: function(ms) {
		return Math.floor(ms/1000);
	},
 
});

Ext.data.Config = Ext.extend(Object, {

	config_id: undefined,
	write_fn: undefined,
	_id: undefined,
	
	constructor: function(config) {
		this.config_id= config.config_id;
		this.write_fn= config.write_fn;
		this._id= config._id;
	},
	
	set: function(data) {
		this._id= data._id;
	},
	
	to_s: function(indent) {
		return this.config_id+": "+Ext.encode(this);
	},

	as_data: function(data) {
		data.id= this.config_id;
		data._id= this._id
		data[Ext.data.SyncModel.OID]= data[Ext.data.SyncModel.OID] || this.config_id;
		return data;
	},
	
	writeAndCallback: function(changed,callback,scope) {
		if (changed) {
			this.write(function(){
				if (callback) {
					callback.call(scope,this);
				}
			},this);
		} else {
			if (callback) {
				callback.call(scope,this);
			}
		}
	},
	
	write: function(callback,scope) {
		if (this.write_fn) {
			this.write_fn(this,function(){
				if (callback) {
					callback.call(scope,this);
				}
			},this);
		} else {
			if (callback) {
				callback.call(scope,this)
			}
		}
	},
	
});



Ext.data.CS = Ext.extend(Object, { // Change Stamp

	r: 0, // replica_number
	t: 0, // time, in seconds since the epoch
	s: 0, // sequence number

	constructor: function(config) {
		this.set(config);
	},
	
	set: function(x) {
		if (typeof x === 'string' || x instanceof String) {
			this.from_s(x)
		} else if (typeof x === 'object') {
			this.r= x.r||0;
			this.t= x.t||0;
			this.s= x.s||0;
		}
	},

	changeReplicaNumber: function(old_replica_number,new_replica_number) {
		if (this.r==old_replica_number) {
			this.r= new_replica_number;
			return true;
		}
		return false;
	},

 	greaterThan: function(x) { return this.compare(x)>0; },
 	lessThan: function(x) { return this.compare(x)<0; },
	equals: function(x) { return this.compare(x)===0 },
	compare: function(x) {
		var r= this.t-x.t
		if (r==0) {
			r= this.s-x.s;
			if (r==0) {
				r= this.r-x.r
			}
		}
		return r;
	},
	
	cs_regex: /(\d+)-(\d+)-?(\d+)?/,
	
	from_s: function(t) {
    var m= t.match(this.cs_regex);
		if (m && m.length>0) {
	    this.r= parseInt(m[1])
	    this.t= parseInt(m[2])
	    this.s= m[3] ? parseInt(m[3]) : 0
		} else {
			throw "Error - CS - Bad change stamp '"+t+"'."
		}
		return this;
	},
	
	to_s: function() {
		return this.r+"-"+this.t+(this.s>0 ? "-"+this.s : "");		
	}

});


Ext.data.CSGenerator = Ext.extend(Ext.data.Config, {

	r: undefined, // replica_number
	t: undefined, // time, in seconds since epoch
	s: undefined, // sequence number
	
	clock: undefined,
	local_offset: undefined,
	global_offset: undefined,
	
	constructor: function(config,callback,scope) {
		Ext.apply(this, config);
		config.config_id= 'generator';
		Ext.data.CSGenerator.superclass.constructor.call(this, config);
		this.clock= this.clock || new Ext.data.Clock();
	  this.t= this.t || this.clock.now();
	  this.s= this.s || -1; // so that the next tick gets us to 0
	  this.local_offset= this.local_offset || 0;
	  this.global_offset= this.global_offset || 0;
		this.writeAndCallback(true,callback,scope);
	},
	
  get: function(callback,scope) { // the next change stamp
    var current_time= this.clock.now();
    this.update_local_offset(current_time);
    this.s+= 1;
    if (this.s>255) { // JCM This is totally arbitrary, and it's hard coded too....
      this.t= current_time;
      this.local_offset+= 1;
      this.s= 0;
    }
		this.writeAndCallback(true,callback,scope);
		// JCM it seems wrong to use the CS until it has been committed to disk...
		var r= new Ext.data.CS({r:this.r,t:this.global_time(),s:this.s});
    return r; // JCM return in the callback 
  },

  seen: function(cs,callback,scope) { // a change stamp we just received
		if(cs){
			var changed= false;
	    var current_time= this.clock.now();
			if (current_time>this.t) {
		    changed= this.update_local_offset(current_time);
			}
	    changed= changed||this.update_global_offset(cs);
			this.writeAndCallback(changed,callback,scope);
		}
  },
  
  setReplicaNumber: function(replica_number,callback,scope) {
		var changed= this.r!==replica_number;
		this.r= replica_number;
		this.writeAndCallback(changed,callback,scope);
  },

	// private
  
  update_local_offset: function(current_time) {
		var changed= false;
    var delta= current_time-this.t;
    if (delta>0) { // local clock moved forwards
      var local_time= this.global_time();
      this.t= current_time;
      if (delta>this.local_offset) {
        this.local_offset= 0;
      } else {
        this.local_offset-= delta;
      }
      var local_time_after= this.global_time();
			if (local_time_after>local_time) {
      	this.s= -1;
			}
			changed= true;
    } else if (delta<0) { // local clock moved backwards
      // JCM if delta is too big, then complain
      this.t= current_time;
      this.local_offset+= -delta;
			changed= true;
    }
		return changed;
	},
	
	update_global_offset: function(remote_cs) {
		var changed= false;
    var local_cs= new Ext.data.CS({r:this.r,t:this.global_time(),s:this.s+1})
    var local_t= local_cs.t;
    var local_s= local_cs.s;
    var remote_t= remote_cs.t;
    var remote_s= remote_cs.s;
    if (remote_t==local_t && remote_s>=local_s) {
		  this.s= remote_s;
			changed= true;
    } else if (remote_t>local_t) {
      var delta= remote_t-local_t;
  		if (delta>0) { // remote clock moved forwards
  		  // JCM guard against moving too far forward
      	this.global_offset+= delta;
    		this.s= remote_s;
				changed= true;
      }
  	}
		return changed; 
  },

  global_time: function() {
    return this.t+this.local_offset+this.global_offset;
	},
	
	as_data: function() {
		var data= {
			r: this.r,
			t: this.t,
			s: this.s,
			local_offset: this.local_offset,
			global_offset: this.global_offset,
		};
		data[Ext.data.SyncModel.MODEL]= 'Ext.data.CSGenerator';
		return Ext.data.CSGenerator.superclass.as_data.call(this, data);
	},
	
});


Ext.data.CSV = Ext.extend(Ext.data.Config, {

	v: undefined, // array of change stamps

	constructor: function(config,callback,scope) {
		var changed= false;
		if (config) {
			config.config_id= 'csv';
			Ext.data.CSV.superclass.constructor.call(this, config);
			if (config.v) {
				this.v= [];
				this.do_add(config.v);
			}
		}
		if (this.v===undefined) {
			this.v= [];
			changed= true;
		}
		this.writeAndCallback(changed,callback,scope);
	},
	
	add: function(x,callback,scope) {
		var changed= this.do_add(x);
		this.writeAndCallback(changed,callback,scope);
		return this; // JCM should force use of callback?
	},
	
	get: function(cs) {
		return this.v[cs.r];
	},
	
	setReplicaNumber: function(replica_number,callback,scope) {
		this.addReplicaNumbers([replica_number],callback,scope);
	},
	
	addReplicaNumbers: function(x,callback,scope) {
		var t= [];
		if (x instanceof Array) {
			t= Ext.data.array.collect(x,function(r){return this.do_add(new Ext.data.CS({r:r}))},this);
		} else if (x instanceof Ext.data.CSV) {
			t= Ext.data.array.collect(x.v,function(cs){return this.do_add(new Ext.data.CS({r:cs.r}))},this);
		}
		var changed= Ext.data.array.includes(t,true);
		this.writeAndCallback(changed,callback,scope);
	},

	do_add: function(x) { // CSV, CS, '1-2-3', [x]
		var changed= false;
		if (x instanceof Ext.data.CSV) {
			var t= Ext.data.array.collect(x.v,this.do_add,this);
			changed= Ext.data.array.includes(t,true);
		} else if (x instanceof Ext.data.CS) {
			var r= x.r;
			var t= this.v[r];
			if (!t || x.greaterThan(t)) {
			  this.v[r]= new Ext.data.CS({r:x.r,t:x.t,s:x.s})
				changed= true;
			}
		} else if (typeof x == 'string' || x instanceof String) {
			changed= this.do_add(new Ext.data.CS(x));
		} else if (x instanceof Array) {
			var t= Ext.data.array.collect(x,this.do_add,this);
			changed= Ext.data.array.includes(t,true);
		} else {
			throw "Error - CSV - do_add - Unknown type: "+(typeof x)+": "+x
		}
		return changed;
	},

	changeReplicaNumber: function(old_replica_number,new_replica_number,callback,scope) {
		var t= this.v[old_replica_number];
		var changed= false;
		if (t) {
			t.r= new_replica_number;
			this.v[old_replica_number]= undefined;
			this.v[new_replica_number]= t;
			changed= true;
		}
		this.writeAndCallback(changed,function(){
			callback.call(scope,this,changed);
		},this);
	},

	isEmpty: function() { 
		return this.v.length<1;
	},
		
	maxChangeStamp: function() {
		if (!this.isEmpty()) {
			var r= new Ext.data.CS();
			this.v.forEach(function(cs){
				var t= new Ext.data.CS({t:cs.t,s:cs.s});
				r= (t.greaterThan(r) ? cs : r);
			},this)
			return r;
		}
	},

	dominates: function(x) {
		return Ext.data.array.any(this.compare(x),function(i){ return i>0 });
	},

	equals: function(x) {
		return Ext.data.array.all(this.compare(x),function(i){ return i===0 });
	},
	
	compare: function(x) {
		if (x instanceof Ext.data.CS) {
			var cs= this.get(x);
			return [cs ? cs.compare(x) : -1];
		} else if (x instanceof Ext.data.CSV) {		
			var r= [];
			for(i in this.v) {
				var cs= this.v[i];
				if (cs instanceof Ext.data.CS) {
					var cs2= x.get(cs);
					r.push(cs2 ? cs.compare(cs2) : 1);
				}
			}
			return r;
		} else {
			throw "Error - CSV - compare - Unknown type: "+(typeof x)+": "+x
		}
		return [-1];
	},
	
	forEach: function(fn,scope) {
		this.v.forEach(fn,scope||this)
	},
	
	encode: function() { // for the wire
		return Ext.data.array.collect(this.v,function(){
			// JCM can we safely ignore replicas with CS of 0... except for the highest known replica number...
			return this.to_s();
		}).join('.');
	},
	
	decode: function(x) { // from the wire
		if(x){
			this.do_add(x.split('.'));
		}
		return this;
	},
	
	to_s: function(indent) {
		var r= "CSV: "
		this.v.forEach(function(cs){
			r+= cs.to_s()+", "
		},this)
		return r;
	},

	as_data: function() { // for the disk
		var data= {
			v: Ext.data.array.collect(this.v,function(){return this.to_s();}),
		};
		data[Ext.data.SyncModel.MODEL]= 'Ext.data.CSV';
		return Ext.data.CSV.superclass.as_data.call(this, data);
	},
		
});

Ext.data.DatabaseDefinition = Ext.extend(Ext.data.Config, {

	key: undefined, // the developer's api key
	database_name: undefined,
	generation: undefined, // of the database
	system_name: undefined, // this system
	system_names: {}, // other systems
	replica_number: undefined,
	idProperty: undefined,
	idPropertyDefaultValue: undefined,
	version: 1, // of the storage scheme
	
	// JCM include the epoch of the clock here?
	
	constructor: function(config,callback,scope) {
		//
		Ext.data.utilities.check('DatabaseDefinition', 'constructor', 'config', config, ['key','database_name','generation','system_name','replica_number']);
		//
		this.set(config);
		config.config_id= 'definition';
		Ext.data.DatabaseDefinition.superclass.constructor.call(this, config);
	},

	setReplicaNumber: function(replica_number,callback,scope) {
		var changed= (this.replica_number!=replica_number); 
		this.replica_number= replica_number;
		this.writeAndCallback(changed,callback,scope);
	},
	
	addSystemName: function(system_name) {
		this.system_names[system_name]= true;
		// JCM this.writeAndCallback(changed,callback,scope);
	},
	
	isKnownOf: function(system_name) {
		return this.system_name===system_name || Ext.data.array.includes(this.system_names,system_name);
	},

	set: function(config,callback,scope) {
		var changed= Ext.data.utilities.copy(config,this,[
			'key',
			'database_name',
			'generation',
			'system_name',
			'system_names',
			'replica_number',
			'idProperty',
			'idPropertyDefaultValue',
			'version',
			'_id']);
		this.writeAndCallback(changed,callback,scope);
	},

	as_data: function() { // to store on the disk
		var data= {
			key: this.key,
			database_name: this.database_name,
			generation: this.generation,
			system_name: this.system_name,
			system_names: this.system_names,
			replica_number: this.replica_number,
			idProperty: this.idProperty,
			idPropertyDefaultValue: this.idPropertyDefaultValue,
			version: this.version,
		};
		data[Ext.data.SyncModel.MODEL]= 'Ext.data.DatabaseDefinition';
		return Ext.data.DatabaseDefinition.superclass.as_data.call(this, data);
	},

	encode: function() { // to send over the wire
		return {
			key: this.key,
			database_name: this.database_name,
			generation: this.generation,
			system_name: this.system_name,
			replica_number: this.replica_number,
			idProperty: this.idProperty,
			idPropertyDefaultValue: this.idPropertyDefaultValue,
		};
	},

	// JCM perhaps an explicit decode would be better than the constructor?

});


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


// JCM this 'class' could help with batching updates to be sent to the server

Ext.data.Updates = Ext.extend(Object, {

	updates: undefined,
	
	constructor: function(x) {
		//
		// sort the updates into change stamp order,
		// as they have to be transmitted this way
		//
		this.updates= x||[];
		this.updates.forEach(function(update) {
			if (!(update.c instanceof Ext.data.CS)) {
				update.c= new Ext.data.CS(update.c)
			}
		});
		this.updates.sort(function(a,b) {return a.c.compare(b.c)});
		// JCM var prev;
		// JCM this.updates.forEach(function(update) {
		// JCM 	if (prev && !update.c.greaterThan(prev.c)) { throw "Error - Updates - Updates were in wrong order. "+Ext.encode(update)+" <= "+Ext.encode(prev) }
		// JCM 	prev= update
		// JCM });
	},
	
	push: function(update) {
		// update must have a cs greater than the last element
		var last= this.updates[this.updates.length];
		if (!update.c.greaterThan(last.c)) { throw "Error - Updates - Tried to push updates in wrong order. "+Ext.encode(update)+" <= "+Ext.encode(last) }
		this.updates.push(update);
	},
	
	isEmpty: function() {
		return this.updates.length<1;
	},

	forEach: function(callback,scope) {
		this.updates.forEach(callback,scope);
	},

	forEachAsync: function(each_callback,each_scope,done_callback,done_scope) {
		Ext.data.array.forEachAsync(this.updates,each_callback,each_scope,done_callback,done_scope);
	},
	
	chunks: function(chunk_size) {
		var r= [];
		var l= this.updates.length;
		var n= (l/chunk_size)+1;
		for(var i=0;i<n;i++) {
			var start= i*chunk_size;
			var end= start+chunk_size;
			var t= new Ext.data.Updates();
			t.updates= this.updates.slice(start,end)
			r.push(t);
		}
		return r;
	},

	decode: function(x) {
		this.updates= [];
		if (x) {
			var l= x.length;
			var update, prev_i, id, p, v, c;
			for(var i=0;i<l;i++) {
				update= x[i];
				switch(update.length) {
					case 3:
						id= prev_i;
						p= update[0];
						v= update[1];
						c= update[2];
						break;
					case 4:
						id= update[0];
						p= update[1];
						v= update[2];
						c= update[3];
						prev_i= id;
						break;
				}
				c= ((c instanceof Ext.data.CS) ? c : new Ext.data.CS(c));
				this.updates.push({i:id,p:p,v:v,c:c});
			}
		}
		return this;
	},
	
	encode: function() {
		// JCM optimize - "" around i and p and cs is not needed
		// JCM optimize - diff encode cs 1-123, +1-0, +0-1, 1-136-4, +1-0, ...
		var r= [];
		var l= this.updates.length;
		var prev_i, update, cs;
		for(var i=0;i<l;i++) {
			update= this.updates[i];
			cs= ((update.c instanceof Ext.data.CS) ? update.c.to_s() : update.c);
			if (update.i===prev_i) {
				r.push([update.p, update.v, cs]);
			} else {
				r.push([update.i, update.p, update.v, cs]);
				prev_i= update.i;
			}
		}
		return r;
	},
		
});

  
  


Ext.data.UUIDGenerator= {
	
	generate: function() { // totally random uuid
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		});
	},

};

// this model is used to extend the user's own model.
// it adds the replication state.

Ext.data.SyncModel= {
	
	STATE: '_state',
	TOMBSTONE: '_ts',
	OID: '_oid',
	REF: '_ref',
	MODEL: '_model',
	
	state: undefined,
	
	createReplStorageModel: function(modelName) { // create the storage model, based on the user model

		var augmented_fields= this.fields.items.slice(0);
		augmented_fields= augmented_fields.concat([
			{name: '_state'},
			{name: '_ts'},
			{name: '_oid'},
			{name: '_ref'},
			{name: '_model'}
		]);

		// JCM could the local storage proxy be added to the storage model...?

		var StorageModel= Ext.regModel("Sencha.StorageModel."+modelName, {
			fields: augmented_fields,
			idProperty: Ext.data.SyncModel.OID
		});
		
		return StorageModel;
  },

	oid: function() {
		return this.data[Ext.data.SyncModel.OID];
	},

	ref: function() {
		return this.data[Ext.data.SyncModel.REF];
	},
	
	userData: function() {
		var r= {};
		for(var i in this.data) {
			if (i[0]!=="_") {
				r[i]= this.data[i];
			}
		}
		return r;
	},
	
	isSystemModel: function() {
		var model_name= this.data[Ext.data.SyncModel.MODEL];
		return model_name!==undefined && model_name.indexOf("Ext.data.",0)===0;
	},

	changeReplicaNumber: function(old_replica_number,new_replica_number) {
		this.setup();
		var changed= false;
		this.forEachCS(this.state,function(cs) {
			var t= cs.changeReplicaNumber(old_replica_number,new_replica_number)
			changed= changed || t;
			return cs;
		},this);
		var v= this.oid();
		if (v) {
			var id_cs= new Ext.data.CS(v);
			if (id_cs.changeReplicaNumber(old_replica_number,new_replica_number)) {
				this.data[Ext.data.SyncModel.OID]= id_cs.to_s();
				changed= true;
			}
		}
		return changed;
	},

	setCreateState: function(generator) {
		if(this.data[Ext.data.SyncModel.OID]){
			console.log('Error: Record has already been created.',Ext.encode(this.data));
		}else{
			this.state= {};
			var cs= generator();
			this.setPair(Ext.data.SyncModel.OID,cs.to_s(),cs);
			this.forEachValue(this.data,[],function(path,value) {
				if (path[0]!==Ext.data.SyncModel.OID) {
					this.setCS(path,generator());
				}
			},this);
		}
	},
	
	setUpdateState: function(generator) {
		var changes= this.getChanges();
		for (name in changes) {
			if (name!==Ext.data.SyncModel.STATE && name!==Ext.data.SyncModel.OID) {
				this.setUpdateStateValue([name],this.modified[name],changes[name],generator);
			}
		}
	},
	
	setUpdateStateValue: function(path,before_value,after_value,generator) {
		//console.log('setUpdateStateValue',path,before_value,after_value)
		if (this.isComplexValueType(after_value)) {
			if (before_value) {
				var added= {};
				if (this.isComplexValueType(before_value)) {
					if (this.valueType(before_value)===this.valueType(after_value)) {
						added= Ext.data.utilities.minus(after_value,before_value);
						var changed= Ext.data.utilities.intersection(after_value,before_value);
						for(var name2 in changed) {
							if (changed.hasOwnProperty(name2)) {							
								if (before_value[name2]!==after_value[name2]) {
									added[name2]= after_value[name2]
								}
							}
						}
					} else {
						added= after_value;
						this.setCS(path,generator()); // value had a different type before, a complex type
					}
				} else {
					added= after_value;
					this.setCS(path,generator()); // value had a different type before, a primitive type
				}
			} else {
				added= after_value;
				this.setCS(path,generator()); // value didn't exist before
			}
			for(var name2 in added) {
				if (added.hasOwnProperty(name2)) {
					var next_before_value= before_value ? before_value[name2] : undefined;
					this.setUpdateStateValue(path.concat(name2),next_before_value,after_value[name2],generator);
				}
			}
		} else {
			this.setCS(path,generator()); // value has a primitive type
		}
	},

	setDestroyState: function(generator) {
		var cs= generator();
		this.data[Ext.data.SyncModel.TOMBSTONE]= cs.to_s();
		this.setCS(Ext.data.SyncModel.TOMBSTONE,cs);
	},

	isNotDestroyed: function() { // test if a record has been deleted
		var t= this.data[Ext.data.SyncModel.TOMBSTONE]
		return (t===undefined || t==='');
	},
	
	getUpdates: function(csv) {
		//console.log('updates',Ext.encode(csv))
		this.setup();
		var updates= [];
		var oid= this.oid();
		this.forEachPair(this.data,this.state,[],[],function(path,values,cs){
			if (cs) {
				var cs2= csv.get(cs);
				if (!cs2 || cs2.lessThan(cs)) {
					updates.push({
						i: oid,
						p: path.length==1 ? path[0] : path, 
						v: values.length==1 ? values[0] : values, 
						c: cs
					});
				}
			}
		},this);
		if(updates.length>0){
			console.log('updates',Ext.encode(updates))
		}
		return updates;
	},
	
	putUpdate: function(update) {
		//console.log('applyUpdate',update)
		return this.setPair(update.p,update.v,update.c);
	},
	
	equals: function(r) {
		this.forEachPair(this.data,this.state,[],[],function(path,values,cs) {
			var p= r.getPair(path);
			var value= values[values.length-1];
			if (!(cs.equals(r.c) && value===r.v)) {
				return false;
			}
		},this);
		return true;
	},

	forEachPair: function(data,state,path,values,callback,scope) {
		//console.log('forEachPair',Ext.encode(data),Ext.encode(state),Ext.encode(path),Ext.encode(values));
		this.setup();
		for(var name in state) {
			if (state.hasOwnProperty(name)) {
				var new_state= state[name];
				var new_data= data[name];
				var new_path= path.concat(name);
				var new_data_type= this.valueType(new_data);
				var new_value;
				switch (new_data_type) {
					case 'object':
						new_value= {};
						break;
					case 'array':
						new_value= [[]];
						break;
					default:
						new_value= new_data;
				}
				var new_values= values.concat(new_value);
				switch (this.valueType(new_state)) {
					case 'string':
						callback.call(scope,new_path,new_values,new Ext.data.CS(new_state));
						break;
					case 'array':
						switch (new_data_type) {
							case 'undefined':
								console.log('Warning - There was no data for the state at path',new_path);
								console.log('Warning -',Ext.encode(this.data));
								break;
							case 'object':
							case 'array':
								callback.call(scope,new_path,new_values,new Ext.data.CS(new_state[0])); // [cs,state]
								this.forEachPair(new_data,new_state[1],new_path,new_values,callback,scope); // [cs,state]
								break;
							default:
								callback.call(scope,new_path,new_values,new Ext.data.CS(new_state[0])); // [cs,state]
								break;
						}
						break;
				}
			}
		}
	},	
			
	forEachValue: function(data,path,callback,scope) {
    var n, v;
		for(n in data) {
			if (data.hasOwnProperty(n)) {
				v= data[n];
				if (v!==this.state) {
					var path2= path.concat(n);
					callback.call(scope,path2,v);
					if (this.isComplexValueType(v)) {
						this.forEachValue(v,path2,callback,scope);
					}
				}
			}
		}
	},

	getCSV: function() {
		var csv= new Ext.data.CSV();
		this.forEachCS(this.state,function(cs) {
			csv.add(cs);
		},this);
		return csv;
	},

	forEachCS: function(state,callback,scope) {
		for(name in state) {
			if (state.hasOwnProperty(name)) {
				var next_state= state[name];
				switch (this.valueType(next_state)) {
					case 'string':
						var cs= callback.call(scope,new Ext.data.CS(next_state));
						if (cs) { state[name]= cs.to_s(); }
						break;
					case 'array':
						var cs= callback.call(scope,new Ext.data.CS(next_state[0]));
						if (cs) { state[name][0]= cs.to_s(); } // [cs,state]
						this.forEachCS(next_state[1],callback,scope); // [cs,state]
						break;
				}
			}
		}
	},

	getCS: function(path) {
		this.setup();
		var state= this.state;
		if (Ext.isArray(path)) {
			var l= path.length;
			var e= l-1;
			for(var i=0;i<l;i++) {
				var name= path[i];
				if (i===e) {
					return this.do_getCS(state,name);
				} else {
					state= this.do_getState(state,name);
				}
			}
		} else {
			return this.do_getCS(state,path);
		}
	},
	
	do_getCS: function(state,name) {
		var cs= undefined;
		var state= state[name];
		if (state) {
			switch (this.valueType(state)) {
				case 'string':
					cs= new Ext.data.CS(state);
					break;
				case 'array':
					cs= new Ext.data.CS(state[0]); // [cs,state]
					break;
				default:
					console.log("Error - SyncModel - do_getCS - unexpected type in state for",name,":",typeof state,state);
					console.log('state',Ext.encode(this.data));
					cs= new Ext.data.CS();
					break;
			}
		} // else undefined
		return cs;
	},

	setCS: function(path,cs) {
		//console.log('setCS',Ext.isArray(path) ? path.join() : path,cs.to_s())
		this.setup();
		var state= this.state;
		if (Ext.isArray(path)) {
			var l= path.length;
			var e= l-1;
			for(var i=0;i<l;i++) {
				var name= path[i];
				if (i===e) {
					this.do_setCS(state,name,cs);
				} else {
					state= this.do_getState(state,name);
				}
			}
		} else {
			this.do_setCS(state,path,cs);
		}
	},
	
	do_setCS: function(state,name,cs) {
		var cs_s= (cs instanceof Ext.data.CS) ? cs.to_s() : cs;
		var state2= state[name];
		if (state2) {
			switch (this.valueType(state2)) {
				case 'string':
					state[name]= cs_s;
					break;
				case 'array':
					// JCM it should always be the case that the cs passed in should
					// JCM be larger than the existing cs... otherwise we have gone
					// JCM back in time somehow....
					state2[0]= cs_s; // [cs,state]
					break;
				default:
					console.log("Error - SyncModel - do_setCS - unexpected type in state for",name,":",typeof state2,state2);
					console.log('state',Ext.encode(state));
					console.log('name',name,'cs',cs_s);
					state[name]= cs_s;
			}
		} else {
			state[name]= cs_s;
		}
		//console.log('do_setCS',name,cs_s,Ext.encode(state))
	},

	getPair: function(path) {
		this.setup();
		var data= this.data;
		var state= this.state;
		if (Ext.isArray(path)) {
			var l= path.length;
			var e= l-1;
			for(var i=0;i<l;i++) {
				var name= path[i];
				if (i===e) {
					return {
						v: data ? data[name] : data,
						c: this.do_getCS(state,name)
					};
				} else {
					state= this.do_getState(state,name);
					data= data ? data[name] : data;
				}
			}
		} else {
			return {
				v: data[path],
				c: this.do_getCS(state,path)
			};
		}
	},
			
	setPair: function(path,values,new_cs) {
		//console.log('setPair',Ext.encode(path),Ext.encode(values),Ext.encode(new_cs));
		//console.log('setPair',Ext.encode(this.data));
		var changed= false;
		this.setup();
		if (!Ext.isArray(path)) {
			path= [path];
			values= [values];
		}
		var data= this.data;
		var state= this.state;
		var l= path.length;
		var e= l-1;
		for(var i=0;i<l;i++) {
			var name= path[i];
			var new_value= values[i]; 
			var old_cs= this.do_getCS(state,name);
			var old_value= data[name];
			var old_value_type= this.valueType(old_value);
			var new_value_type= this.valueType(new_value);
			var sameComplexType= 
				((old_value_type==='object' && new_value_type==='object') ||
				(old_value_type==='array' && new_value_type==='array'));
			if (old_cs) {
				if (new_cs.greaterThan(old_cs)) {
					if (sameComplexType) {
						new_value= undefined; // re-assert, don't overwrite
					}
					// new_cs is gt old_cs, so accept update
					if (this.do_setPair(data,state,name,new_value,new_cs)) {
						changed= true;
					}
				} else {
					// new_cs is not gt old_cs
					if (sameComplexType) {
						// but this value type along the path is the same, so keep going... 
					} else {
						// and this type along the path is not the same, so reject the update.
						return changed;
					}
				}
			} else {
				// no old_cs, so accept update
				if (this.do_setPair(data,state,name,new_value,new_cs)) {
					changed= true;
				}
			}
			if (i!==e) {
				data= this.do_getData(data,name);
				state= this.do_getState(state,name,new_cs);
			}
		}
		//console.log('setPair => ',Ext.encode(this.data));
		return changed;
	},
	
	do_getState: function(state,name,cs) {
		var next_state= state[name];
		switch (this.valueType(next_state)) {
			case 'undefined':
				var new_state= {};
				state[name]= [cs,new_state];
				state= new_state;
				break;
			case 'string':
				var new_state= {};
				state[name]= [next_state,new_state];
				state= new_state;
				break;
			case 'array':
				state= next_state[1];
				break;
			default:
				throw "Error - SyncModel - do_getState - unexpected type in state: "+(typeof next_state)+" "+next_state
		}
		return state;
	},
	
	do_setPair: function(data,state,name,new_value,new_cs) {
		var changed= false;
		if (new_value!==undefined) {
			this.do_setData(data,name,new_value)
			changed= true;
		}
		if (new_cs!==undefined) { 
			this.do_setCS(state,name,new_cs);
			changed= true;
		}
		return changed;
	},
	
	do_getData: function(data,name) {
		return data[name];
	},

	do_setData: function(data,name,value) {
		//console.log(Ext.encode(data),"[",name,"]=",Ext.encode(value));
		data[name]= value;
	},
	
	valueType: function(value) { // returns undefined, number, boolean, string, object, array
		var t= typeof value;
		if (t==='object' && (value instanceof Array)) {
			t= 'array';
		}
		return t;
	},
	
	valueEquals: function(v1,v2) {
		var r= false;
		var t1= this.valueType(v1);
		var t2= this.valueType(v2);
		if (t1===t2) {
			switch (t1) {
			case 'object':
			case 'array':
				r= Ext.encode(v1)===Ext.encode(v2); // JCM I'm sure there's a better way to do this...
				break;
			default:
				r= v1===v2;
			}
		}
		return r;
	},
	
	isComplexValueType: function(value) { // return true for an object or an array
		return (typeof value==='object');
	},
	
	setup: function() {
		this.data[Ext.data.SyncModel.STATE]= this.data[Ext.data.SyncModel.STATE] || {};
		this.state= this.data[Ext.data.SyncModel.STATE];
	}
		
};


