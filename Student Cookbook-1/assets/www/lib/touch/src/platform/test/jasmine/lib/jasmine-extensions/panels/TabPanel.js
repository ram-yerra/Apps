/**
 * @class jasmine.panel.TabPanel
 * Renders inspection tools htmlElement.
 * @param {Object} config The configuration object.
 * @return {HTMLElement} The inspection tools HTMLElement
 */
jasmine.panel.TabPanel = function(config) {
    var me = this;  
    me.sandboxes = config.sandboxes;
    me.spec = config.spec;
        
    me.el = new jasmine.Dom({
        id: "spec-" + me.spec.id,
        cls: "toolPanel",
        onclick: function() {
            me.onTabPanelClick.apply(me, arguments);
        },
        children: [{
            cls: "toolBar"
        },{
            cls: "panels"
        }]
    });
        
    me.toolbar = me.el.children[0];
    me.body = me.el.children[1];

    me.renderToolBarButtons();

    me.children = [];
    me.add(new jasmine.panel.SpecInfos({
        spec: me.spec
    }));
    
    return me;
};

/**
 * Adds a panel to the tab panel.
 * @param {Object} panel the panel to be added to this tabPanel.
 */
jasmine.panel.TabPanel.prototype.add = function(panel) {
    if (panel.el) {
        this.body.appendChild(panel.el);
    }

    this.children.push(panel);
    
    if (panel.afterRender) {
        panel.afterRender();
    }
};

/**
 * Activate a tool panel and render it if needed.
 * @param {String} cls The panel className.
 */
jasmine.panel.TabPanel.prototype.activatePanel = function(cls) {
    var children = this.children,
        length = children.length,
        rendered = false,
        child, i;
        
    for(i = 0; i < length; i++) {
        child = children[i].el;
        if (child.className.search(cls) !== -1) {
            child.className = child.className.replace(" hideMe", "");
            rendered = true;
        } else if (child.className.search("hideMe") === -1){
            jasmine.Dom.setCls(child, child.className + " hideMe");   
        }
    }

    if (rendered) {
        return;
    }
    
    if (cls === "blocks") {
        this.add(new jasmine.panel.SpecBlocks({
            spec: this.spec
        }));
    }
    if (cls === "domSandbox") {
        this.add(new jasmine.panel.SpecDomSandbox({
            spec: this.spec,
            sandboxes: this.sandboxes
        })); 
    }
    
    if (cls === "stackTrace") {
        this.add(new jasmine.panel.SpecStackTrace({
            spec: this.spec
        })); 
    }
};

/**
 * Reporter HTMLElement click dispatcher.
 * @param {Event} event The event
 */
jasmine.panel.TabPanel.prototype.onTabPanelClick = function(event) {
    var el;
        event = event || jasmine.util.getWindow().event;
        el = event.target || event.srcElement;

    if (el.className.search("toolbarTab") !== -1) {
        this.onTabClick(el);
    }

    if (el.className.search("inspectStackTrace") !== -1) {
        this.onInspectStackTraceClick(el);
    }
};

/**
 * Handle spec tools tab click.
 * @param {HTMLElement} el The tab HTMLElement.
 */
jasmine.panel.TabPanel.prototype.onTabClick = function(el) {
    var toolPanel, tools, specId, panels, length, child, cls, i;
    
    cls = el.className.split(" ")[1];
    jasmine.Dom.setCls(el, "toolbarTab " + cls + " selected");

    tools = this.toolbar.children;
    panels = this.body.children;

    length = tools.length;
    for(i = 0; i < length; i++) {
        child = tools[i];
        if (child != el) {    
            jasmine.Dom.setCls(child, child.className.replace(" selected", ""));
        }
        
    }
    this.activatePanel(cls);
};

/**
 * Inspect Stack Trace click listener.
 * @param {Event} event The click event.
 */
jasmine.panel.TabPanel.prototype.onInspectStackTraceClick = function(el) {
    this.onTabClick(el.parentNode.parentNode.parentNode.previousSibling.children[2]);
};

/**
 * Renders inspection tabpanel toolbar which contain tabs.
 * @param {jasmine.Spec} spec The jasmine spec.
 * @param {HTMLElement} toolBarEl The toolbar HTMLElement
 */
jasmine.panel.TabPanel.prototype.renderToolBarButtons = function() {
    this.toolbar.appendChild(new jasmine.Dom({
        tag: "span",
        cls: "toolbarTab infos selected",
        html: "Infos"
    }));
    
    this.toolbar.appendChild(new jasmine.Dom({
        tag: "span",
        cls: "toolbarTab blocks",
        html: "Jasmine Blocks"
    }));
    
    if (!jasmine.browser.isIE && this.spec.hasError) {
        this.toolbar.appendChild(new jasmine.Dom({
            tag: "span",
            cls: "toolbarTab stackTrace",
            html: "Stack Trace"
        }));
    }
    if (this.sandboxes[this.spec.id] && this.sandboxes[this.spec.id].innerHTML !== "") {
        this.toolbar.appendChild(new jasmine.Dom({
            tag: "span",
            cls: "toolbarTab domSandbox",
            html: "Dom Sandbox"
        }));
    }
};
