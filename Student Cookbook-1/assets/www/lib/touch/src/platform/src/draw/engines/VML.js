/**
 * @class Ext.draw.VML
 * @extends Ext.draw.Surface
 *<p>Provides specific methods to draw with VML.</p>
 */
Ext.draw.VML = Ext.extend(Ext.draw.Surface, {
    map: {M: "m", L: "l", C: "c", Z: "x", m: "t", l: "r", c: "v", z: "x"},
    bites: /([clmz]),?([^clmz]*)/gi,
    val: /-?[^,\s-]+/g,
    alphaCoordsize: 1e3 + " " + 1e3,
    zoom: 10,
    ISURL: /^url\(\s*['"]?([^\)]+?)['"]?\s*\)$/i,
    pathlike: /^(path|rect)$/,
    path2vml: function (path) {
        var total =  /[ahqstv]/ig,
            command = Ext.draw.pathToAbsolute;
        String(path).match(total) && (command = Ext.draw.path2curve);
        total = /[clmz]/g;
        if (command == Ext.draw.pathToAbsolute && !String(path).match(total)) {
            var map = this.map,
                val = this.val,
                zoom = this.zoom,
                res = String(path).replace(this.bites, function (all, command, args) {
                var vals = [],
                    isMove = command.toLowerCase() == "m",
                    res = map[command];
                args.replace(val, function (value) {
                    if (isMove && vals[length] == 2) {
                        res += vals + map[command == "m" ? "l" : "L"];
                        vals = [];
                    }
                    vals.push(Math.round(value * zoom));
                });
                return res + vals;
            });
            return res;
        }
        var pa = command(path), p, r;
        res = [];
        for (var i = 0, ii = pa.length; i < ii; i++) {
            p = pa[i];
            r = pa[i][0].toLowerCase();
            r == "z" && (r = "x");
            for (var j = 1, jj = p.length; j < jj; j++) {
                r += Math.round(p[j] * this.zoom) + (j != jj - 1 ? "," : "");
            }
            res.push(r);
        }
        return res.join(" ");
    },
    coordsize: 10 * 1e3 + " " + 10 * 1e3,
    coordorigin: "0 0",

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
            font: "10px Helvetica, Arial, sans-serif",
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
        sprite = this.items.get(target.id);
        if (sprite) {
            sprite.fireEvent(name, sprite, e);
        }
    },

    createElement: function(sprite) {
        var g = this.createNode("group"),
            zoom = sprite.type == "path" || sprite.type == "rect" ? this.zoom : 1,
            attr = sprite.attr,
            round = Math.round,
            el,
            ol,
            vml = sprite.vml || (sprite.vml = {});
        g.style.cssText = "position:absolute;left:0;top:0;width:1000px;height:1000px";
        g.coordsize = zoom * 1e3 + " " + zoom * 1e3;
        g.coordorigin = this.coordorigin;
        vml.g = g;
        switch (sprite.type) {
            case "circle":
            case "ellipse":
                el = this.createNode("oval");
                ol = el.style;
                g.appendChild(el);
                this.el.appendChild(g);
                break;
            case "path":
            case "rect":
                el = this.createNode("shape");
                ol = el.style;
                ol.width = ol.height = "1000px";
                el.coordsize = "1000 1000";
                el.coordorigin = this.coordorigin;
                g.appendChild(el);
                this.el.appendChild(g);
                break;
            case "image":
                el = this.createNode("image");
                g.appendChild(el);
                this.el.appendChild(g);
                break;
            case "text":
                el = this.createNode("shape");
                ol = el.style;
                var path = this.createNode("path"),
                    o = this.createNode("textpath");
                path.v = Ext.util.Format.format("m{0},{1}l{2},{1}", round(attr.x), round(attr.y), round(attr.x) + 1);
                path.textpathok = true;
                ol.width = ol.height = "1000px";
                // o.string = String(text);
                o.on = true;
                el.appendChild(o);
                el.appendChild(path);
                g.appendChild(el);
                this.el.appendChild(g);
                vml.textpath = o;
                vml.setXY = function (x, y) {
                    path.v = Ext.util.Format.format("m{0},{1}l{2},{1}", Math.round(x), Math.round(y), Math.round(x) + 1);
                };
                break;
        }
        el.id = sprite.id;
        sprite.el = el;
        sprite.fireEvent('render', sprite);
        return el;
    },

    getBBox: function (sprite) {
        var attr = sprite.attr,
            vml = sprite.vml;
        if (sprite.type == "path") {
            return Ext.draw.pathDimensions(attr.path);
        }
        if (this.pathlike.test(sprite.type)) {
            return Ext.draw.pathDimensions(attr.path);
        }
        return {
            x: vml.X + (vml.bbx || 0),
            y: vml.Y,
            width: vml.W,
            height: vml.H
        };
    },

    setFillAndStroke: function (sprite, params) {
        // o.attrs = o.attrs || {};
        var node = sprite.el,
            a = {},
            s = node.style,
            fillUrl,
            gradient,
            rotation,
            xy,
            newpath = sprite.type == "rect",//(params.x != a.x || params.y != a.y || params.width != a.width || params.height != a.height || params.r != a.r) && o.type == "rect",
            vml = sprite.vml,
            attr = sprite.attr,
            separator = /[, ]+/;

        if (newpath) {
            vml.path = params.path = Ext.draw.rectPath(sprite);
            vml.X = a.x;
            vml.Y = a.y;
            vml.W = a.width;
            vml.H = a.height;
        }
        params.href && (node.href = params.href);
        params.title && (node.title = params.title);
        params.target && (node.target = params.target);
        params.cursor && (s.cursor = params.cursor);
        // "blur" in params && o.blur(params.blur);
        if (params.path && sprite.type == "path" || newpath) {
                node.path = this.path2vml(params.path);
        }
        // if (params.rotation != null) {
        //     o.rotate(params.rotation, true);
        // }
        // if (params.translation) {
        //     xy = String(params.translation).split(separator);
        //     translate.call(o, xy[0], xy[1]);
        //     if (o._.rt.cx != null) {
        //         o._.rt.cx +=+ xy[0];
        //         o._.rt.cy +=+ xy[1];
        //         o.setBox(o.attrs, xy[0], xy[1]);
        //     }
        // }
        // if (params.scale) {
        //     xy = String(params.scale).split(separator);
        //     o.scale(+xy[0] || 1, +xy[1] || +xy[0] || 1, +xy[2] || null, +xy[3] || null);
        // }
        if ("clip-rect" in params) {
            var rect = String(params["clip-rect"]).split(separator);
            if (rect[length] == 4) {
                rect[2] = +rect[2] + (+rect[0]);
                rect[3] = +rect[3] + (+rect[1]);
                var div = node.clipRect || R.doc.createElement("div"),
                    dstyle = div.style,
                    group = node.parentNode;
                dstyle.clip = Ext.util.Format.format("rect({1}px {2}px {3}px {0}px)", rect);
                if (!node.clipRect) {
                    dstyle.position = "absolute";
                    dstyle.top = 0;
                    dstyle.left = 0;
                    dstyle.width = vml.paper.width + "px";
                    dstyle.height = vml.paper.height + "px";
                    group.parentNode.insertBefore(div, group);
                    div[appendChild](group);
                    node.clipRect = div;
                }
            }
            if (!params["clip-rect"]) {
                node.clipRect && (node.clipRect.style.clip = "");
            }
        }
        if (sprite.type == "image" && params.src) {
            node.src = params.src;
        }
        if (sprite.type == "image" && params.opacity) {
            node.filterOpacity = " progid:DXImageTransform.Microsoft.Alpha(opacity=" + (params.opacity * 100) + ")";
            s.filter = (node.filterMatrix || "") + (node.filterOpacity || "");
        }
        if (sprite.type == "text") {
            s = vml.textpath.style;
            params.font && (s.font = params.font);
            params["font-family"] && (s.fontFamily = '"' + params["font-family"].split(",")[0].replace(/^['"]+|['"]+$/g, "") + '"');
            params["font-size"] && (s.fontSize = params["font-size"]);
            params["font-weight"] && (s.fontWeight = params["font-weight"]);
            params["font-style"] && (s.fontStyle = params["font-style"]);
        }
        
        if (params.opacity != null || 
            params["stroke-width"] != null ||
            params.fill != null ||
            params.stroke != null ||
            params["stroke-width"] != null ||
            params["stroke-opacity"] != null ||
            params["fill-opacity"] != null ||
            params["stroke-dasharray"] != null ||
            params["stroke-miterlimit"] != null ||
            params["stroke-linejoin"] != null ||
            params["stroke-linecap"] != null) {
            var fill = node.fill,
                newfill = false;
            if (!fill) {
                newfill = fill = this.createNode("fill");
            }
            if (typeof params["fill-opacity"] == 'number' || typeof params["opacity"] == 'number') {
                var opacity = ((+params["fill-opacity"] + 1 || 2) - 1) * ((+params.opacity + 1 || 2) - 1);
                opacity < 0 && (opacity = 0);
                opacity > 1 && (opacity = 1);
                fill.opacity = params["fill-opacity"] || params["opacity"];
            }
            if (params.fill) {
                fill.on = true;
            }
            if (fill.on == null || params.fill == "none") {
                fill.on = false;
            }
            if (fill.on && typeof params.fill == 'string') {
                var isURL = params.fill.match(this.ISURL);
                if (isURL) {
                    fillUrl = isURL[1];
                    // If the URL matches one of the registered gradients, render that gradient
                    if(fillUrl.charAt(0) === '#') {
                        gradient = this.gradientsColl.getByKey(fillUrl.substring(1));
                    }
                    if(gradient) {
                        // VML angle is offset and inverted from standard, and must be adjusted to match rotation transform
                        rotation = params.rotation;
                        fill.angle = -(gradient.angle + 270 + (rotation ? rotation.degrees : 0)) % 360;
                        fill.type = "gradient";
                        fill.method = "sigma";
                        fill.colors.value = gradient.colors;
                    }
                    // Otherwise treat it as an image
                    else {
                        fill.src = fillUrl;
                        fill.type = "tile";
                    }
                } else {
                    fill.color = params.fill;
                    fill.src = "";
                    fill.type = "solid";
                    // if (R.getRGB(params.fill).error && (res.type in {circle: 1, ellipse: 1} || String(params.fill).charAt() != "r") && addGradientFill(res, params.fill)) {
                    //     a.fill = "none";
                    //     a.gradient = params.fill;
                    // }
                }
            }
            newfill && node.appendChild(fill);
            var stroke = (node.getElementsByTagName("stroke") && node.getElementsByTagName("stroke")[0]),
            newstroke = false;
            !stroke && (newstroke = stroke = this.createNode("stroke"));
            if ((params.stroke && params.stroke != "none") ||
                params["stroke-width"] ||
                params["stroke-opacity"] != null ||
                params["stroke-dasharray"] ||
                params["stroke-miterlimit"] ||
                params["stroke-linejoin"] ||
                params["stroke-linecap"]) {
                stroke.on = true;
            }
            (params.stroke == "none" || stroke.on == null || params.stroke == 0 || params["stroke-width"] == 0) && (stroke.on = false);
            var strokeColor = params.stroke;
            stroke.on && params.stroke && (stroke.color = strokeColor);
            opacity = ((+a["stroke-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1);
            var width = (parseFloat(params["stroke-width"]) || 1) * 0.75;
            opacity = Math.min(Math.max(opacity, 0), 1);
            params["stroke-width"] == null && (width = a["stroke-width"]);
            params["stroke-width"] && (stroke.weight = width);
            width && width < 1 && (opacity *= width) && (stroke.weight = 1);
            stroke.opacity = opacity;

            params["stroke-linejoin"] && (stroke.joinstyle = params["stroke-linejoin"] || "miter");
            stroke.miterlimit = params["stroke-miterlimit"] || 8;
            params["stroke-linecap"] && (stroke.endcap = params["stroke-linecap"] == "butt" ? "flat" : params["stroke-linecap"] == "square" ? "square" : "round");
            if (params["stroke-dasharray"]) {
                var dasharray = {
                    "-": "shortdash",
                    ".": "shortdot",
                    "-.": "shortdashdot",
                    "-..": "shortdashdotdot",
                    ". ": "dot",
                    "- ": "dash",
                    "--": "longdash",
                    "- .": "dashdot",
                    "--.": "longdashdot",
                    "--..": "longdashdotdot"
                };
                stroke.dashstyle = dasharray[has](params["stroke-dasharray"]) ? dasharray[params["stroke-dasharray"]] : "";
            }
            newstroke && node.appendChild(stroke);
        }
        if (sprite.type == "text") {
            s = this.span.style;
            params.font && (s.font = params.font);
            params["font-family"] && (s.fontFamily = params["font-family"]);
            params["font-size"] && (s.fontSize = params["font-size"]);
            params["font-weight"] && (s.fontWeight = params["font-weight"]);
            params["font-style"] && (s.fontStyle = params["font-style"]);
            vml.textpath.string = params.text;
            vml.textpath.string && (this.span.innerHTML = String(vml.textpath.string).replace(/</g, "&#60;").replace(/&/g, "&#38;").replace(/\n/g, "<br>"));
            vml.W = params.w = this.span.offsetWidth;
            vml.H = params.h = this.span.offsetHeight;
            vml.X = params.x;
            vml.Y = params.y + Math.round(vml.H / 2);
            vml.setXY(params.x, params.y);

            // text-anchor emulationm
            switch (params["text-anchor"]) {
                case "middle":
                    vml.textpath.style["v-text-align"] = "center";
                break;
                case "end":
                    vml.textpath.style["v-text-align"] = "right";
                    vml.bbx = -Math.round(vml.W / 2);
                break;
                default:
                    vml.textpath.style["v-text-align"] = "left";
                    vml.bbx = Math.round(vml.W / 2);
                break;
            }
        }
    },


    setBox: function (sprite, cx, cy) {
        var os = sprite.el.style,
            vml = sprite.vml,
            gs = vml.g.style,
            attr = this.scrubAttrs(sprite) || {},
            x,
            y,
            w,
            h,
            left,
            top,
            t;
        cx = cx || sprite.rotation.x;
        cy = cy || sprite.rotation.y;
        switch (sprite.type) {
            case "circle":
                x = attr.x - attr.r;
                y = attr.y - attr.r;
                w = h = attr.r * 2;
                break;
            case "ellipse":
                x = attr.x - attr.rx;
                y = attr.y - attr.ry;
                w = attr.rx * 2;
                h = attr.ry * 2;
                break;
            case "image":
                x = +attr.x;
                y = +attr.y;
                w = attr.width || 0;
                h = attr.height || 0;
                break;
            case "text":
                vml.setXY(attr.x, attr.y);
                x = attr.x - Math.round(vml.W / 2);
                y = attr.y - vml.H / 2;
                w = vml.W;
                h = vml.H;
                break;
            case "rect":
            case "path":
                if (!sprite.vml.path) {
                    x = 0;
                    y = 0;
                    w = this.width;
                    h = this.height;
                } else {
                    var dim = Ext.draw.pathDimensions(attr.path);
                    x = dim.x;
                    y = dim.y;
                    w = dim.width;
                    h = dim.height;
                }
                break;
            default:
                x = 0;
                y = 0;
                w = this.width;
                h = this.height;
                break;
        }
        if (isNaN(cx)) {
            cx = x + w / 2;
        }
        if (isNaN(cy)) {
            cy = y + h / 2;
        }
        left = cx - this.width / 2;
        top = cy - this.height / 2;
        vml.X = x;
        vml.Y = y;
        vml.W = w;
        vml.H = h;
        if (this.pathlike.test(sprite.type)) {
            left = cx - 500;
            top = cy - 500;
            vml.X = -left;
            vml.Y = -top;
            t =  -left * this.zoom  + "px";
            if (os.left != t) {
                os.left = t;
            }
            t =  -top * this.zoom+ "px";
            if (os.top != t) {
                os.top = t;
            }
        }
        else if (sprite.type == "text") {
            t =  -left + "px";
            if (os.left != t) {
                os.left = t;
            }
            t =  -top + "px";
            if (os.top != t) {
                os.top = t;
            }
        }
        else {
            t =  this.width + "px";
            if (gs.width != t) {
                gs.width = t;
            }
            t =  this.height + "px";
            if (gs.height != t) {
                gs.height = t;
            }
            sprite.vml.g.coordsize = this.width + ' ' + this.height;
            t = x - left + "px";
            if (os.left != t) {
                os.left = t;
            }
            t = y - top + "px";
            if (os.top != t) {
                os.top = t;
            }
            t = w + "px";
            if (os.width != t) {
                os.width = t;
            }
            t = h + "px";
            if (os.height != t) {
                os.height = t;
            }
        }
        t =  left + "px";
        if (gs.left != t) {
            gs.left = t;
        }
        t =  top + "px";
        if (gs.top != t) {
            gs.top = t;
        }
    },
    hide: function() {
        this.el.hide();
    },
    show: function() {
        this.el.show();
    },

    hidePrim: function(sprite) {
        Ext.fly(sprite.el).hide();
    },
    showPrim: function(sprite) {
        Ext.fly(sprite.el).show();
    },
    rotate: function (sprite) {
        var deg = sprite.rotation.degrees,
            cx = sprite.rotation.x || null,
            cy = sprite.rotation.y || null;
        cy == null && (cx = null);
        if (deg != null) {
            this.setBox(sprite, cx, cy);
            sprite.vml.g.style.rotation = deg;
        }
    },
    setSize: function(w, h) {
        w = +w || this.width;
        h = +h || this.height;
        this.width = w;
        this.height = h;

        this.el.setStyle('width', w);
        this.el.setStyle('height', h);
    },
    onAdd: function(item) {
        Ext.draw.VML.superclass.onAdd.call(this, item);
        if (this.el) {
            this.renderItem(item);
        }
    },
    onRemove: function(item) {
        if (item.el) {
            Ext.removeNode(item.el);
            delete item.el;
        }
        Ext.draw.VML.superclass.onRemove.call(this);
    },
    render: function (container) {
        var doc = Ext.getDoc().dom;
        if (!this.createNode) {
            doc.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
            try {
                if (!doc.namespaces.rvml) {
                    doc.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
                }
                this.createNode = function (tagName) {
                    return doc.createElement('<rvml:' + tagName + ' class="rvml">');
                };
            } catch (e) {
                this.createNode = function (tagName) {
                    return doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
                };
            }
        }

        if (!this.el) {
            var el = doc.createElement("div"),
                cs = el.style;
            this.span = doc.createElement("span");
            this.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
            el.appendChild(this.span);
            cs.cssText = Ext.util.Format.format("top:0;left:0;width:{0}px;height:{1}px;display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden", this.width || 500, this.height || 300);
            container.appendChild(el);
            this.el = Ext.get(el);
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

    renderAll: function() {
        this.items.each(this.renderItem, this);
    },

    renderItem: function (sprite) {
        if (!this.el) {
            return;
        }
        if (!sprite.el) {
            this.createElement(sprite);
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
            attr = sprite.attr,
            i,
            ln,
            node = sprite.el,
            nodeStyle = node.style,
            attrs,
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
                attrs.path = Ext.draw.pathToAbsolute(attr.path);
            break;
            case "text":
                font = attrs.font;
                if (font) {
                   sprite.vml.textpath.style.font = font;
                }
            break;
            case "image":
                node.src = attrs.src;
                if (attrs.opacity) {
                    node.filterOpacity = " progid:DXImageTransform.Microsoft.Alpha(opacity=" + (attrs.opacity * 100) + ")";
                    nodeStyle.filter = (node.filterMatrix || "") + (node.filterOpacity || "");
                }
            break;
        }
        Ext.applyIf(attrs, this.minDefaults[sprite.type]);
        if (attr.hidden != undefined) {
            attr.hidden ? this.hidePrim(sprite) : this.showPrim(sprite);
        }

        this.setFillAndStroke(sprite, attrs);
        this.setBox(sprite);
        sprite.dirty = false;
    },

    applyZIndex: function(sprite) {
        sprite.vml.g.style.zIndex = sprite.attr.zIndex;
        sprite.zIndexDirty = false;
    },

    applyTransformations: function(sprite) {
        var dirty = false;
        if (sprite.rotation.degrees != null) {
            this.rotate(sprite);
            dirty = true;
        }
        if (sprite.translation.x != null) {
            this.translate(sprite);
            dirty = true;
        }
        if (sprite.scaling.x != null || sprite.scaling.y != null) {
            this.scale(sprite);
            dirty = true;
        }
        if (dirty) {
            sprite.el.setAttribute("transform", sprite.transformations.join(" "));
        }
    },

    createItem: function (config) {
        var sprite = new Ext.draw.Sprite(config);
        sprite.transformations = [];
        return sprite;
    },

    translate: function(sprite) {
        var x = sprite.translation.x || 0,
            y = sprite.translation.y || 0,
            el = Ext.fly(sprite.vml.g);
        el.move('r', x);
        el.move('b', y);
    },

    getRegion: function() {
        return this.el.getRegion();
    },

    /**
     * Adds a definition to this Surface for a linear gradient. We convert the gradient definition
     * to its corresponding VML attributes and store it for later use by individual sprites.
     * @param {Object} gradient
     */
    addGradient: function(gradient) {
        var gradients = this.gradientsColl || (this.gradientsColl = new Ext.util.MixedCollection()),
            colors = [],
            stops = new Ext.util.MixedCollection();

        // Build colors string
        stops.addAll(gradient.stops);
        stops.sortByKey('ASC', function(a, b) {
            a = parseInt(a, 10);
            b = parseInt(b, 10);
            return a > b ? 1 : (a < b ? -1 : 0);
        });
        stops.eachKey(function(k, v) {
            colors.push(k + '% ' + v.color);
        });

        gradients.add(gradient.id, {
            colors: colors.join(','),
            angle: gradient.angle
        });
    },

    destroy: function() {
        Ext.draw.VML.superclass.destroy.call(this);
        Ext.removeNode(this.el);
        delete this.el;
    }
});
