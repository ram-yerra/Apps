/**
 * @class Ext.DataPanel
 * @extends Ext.Panel
 * <p>Base class for all data-bound panels. This shouldn't be used directly, instead use a subclass like {@link Ext.DataView} or {@link Ext.List}.</p>
 * <strong>This class has been deprecated. Please don't use this directly as it will be removed in the RC1.</strong>
 * @xtype datapanel
 * @ignore
 */
Ext.DataPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String/Array} tpl
     * The HTML fragment or an array of fragments that will make up the template used by this DataView.  This should
     * be specified in the same format expected by the constructor of {@link Ext.XTemplate}.
     */

    /**
     * @cfg {Ext.data.Store} store
     * The {@link Ext.data.Store} to bind this DataView to.
     */

    /**
     * @cfg {String} itemSelector
     * <b>This is a required setting</b>. A simple CSS selector (e.g. <tt>div.some-class</tt> or
     * <tt>span:first-child</tt>) that will be used to determine what nodes this DataView will be
     * working with.
     */
    
    /**
     * @cfg {Boolean} addRecordToData Usually when rendering via the template, only the record's data is accessible. Setting this
     * to true adds a reference to the record itself, allowing the template to access model methods and associations. False by default.
     * This can also be set to a string, which will be used as the key to add the record under (defaults to 'record').
     */
    
    /**
     * @cfg {Boolean} blockRefresh Set this to true to ignore datachanged events on the bound store. This is useful if
     * you wish to provide custom transition animations via a plugin (defaults to false)
     */
    blockRefresh: false,

    // @private
    initComponent: function() {
        if (Ext.isString(this.tpl) || Ext.isArray(this.tpl)) {
            this.tpl = new Ext.XTemplate(this.tpl);
        }

        this.store = Ext.StoreMgr.lookup(this.store);
        this.all = new Ext.CompositeElementLite();
        this.instances = new Ext.util.MixedCollection();

        if (this.components) {
            if (Ext.isFunction(this.components)) {
                this.components = [{config: this.components}];
            }
            else if (Ext.isObject(this.components)) {
                this.components = [this.components];
            }     
            if (!this.tpl) {
                this.tpl = new Ext.XTemplate('<tpl for="."><div class="x-list-item"></div></tpl>', {compiled: true});
                this.itemSelector = '.x-list-item';
            }         
        }
        
        this.addEvents('refresh');
        
        if (this.itemSelector == undefined) {
            throw new Error("You have not specified an itemSelector for your DataPanel/DataView class. This is a required configuration");
        }
        
        Ext.DataPanel.superclass.initComponent.call(this);
    },


    // @private
    afterRender: function(){
        Ext.DataPanel.superclass.afterRender.call(this);

        var components = this.components,
            ln, i, component, delegate;        
        if (components) {
            for (i = 0, ln = components.length; i < ln; i++) {
                component = components[i];
                if (component.listeners) {
                    component.delegateCls = Ext.id(null, 'x-cmp-');
                    component.listeners.delegate = (component.targetSelector || this.itemSelector) + ' > .' + component.delegateCls;
                    this.mon(this.getTemplateTarget(), component.listeners);                    
                }
            }
        }
        
        if (this.store) {
            this.bindStore(this.store, true);
        }
    },

    /**
     * Returns the store associated with this DataPanel.
     * @return {Ext.data.Store} The store
     */
    getStore: function(){
        return this.store;
    },

    /**
     * @param {Boolean} force Whether or not to force refreshing and ignore blockRefresh, defaults to true
     * Refreshes the view by reloading the data from the store and re-rendering the template.
     */
    refresh: function(force) {
        var me = this,
            scroller = me.scroller;
            
        if (force == undefined) {
            force = true;
        }

        if (!force && me.blockRefresh === true) {
            return;
        }

        if (!me.rendered) {
            return;
        }

        var el = me.getTemplateTarget(),
            records = me.getRenderRecords();
        if (records.length < 1) {
            me.all.clear();
        }
        else {
            me.tpl.overwrite(el, me.collectData(records, 0));
            me.all.fill(Ext.query(me.itemSelector, el.dom));
        }
        me.updateItems(0);
        if (scroller && scroller.updateBounary) {
            scroller.updateBoundary(true);
        }
        me.fireEvent('refresh', me, records);
    },

    /**
     * @private
     * This is called inside refresh and can be overriden in the
     * case you only want to render a certain range of the records.
     * This is done for example in the Carousel.
     */
    getRenderRecords : function() {
        return this.store.getRange();
    },
    
    // Inherited Docs
    getTemplateTarget: function() {
        return this.scrollEl || this.body;
    },

    /**
     * <p>Function which can be overridden to provide custom formatting for each Record that is used by this
     * DataPanel's {@link #tpl template} to render each node.</p>
     * @param {Array/Object} data The raw data object that was used to create the Record.
     * @param {Number} recordIndex the index number of the Record being prepared for rendering.
     * @param {Record} record The Record being prepared for rendering.
     * @return {Array/Object} The formatted data in a format expected by the internal {@link #tpl template}'s overwrite() method.
     * (either an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'}))
     */
    prepareData: function(data, index, record) {
        var addRecordToData = this.addRecordToData,
            shouldAdd       = !!addRecordToData,
            recordKey       = Ext.isString(addRecordToData) ? addRecordToData : 'record';
        
        if (record) {
            if (shouldAdd) {
                data[recordKey] = record;
            }
    
            Ext.apply(data, this.prepareAssociatedData(record));            
        }
    
        return data;
    },
    
    /**
     * @private
     * This complex-looking method takes a given Model instance and returns an object containing all data from
     * all of that Model's *loaded* associations. It does this recursively - for example if we have a User which
     * hasMany Orders, and each Order hasMany OrderItems, it will return an object like this:
     * 
     * {
     *     orders: [
     *         {
     *             id: 123,
     *             status: 'shipped',
     *             orderItems: [
     *                 ...
     *             ]
     *         }
     *     ]
     * }
     * 
     * This makes it easy to iterate over loaded associations in a DataView.
     * 
     * @param {Ext.data.Model} record The Model instance
     * @param {Array} ids PRIVATE. The set of Model instance internalIds that have already been loaded
     * @return {Object} The nested data set for the Model's loaded associations
     */
    prepareAssociatedData: function(record, ids) {
        //we keep track of all of the internalIds of the models that we have loaded so far in here
        ids = ids || [];
        
        var associations     = record.associations.items,
            associationCount = associations.length,
            associationData  = {},
            associatedStore, associatedName, associatedRecords, associatedRecord,
            associatedRecordCount, association, internalId, i, j;
        
        for (i = 0; i < associationCount; i++) {
            association = associations[i];
            
            //this is the hasMany store filled with the associated data
            associatedStore = record[association.storeName];
            
            //we will use this to contain each associated record's data
            associationData[association.name] = [];
            
            //if it's loaded, put it into the association data
            if (associatedStore && associatedStore.data.length > 0) {
                associatedRecords = associatedStore.data.items;
                associatedRecordCount = associatedRecords.length;
            
                //now we're finally iterating over the records in the association. We do this recursively
                for (j = 0; j < associatedRecordCount; j++) {
                    associatedRecord = associatedRecords[j];
                    internalId = associatedRecord.internalId;
                    
                    //when we load the associations for a specific model instance we add it to the set of loaded ids so that
                    //we don't load it twice. If we don't do this, we can fall into endless recursive loading failures.
                    if (ids.indexOf(internalId) == -1) {
                        ids.push(internalId);
                        
                        associationData[association.name][j] = associatedRecord.data;
                        Ext.apply(associationData[association.name][j], this.prepareAssociatedData(associatedRecord, ids));
                    }
                }
            }
        }
        
        return associationData;
    },

    /**
     * <p>Function which can be overridden which returns the data object passed to this
     * DataPanel's {@link #tpl template} to render the whole DataPanel.</p>
     * <p>This is usually an Array of data objects, each element of which is processed by an
     * {@link Ext.XTemplate XTemplate} which uses <tt>'&lt;tpl for="."&gt;'</tt> to iterate over its supplied
     * data object as an Array. However, <i>named</i> properties may be placed into the data object to
     * provide non-repeating data such as headings, totals etc.</p>
     * @param {Array} records An Array of {@link Ext.data.Model}s to be rendered into the DataPanel.
     * @param {Number} startIndex the index number of the Record being prepared for rendering.
     * @return {Array} An Array of data objects to be processed by a repeating XTemplate. May also
     * contain <i>named</i> properties.
     */
    collectData: function(records, startIndex) {
        var results = [],
            i, ln = records.length;
        for (i = 0; i < ln; i++) {
            results[results.length] = this.prepareData(records[i].data, startIndex + i, records[i]);
        }
        return results;
    },

    /**
     * @private
     * Changes the data store bound to this view and refreshes it.
     * @param {Store} store The store to bind to this view
     * @param {Boolean} initial Flag as the initial bind
     */
    bindStore: function(store, initial) {
        if (!this.rendered) {
            this.store = store;
            return;
        }

        if (!initial && this.store) {
            if (store !== this.store && this.store.autoDestroy) {
                this.store.destroyStore();
            }
            else {
                this.store.un({
                    scope: this,
                    beforeload: this.onBeforeLoad,
                    datachanged: this.onDataChanged,
                    add: this.onAdd,
                    remove: this.onRemove,
                    update: this.onUpdate,
                    clear: this.refresh
                });
            }
            if (!store) {
                this.store = null;
            }
        }
        if (store) {
            store = Ext.StoreMgr.lookup(store);
            store.on({
                scope: this,
                beforeload: this.onBeforeLoad,
                datachanged: this.onDataChanged,
                add: this.onAdd,
                remove: this.onRemove,
                update: this.onUpdate,
                clear: this.refresh
            });
        }
        this.store = store;
        if (store) {
            this.refresh(false);
        }
    },

    /**
     * Callback when the 'beforeload' of store fires
     * @private
     */
    onBeforeLoad: Ext.emptyFn,

    // @private
    bufferRender: function(records, index) {
        var div = document.createElement('div');
        this.tpl.overwrite(div, this.collectData(records, index));
        return Ext.query(this.itemSelector, div);
    },

    // @private
    onUpdate: function(ds, record) {
        var index = this.store.indexOf(record),
            sel, original, node;
        
        if (index > -1) {
            sel = this.isSelected(index);
            original = this.all.elements[index];
            node = this.bufferRender([record], index)[0];

            this.all.replaceElement(index, node, true);
            if (sel) {
                this.selected.replaceElement(original, node);
                this.all.item(index).addCls(this.selectedClass);
            }
            this.updateItems(index, index);
        }
    },

    // @private
    onAdd: function(ds, records, index) {
        if (this.all.getCount() === 0) {
            this.refresh(false);
            return;
        }
        var nodes = this.bufferRender(records, index), n, a = this.all.elements;
        if (index < this.all.getCount()) {
            n = this.all.item(index).insertSibling(nodes, 'before', true);
            a.splice.apply(a, [index, 0].concat(nodes));
        }
        else {
            n = this.all.last().insertSibling(nodes, 'after', true);
            a.push.apply(a, nodes);
        }
        this.updateItems(index);
    },

    // @private
    onRemove: function(ds, record, index) {
        this.deselect(index);
        this.onRemoveItem(this.all.item(index), index);
        this.all.removeElement(index, true);
        if (this.store.getCount() === 0){
            this.refresh(false);
        }
        if (this.components) {
            this.cleanInstances();
        }
    },

    /**
     * Refreshes an individual node's data from the store.
     * @param {Number} index The item's data index in the store
     */
    refreshNode: function(index) {
        this.onUpdate(this.store, this.store.getAt(index));
    },

    // @private
    updateItems: function(startIndex, endIndex) {
        var ns = this.all.elements;
        startIndex = startIndex || 0;
        endIndex = endIndex || ((endIndex === 0) ? 0 : (ns.length - 1));
        
        for (var i = startIndex; i <= endIndex; i++) {
            ns[i].viewIndex = i;
            
            if (this.components) {
                this.createInstances(ns[i]);
            }
            
            this.onUpdateItem(ns[i], i);
        }
        
        if (this.components) {
            this.cleanInstances();
        }
        
        //this.doComponentLayout();
    },

    /**
     * Callback when the item is updated
     * @param {Object} item The item being updated
     * @param {Number} index The index of the item being updated
     */
    onUpdateItem: Ext.emptyFn,

    /**
     * Callback when the item is removed
     * @param {Object} item The item being removed
     * @param {Number} index The index of the item being removed
     */
    onRemoveItem: Ext.emptyFn,
    
    createInstances : function(node) {
        var id = Ext.id(node),
            components = this.components,
            ln = components.length,
            i, component, instance, target;

        for (i = 0; i < ln; i++) {
            component = components[i];
            target = component.targetSelector ? Ext.fly(node).down(component.targetSelector, true) : node;
            if (target) {
                if (Ext.isObject(component.config)) {
                    instance = Ext.create(component.config, 'button');
                }
                else if (Ext.isFunction(component.config)) {
                    instance = component.config.call(this, this.getRecord(node), node, node.viewIndex);
                }
                if (instance) {
                    this.instances.add(instance);
                    instance.addCls(component.delegateCls);
                    instance.render(target);
                    instance.doComponentLayout();              
                }
            }            
        }
    },
    
    cleanInstances : function() {
        this.instances.each(function(instance) {
            if (!document.getElementById(instance.id)) {
                this.instances.remove(instance);
                instance.destroy();
            }
        }, this);
    },

    /**
     * @private
     */
    onDataChanged: function() {
        this.refresh(false);
    },

    /**
     * Returns the template node the passed child belongs to, or null if it doesn't belong to one.
     * @param {HTMLElement} node
     * @return {HTMLElement} The template node
     */
    findItemFromChild: function(node) {
        return Ext.fly(node).findParent(this.itemSelector, this.getTemplateTarget());
    },

    /**
     * Gets an array of the records from an array of nodes
     * @param {Array} nodes The nodes to evaluate
     * @return {Array} records The {@link Ext.data.Model} objects
     */
    getRecords: function(nodes) {
        var r = [],
            s = nodes,
            len = s.length,
            i;
        for (i = 0; i < len; i++) {
            r[r.length] = this.store.getAt(s[i].viewIndex);
        }
        return r;
    },

    /**
     * Gets a record from a node
     * @param {HTMLElement} node The node to evaluate
     * @return {Record} record The {@link Ext.data.Model} object
     */
    getRecord: function(node) {
        return this.store.getAt(node.viewIndex);
    },

    /**
     * Gets a template node.
     * @param {HTMLElement/String/Number/Ext.data.Model} nodeInfo An HTMLElement template node, index of a template node,
     * the id of a template node or the record associated with the node.
     * @return {HTMLElement} The node or null if it wasn't found
     */
    getNode: function(nodeInfo) {
        if (Ext.isString(nodeInfo)) {
            return document.getElementById(nodeInfo);
        }
        else if (Ext.isNumber(nodeInfo)) {
            return this.all.elements[nodeInfo];
        }
        else if (nodeInfo instanceof Ext.data.Model) {
            var idx = this.store.indexOf(nodeInfo);
            return this.all.elements[idx];
        }
        return nodeInfo;
    },

    /**
     * Gets a range nodes.
     * @param {Number} start (optional) The index of the first node in the range
     * @param {Number} end (optional) The index of the last node in the range
     * @return {Array} An array of nodes
     */
    getNodes: function(start, end) {
        var ns = this.all.elements,
            nodes = [],
            i;
        start = start || 0;
        end = !Ext.isDefined(end) ? Math.max(ns.length - 1, 0) : end;
        if (start <= end) {
            for (i = start; i <= end && ns[i]; i++) {
                nodes.push(ns[i]);
            }
        }
        else {
            for (i = start; i >= end && ns[i]; i--) {
                nodes.push(ns[i]);
            }
        }
        return nodes;
    },

    /**
     * Finds the index of the passed node.
     * @param {HTMLElement/String/Number/Record} nodeInfo An HTMLElement template node, index of a template node, the id of a template node
     * or a record associated with a node.
     * @return {Number} The index of the node or -1
     */
    indexOf: function(node) {
        node = this.getNode(node);
//
//        if (!node) {
//            return -1;
//        }

        if (Ext.isNumber(node.viewIndex)) {
            return node.viewIndex;
        }
        
        return this.all.indexOf(node);
    },

    // @private
    onDestroy: function() {
        this.all.clear();
        Ext.DataPanel.superclass.onDestroy.call(this);
        this.bindStore(null);
    }
});

Ext.reg('datapanel', Ext.DataPanel);