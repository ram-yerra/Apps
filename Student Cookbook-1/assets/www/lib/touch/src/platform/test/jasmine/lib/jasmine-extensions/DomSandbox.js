/**
 * Initializes dom sandbox system. This function overrides the return value of Ext.getBody.
 */
jasmine.DomSandbox = function() {
    var me = this,
        extSandbox, win, ext;

    win = jasmine.util.getWindow();
    ext = win.Ext;
    
    me.sandboxes = {};
    me.sandBox = function() {
        var sandboxes = me.sandboxes,
            currentSpecId = jasmine.getEnv().currentSpec.id;
            
        if (!sandboxes[currentSpecId]) {
            sandboxes[currentSpecId] = jasmine.util.getBody().appendChild(new jasmine.Dom({tag: "div", cls: "sandbox", id: "sandbox-" + currentSpecId}));
        }
        return sandboxes[currentSpecId];
    };
    
    if (ext) {
        me.ExtgetBody = ext.getBody; //avoid override by spyOn
        me.Extget = ext.get; //avoid override by spyOn
        
        win.Ext.getBody = function(real) {
            if (!real) {
                return me.Extget(me.sandBox());
            }
            return me.ExtgetBody();
        };
    }
    win.sandBox = me.sandBox;
};


/**
 * Stops the dom sandbox system. This function restore original Ext.getBody.
 */
jasmine.DomSandbox.prototype.stop = function() {
    var sandboxes = this.sandboxes,
        ext = jasmine.util.getWindow().Ext;
    
    if (ext) {
        ext.getBody = this.ExtgetBody;
    }
};

/**
 * Removes sandbox HTMLElement from document body, it isn't destroyed because
 * it's content could be analyzed later.
 * @param {Jasmine.Spec} spec The Jasmine spec
 */
jasmine.DomSandbox.prototype.remove = function() {
    var sandbox = this.sandboxes[jasmine.getEnv().currentSpec.id];

    if (sandbox) {
        jasmine.util.getBody().removeChild(sandbox);
    }
};


