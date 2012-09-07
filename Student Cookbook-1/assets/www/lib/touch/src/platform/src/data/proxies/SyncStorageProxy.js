
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
