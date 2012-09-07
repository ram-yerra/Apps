/**
 * @class Ext.draw.SVG
 * @extends Ext.draw.Surface
 *<p>Provides specific methods to draw with SVG.</p>
 */
Ext.draw.SVG = Ext.extend(Ext.draw.Surface, {
    xlink: "http:/" + "/www.w3.org/1999/xlink",

    translateAttrs: {
        radius: "r",
        radiusX: "rx",
        radiusY: "ry",
        path: "d",
        lineWidth: "stroke-width",
        fillOpacity: "fill-opacity",
        strokeOpacity: "stroke-opacity",
        strokeLinejoin: "stroke-linejoin",
        rotate: "rotation"
    },

    minDefaults: {
        circle: {
            cx: 0,
            cy: 0,
            r: 0,
            fill: "none",
            stroke: null,
            "stroke-width": null,
            opacity: null,
            "fill-opacity": null,
            "stroke-opacity": null
        },
        ellipse: {
            cx: 0,
            cy: 0,
            rx: 0,
            ry: 0,
            fill: "none",
            stroke: null,
            "stroke-width": null,
            opacity: null,
            "fill-opacity": null,
            "stroke-opacity": null
        },
        rect: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            rx: 0,
            ry: 0,
            fill: "none",
            stroke: null,
            "stroke-width": null,
            opacity: null,
            "fill-opacity": null,
            "stroke-opacity": null
        },
        text: {
            x: 0,
            y: 0,
            "text-anchor": "start",
            "font-family": "Helvetica, Arial, sans-serif",
            "font-size": "10px",
            "font-weight": null,
            "font-style": null,
            fill: "#000",
            stroke: null,
            "stroke-width": null,
            opacity: null,
            "fill-opacity": null,
            "stroke-opacity": null
        },
        path: {
            d: "M0,0",
            fill: "none",
            stroke: null,
            "stroke-width": null,
            opacity: null,
            "fill-opacity": null,
            "stroke-opacity": null
        },
        image: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            preserveAspectRatio: "none",
            opacity: null
        }
    },

    createSVGElement: function(type, attrs) {
        var el = this.domRef.createElementNS("http:/" + "/www.w3.org/2000/svg", type),
            key;
        if (attrs) {
            for (key in attrs) {
                el.setAttribute(key, String(attrs[key]));
            }
        }
        return el;
    },

    createSprite: function(sprite) {
        // Create svg element and append to the DOM.
        var el = this.createSVGElement(sprite.type);
        el.id = sprite.id;
        el.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
        sprite.el = el;
        this.applyZIndex(sprite); //performs the insertion
        sprite.fireEvent('render', sprite);
        return el;
    },

    getBBox: function (sprite) {
        var bbox = {},
            bb,
            height,
            width,
            i,
            ln;
        if (!sprite || !sprite.el) {
            return {};
        }
        if (sprite.type == "path") {
            return Ext.draw.pathDimensions(sprite.attr.path);
        }
        try {
            bbox = sprite.el.getBBox();
        } catch(e) {
            // Firefox 3.0.x plays badly here
        } finally {
            bbox = bbox || { bad: true };
        }
        if (bbox.bad && sprite.type == "text") {
            bbox = {x: bbox.x, y: Infinity, width: 0, height: 0};
            ln = sprite.el.getNumberOfChars();
            for (i = 0; i < ln; i++) {
                bb = sprite.el.getExtentOfChar(i);
                bbox.y = Math.min(bb.y, bbox.y);
                height = bb.y + bb.height - bbox.y;
                bbox.height = Math.max(bbox.height, height);
                width = bb.x + bb.width - bbox.x;
                bbox.width = Math.max(bbox.width, width);
            }
        }
        return bbox;
    },

    hide: function() {
        Ext.get(this.el).hide();
    },

    show: function() {
        Ext.get(this.el).show();
    },

    hidePrim: function(sprite) {
        Ext.get(sprite.el).hide();
    },

    showPrim: function(sprite) {
        Ext.get(sprite.el).show();
    },

    getDefs: function() {
        return this._defs || (this._defs = this.createSVGElement('defs'));
    },

    rotate: function (sprite) {
        var bbox,
            deg = sprite.rotation.degrees,
            centerX = sprite.rotation.x,
            centerY = sprite.rotation.y;

        if (centerX == null || centerY == null) {
            bbox = this.getBBox(sprite);
            centerX = centerX == null ? bbox.x + bbox.width / 2 : centerX;
            centerY = centerY == null ? bbox.y + bbox.height / 2 : centerY;
        }
        sprite.transformations.push(Ext.util.Format.format("rotate({0} {1} {2})", deg, centerX, centerY));
    },

    translate: function(sprite) {
        var x = sprite.translation.x || 0,
            y = sprite.translation.y || 0,
            attr = sprite.attr,
            path;
        switch (sprite.type) {
            case "circle":
            case "ellipse":
                sprite.el.setAttribute('cx', attr.x + x);
                sprite.el.setAttribute('cy', attr.y + y);
//                sprite.transformations.push(Ext.util.Format.format("translate({0} {1})", x, y));
                break;
            case "rect":
            case "image":
            case "text":
                //TODO(nico) previous (commented) method was buggy. This works well for rects
                //but there seems to be an offset with text. We'll need to fix this.
                sprite.transformations.push(Ext.util.Format.format("translate({0} {1})", x, y));
//                sprite.el.setAttribute('x', attr.x + x);
//                sprite.el.setAttribute('y', attr.y + y);
//                this.tuneText(sprite, this.scrubAttrs(sprite) || {});
                break;
            case "path":
                path = Ext.draw.pathToRelative(attr.path);
                path[0][1] += x;
                path[0][2] += y;
                sprite.el.setAttribute('d', Ext.draw.pathToAbsolute(path));
                break;
        }
    },
    
    scale: function(sprite) {
        var x = sprite.scaling.x,
            y = sprite.scaling.y;
        sprite.transformations.push(Ext.util.Format.format("scale({0} {1})", x, y));
    },

    setSize: function(w, h) {
        w = +w || this.width;
        h = +h || this.height;
        this.width = w;
        this.height = h;

        var el = this.el;
        el.setSize(w, h);
        el.set({
            width: w,
            height: h
        });
    },

    /**
     * Get the region for the surface's canvas area
     * @returns {Ext.util.Region}
     */
    getRegion: function() {
        // Mozilla requires using the background rect because the svg element returns an
        // incorrect region. Webkit gives no region for the rect and must use the svg element.
        var svgXY = this.el.getXY(),
            rectXY = this.bgRect.getXY(),
            max = Math.max,
            x = max(svgXY[0], rectXY[0]),
            y = max(svgXY[1], rectXY[1]);
        return {
            left: x,
            top: y,
            right: x + this.width,
            bottom: y + this.height
        };
    },

    onRemove: function(item) {
        if (item.el) {
            Ext.removeNode(item.el);
            delete item.el;
        }
        Ext.draw.SVG.superclass.onRemove.call(this);
    },
    
    setViewBox: function(x, y, width, height) {
        this.el.dom.setAttribute('viewBox', [x, y, width, height].join(' '));
    },

    render: function (container) {
        if (!this.el) {
            var width = this.width || 500,
                height = this.height || 500,
                el = this.createSVGElement('svg', {
                    xmlns: "http:/" + "/www.w3.org/2000/svg",
                    version: 1.1,
                    width: width,
                    height: height
                }),
                defs = this.getDefs(),

                // Create a rect that is always the same size as the svg root; this serves 2 purposes:
                // (1) It allows mouse events to be fired over empty areas in Webkit, and (2) we can
                // use it rather than the svg element for retrieving the correct client rect of the
                // surface in Mozilla (see https://bugzilla.mozilla.org/show_bug.cgi?id=530985)
                bgRect = this.createSVGElement('rect', {
                    width: '100%',
                    height: '100%',
                    fill: '#000',
                    stroke: 'none',
                    opacity: 0
                });
            el.appendChild(defs);
            el.appendChild(bgRect);
            container.appendChild(el);
            this.el = Ext.get(el);
            this.bgRect = Ext.get(bgRect);
            this.el.on({
                scope: this,
                mouseup: this.onMouseUp,
                mousedown: this.onMouseDown,
                mouseover: this.onMouseOver,
                mouseout: this.onMouseOut,
                mousemove: this.onMouseMove,
                mouseenter: this.onMouseEnter,
                mouseleave: this.onMouseLeave,
                click: this.onClick
            });
        }
        this.renderAll();
    },

    // private
    onClick: function(e) {
        this.processEvent('click', e);
    },

    // private
    onMouseUp: function(e) {
        this.processEvent('mouseup', e);
    },

    // private
    onMouseDown: function(e) {
        this.processEvent('mousedown', e);
    },

    // private
    onMouseOver: function(e) {
        this.processEvent('mouseover', e);
    },

    // private
    onMouseOut: function(e) {
        this.processEvent('mouseout', e);
    },

    // private
    onMouseMove: function(e) {
        this.fireEvent('mousemove', e);
    },

    // private
    onMouseEnter: function(e) {
        this.fireEvent('mouseenter', e);
    },

    // private
    onMouseLeave: function(e) {
        this.fireEvent('mouseleave', e);
    },

    processEvent: function(name, e) {
        var target = e.getTarget(),
            surface = this.surface,
            sprite;

        this.fireEvent(name, e);
        // We wrap text types in a tspan, sprite is the parent.
        if (target.nodeName == 'tspan') {
            target = target.parentNode;
        }
        sprite = this.items.get(target.id);
        if (sprite) {
            sprite.fireEvent(name, sprite, e);
        }
    },

    tuneText: function (sprite, attrs) {
        var el = sprite.el,
            leading = 1.2,
            tspan,
            text,
            i,
            ln,
            measureEl = el.firstChild || el,
            fontSize,
            x = attrs.x,
            y = attrs.y,
            translate = sprite.translation;

        if(translate) {
            x += translate.x;
            y += translate.y;
        }

        fontSize = parseInt(Ext.fly(measureEl).getStyle('font-size'), 10);
        if (attrs.hasOwnProperty("text")) {
            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }
            var texts = String(attrs.text).split("\n");
            for (i = 0, ln = texts.length; i < ln; i++) {
                if (texts[i]) {
                    tspan = this.createSVGElement('tspan');
                    if (i) {
                        tspan.setAttribute("dy", fontSize * leading);
                        tspan.setAttribute("x", x);
                    }
                    tspan.appendChild(Ext.getDoc().dom.createTextNode(texts[i]));
                    el.appendChild(tspan);
                }
            }
        } else {
            texts = el.getElementsByTagName("tspan");
            for (i = 1, ln = texts.length; i < ln; i++) {
                texts[i].setAttribute("dy", fontSize * leading);
                texts[i].setAttribute("x", x);
            }
        }
        el.setAttribute("y", y);
        var bb = this.getBBox(sprite),
            dif = y - (bb.y + bb.height / 2);
        if (dif && isFinite(dif)) {
            el.setAttribute("y", y + dif);
        }
    },

    renderAll: function() {
        this.items.each(this.renderItem, this);
    },

    renderItem: function (sprite) {
        if (!this.el) {
            return;
        }
        if (!sprite.el) {
            this.createSprite(sprite);
        }
        if (sprite.zIndexDirty) {
            this.applyZIndex(sprite);
        }
        if (sprite.dirty) {
            this.applyAttrs(sprite);
            this.applyTransformations(sprite);
        }
    },

    redraw: function(sprite) {
        sprite.dirty = sprite.zIndexDirty = true;
        this.renderItem(sprite);
    },

    applyAttrs: function (sprite) {
        var group = sprite.group,
            groups,
            i,
            ln,
            attrs,
            sattr = sprite.attr,
            font,
            key;

        if (group) {
            groups = [].concat(group);
            ln = groups.length;
            for (i = 0; i < ln; i++) {
                group = groups[i];
                this.getGroup(group).add(sprite);
            }
            delete sprite.group;
        }
        attrs = this.scrubAttrs(sprite) || {};

        switch (sprite.type) {
            case "circle":
            case "ellipse":
                attrs.cx = attrs.cx || attrs.x;
                attrs.cy = attrs.cy || attrs.y;
            break;
            case "rect":
                attrs.rx = attrs.ry = attrs.r;
            break;
            case "path":
                attrs.d = Ext.draw.pathToAbsolute(attrs.d);
            break;
            case "text":
                font = attrs.font;
                if (font) {
                    sprite.el.setAttribute("style", "font: " + font);
                }
            break;
            case "image":
                sprite.el.setAttributeNS(this.xlink, "href", attrs.src);
            break;
        }
        Ext.applyIf(attrs, this.minDefaults[sprite.type]);
        if (sattr.hidden != null) {
            sattr.hidden ? this.hidePrim(sprite) : this.showPrim(sprite);
        }

        for (key in attrs) {
            if (attrs.hasOwnProperty(key) && attrs[key] != null) {
                if (key == "clip-rect") {
                    var rect = attrs[key];
                    if (rect.length == 4) {
                        attrs.clip && attrs.clip.parentNode.parentNode.removeChild(attrs.clip.parentNode);
                        var el = this.createSVGElement('clipPath'),
                            rc = this.createSVGElement('rect');
                        el.id = Ext.id(null, 'ext-clip-');
                        rc.setAttribute("x", rect[0]);
                        rc.setAttribute("y", rect[1]);
                        rc.setAttribute("width", rect[2]);
                        rc.setAttribute("height", rect[3]);
                        el.appendChild(rc);
                        this.getDefs().appendChild(el);
                        sprite.el.setAttribute("clip-path", "url(#" + el.id + ")");
                        attrs.clip = rc;
                    }
                    if (!attrs[key]) {
                        var clip = Ext.getDoc().dom.getElementById(sprite.el.getAttribute("clip-path").replace(/(^url\(#|\)$)/g, ""));
                        clip && clip.parentNode.removeChild(clip);
                        sprite.el.setAttribute("clip-path", "");
                        delete attrss.clip;
                    }
                } else {
                    sprite.el.setAttribute(key, String(attrs[key]));
                }
            }
        }
        sprite.type == "text" && this.tuneText(sprite, attrs);
        sprite.dirty = false;
    },

    /**
     * Insert or move a given sprite's element to the correct place in the DOM list for its zIndex
     * @param {Ext.draw.Sprite} sprite
     */
    applyZIndex: function(sprite) {
        var idx = this.positionSpriteInList(sprite),
            el = Ext.fly(sprite.el),
            prevEl;
        if (this.el.dom.childNodes[idx + 2] !== el.dom) { //shift by 2 to account for defs and bg rect 
            if (idx > 0) {
                // Find the first previous sprite which has its DOM element created already
                do {
                    prevEl = this.items.getAt(--idx).el;
                } while (!prevEl && idx > 0);
            }
            el.insertAfter(prevEl || this.bgRect);
        }
        sprite.zIndexDirty = false;
    },

    applyTransformations: function(sprite) {
        var dirty = false;
        sprite.transformations = [];
        if (sprite.translation.x != null || sprite.translation.y != null) {
            this.translate(sprite);
            dirty = true;
        }
        if (sprite.scaling.x != null || sprite.scaling.y != null) {
            this.scale(sprite);
            dirty = true;
        }
        if (sprite.rotation.degrees != null) {
            this.rotate(sprite);
            dirty = true;
        }
        if (dirty) {
            sprite.el.setAttribute("transform", sprite.transformations.join(" "));
        }
    },

    createItem: function (config) {
        var sprite = new Ext.draw.Sprite(config);
        sprite.surface = this;
        sprite.transformations = [];
        return sprite;
    },

    addGradient: function(gradient) {
        gradient = Ext.draw.parseGradient(gradient);
        var ln = gradient.stops.length,
            vector = gradient.vector,
            gradientEl,
            stop,
            stopEl,
            i;
        if (gradient.type == 'linear') {
            gradientEl = this.createSVGElement('linearGradient');
            gradientEl.setAttribute('x1', vector[0]);
            gradientEl.setAttribute('y1', vector[1]);
            gradientEl.setAttribute('x2', vector[2]);
            gradientEl.setAttribute('y2', vector[3]);
        }
        else {
            gradientEl = this.createSVGElement('radialGradient');
            gradientEl.setAttribute('cx', gradient.centerX);
            gradientEl.setAttribute('cy', gradient.centerY);
            gradientEl.setAttribute('r', gradient.radius);
            if (Ext.isNumber(gradient.focalX) && Ext.isNumber(gradient.focalY)) {
                gradientEl.setAttribute('fx', gradient.focalX);
                gradientEl.setAttribute('fy', gradient.focalY);
            }
        }    
        gradientEl.id = gradient.id;
        this.getDefs().appendChild(gradientEl);

        for (i = 0; i < ln; i++) {
            stop = gradient.stops[i];
            stopEl = this.createSVGElement('stop');
            stopEl.setAttribute('offset', stop.offset + '%');
            stopEl.setAttribute('stop-color', stop.color);
            stopEl.setAttribute('stop-opacity',stop.opacity);
            gradientEl.appendChild(stopEl);
        }
    },

    destroy: function() {
        Ext.draw.SVG.superclass.destroy.call(this);
        Ext.removeNode(this.el);
        /*
        this.un({
            scope: this,
            mousedown: this.onMouseDown,
            click: this.onClick,
            dblclick: this.onDblClick,
            contextmenu: this.onContextMenu
        });
        */
        delete this.el;
    }
});