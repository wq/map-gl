/*!
 * wq.app 0.8.1-dev - wq/map.js
 * Leaflet integration for wq/app.js pages
 * (c) 2013-2015, S. Andrew Sheppard
 * https://wq.io/license
 */

define(['leaflet', 'jquery', './json', './spinner',
        './template', './console', 'es5-shim'],
function(L, $, json, spin, tmpl, console) {

/* global require */
/* global Promise */

// module variable
var map = {
    'name': "map"
};

// module configuration
map.config = {
    'maps': {}, // Auto-populated from app.config.pages where map == true
    'defaults': {
        'bounds': [[-4, -4], [4, 4]],
        'autoZoom': {
            'wait': 0.5, // How long to wait before triggering autoZoom
            'sticky': true, // Start new maps in same location as old maps

            // Settings for fitBounds
            'maxZoom': 13,
            'animate': true
        },

        // Defaults to simplify creation of new icons of the same dimensions
        // as L.Icon.Default
        'icon': {
            'iconSize':    [25, 41],
            'iconAnchor':  [12, 41],
            'popupAnchor': [1, -34],
            'shadowSize':  [41, 41]
        },

        'owl': false
    }
};

// References to generated map objects
map.maps = {};

// References to generated icons
map.icons = {
    'default': new L.Icon.Default()
};

// This will be called by app.init()
map.init = function(defaults) {
    var app = map.app;
    if (!app) {
        console.warn(
            "Call app.use(map) rather than calling map.init() directly"
        );
        app = require('wq/app');
        app.use(map);
    }

    // Auto-detect whether CRS-aware GeoJSON parser is available
    map.geoJson = L.Proj ? L.Proj.geoJson : L.geoJson;

    // Assign after module load in case L.Icon.Default.imagePath is overridden
    map.config.defaults.icon.shadowUrl = (
        L.Icon.Default.imagePath + '/marker-shadow.png'
    );

    if (defaults) {
        L.extend(map.config.defaults, defaults);
    }

    // Define map configuration for all app pages with map=True
    Object.keys(app.config.pages).forEach(function(page) {
        var pconf = app.config.pages[page];
        if (!pconf.map) {
            return;
        }

        var mapconf = (pconf.map instanceof Object) ? pconf.map : {};
        if (!mapconf.name) {
            mapconf.name = pconf.name;
        }
        if (!mapconf.url) {
            mapconf.url = pconf.url;
        }

        // Initialize map configurations for each page display mode
        var modes = ['defaults'];
        if (pconf.list) {
            modes = modes.concat(['list', 'detail', 'edit']);
        }
        modes.forEach(function(mode) {
            if (!mapconf[mode]) {
                mapconf[mode] = {};
            }
            if (!mapconf[mode].layers) {
                mapconf[mode].layers = [];
                mapconf[mode].autoLayers = true;
            }
        });

        map.config.maps[page] = mapconf;

        if (pconf.list) {
            map.addAutoLayers(page);
        }
    });
};

// Plugin API
map.run = function(page, mode, itemid, url) {
    map.createMap(page, itemid, mode, url);
};

// Add a layer configuration (layerconf) to a map configuration
map.addLayerConf = function(page, layerconf, mode) {
    if (!mode) {
        mode = 'defaults';
    }
    if (!map.config.maps[page]) {
        throw 'Configuration for "' + page + '" not found!';
    }
    if (!map.config.maps[page][mode]) {
        throw 'Configuration for mode "' + mode + '" not found!';
    }
    if (!layerconf.type) {
        layerconf.type = 'geojson';
    }
    if (!map.createOverlay[layerconf.type]) {
        throw 'Unknown layer type "' + layerconf.type + '"!';
    }
    map.config.maps[page][mode].layers.push(layerconf);
};

// Define an icon for use by list items displayed as points
map.createIcon = function(name, options) {
    options = L.extend({}, map.config.defaults.icon, options);
    map.icons[name] = L.icon(options);
    return map.icons[name];
};

// Compute default layer configuration for wq REST API
map.addAutoLayers = function(page) {
    var listConf = _getConf(page, 'list');
    if (listConf.autoLayers) {
        map.addLayerConf(page, {
            'name': listConf.name,
            'type': 'geojson',
            'url': '{{{url}}}.geojson',
            'oneach': map.renderPopup(page),
            'cluster': true
        }, 'list');
    }

    var detailConf = _getConf(page, 'detail');
    if (detailConf.autoLayers) {
        map.addLayerConf(page, {
            'name': detailConf.name,
            'type': 'geojson',
            'url': detailConf.url + '/{{{id}}}.geojson',
            'oneach': map.renderPopup(page)
        }, 'detail');
    }

    var editConf = _getConf(page, 'edit');
    if (editConf.autoLayers) {
        map.addLayerConf(page, {
            'name': editConf.name,
            'type': 'geojson',
            'url': editConf.url + '/{{{id}}}.geojson',
            'oneach': map.renderPopup(page)
        }, 'edit');
    }
};

// Load map configuration for the given page
map.getLayerConfs = function(page, itemid, mode, url) {
    if (!mode) {
        if (map.app.config.pages[page].list) {
            mode = itemid ? 'list' : 'detail';
        }
    }
    var mapconf = _getConf(page, mode);
    var layers = [];
    if (!url) {
        url = mapconf.url;
        if (itemid) {
             url += '/' + itemid;
        }
    }
    mapconf.layers.forEach(function(layerconf) {
        layerconf = L.extend({}, layerconf);
        layerconf.url = tmpl.render(layerconf.url, {
            'id': itemid,
            'url': url.replace(/\/$/, '')
        });
        layers.push(layerconf);
    });
    return layers;
};

// Internal layer loading function - override to customize
map.cache = {};
map.loadLayer = function(url) {
    url = map.app.service + '/' + url;
    if (map.cache[url]) {
        return Promise.resolve(map.cache[url]);
    }
    spin.start();
    return json.get(url).then(function(geojson) {
        spin.stop();
        map.cache[url] = geojson;
        return geojson;
    });
};

// Default base maps - override to customize
map.createBaseMaps = function() {
    /* jshint maxlen: false */
    var mqcdn = "http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.png";

    // Attribution (https://gist.github.com/mourner/1804938)
    var osmAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
    var aerialAttr = 'Imagery &copy; NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency';
    var mqTilesAttr = 'Tiles &copy; <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png" />';

    return {
        "Street": L.tileLayer(mqcdn, {
            'subdomains': '1234',
            'type': 'map',
            'attribution': osmAttr + ', ' + mqTilesAttr
        }),
        "Aerial": L.tileLayer(mqcdn, {
            'subdomains': '1234',
            'type': 'sat',
            'attribution': aerialAttr + ', ' + mqTilesAttr
        })
    };
};

map.createOverlay = function(layerconf) {
    var fn = map.createOverlay[layerconf.type];
    return fn(layerconf);
};

map.addOverlayType = function(type, fn) {
    map.createOverlay[type] = fn;
};

map.addOverlayType('geojson', function(layerconf) {
    var overlay;
    if (layerconf.cluster && L.MarkerClusterGroup) {
        var options = {};
        if (layerconf.clusterIcon) {
            options.iconCreateFunction = layerconf.clusterIcon;
        }
        overlay = new L.MarkerClusterGroup(options);
    } else {
        overlay = L.featureGroup();
    }

    // Load layer content as JSON
    overlay.ready = map.loadLayer(layerconf.url).then(function(geojson) {
        var options = {};
        if (layerconf.oneach) {
            options.onEachFeature = layerconf.oneach;
        }
        if (layerconf.icon) {
            options.pointToLayer = _makeMarker(layerconf.icon);
        }
        if (layerconf.style) {
            options.style = layerconf.style;
        }
        map.geoJson(geojson, options).addTo(overlay);
    });

    return overlay;
});

map.createLayerControl = function(basemaps, layers) {
    return L.control.layers(basemaps, layers);
};

// Default popup renderer for items - override to customize
// (assumes template called [page]_popup)
map.renderPopup = function(page) {
    var owl = map.config.defaults.owl && require('wq/owl');
    return function(feat, layer) {
        var attrs = L.extend({'id': feat.id}, feat.properties);
        layer.bindPopup(
            tmpl.render(page + '_popup', attrs)
        );
        if (owl) {
            layer.on('click', function() {
                owl('map:layerclick', {'page': page, 'id': feat.id});
            });
        }
    };
};

// Primary map routine
map.createMap = function(page, itemid, mode, url, divid) {
    var mapid, mapconf, m, defaults,
        layerConfs, layers,
        basemaps, basemap, div, owl;

    // Load configuration and div id
    mapconf = _getConf(page, mode);
    defaults = map.config.defaults;
    // If defaults.owl, assume wq/owl has been async-loaded already
    owl = defaults.owl && require('wq/owl');

    if (itemid) {
        mapid = page + '-' + itemid;
        if (mode == 'edit') {
            mapid += '-edit';
        }
    } else {
        mapid = page;
    }

    if (!divid) {
        if (mapconf.div) {
            divid = mapconf.div;
        } else {
            divid = mapid + '-map';
        }
    }

    div = L.DomUtil.get(divid);
    if (!div) {
        // Skip map creation if the expected div doesn't exist
        console.log(divid + ' not found; skipping map creation');
        return;
    }

    // Make sure leaflet hasn't already been initialized for this map
    if (div._leaflet) {
        // This is probably an onshow event for a page that was rendered
        // and then went offscreen before coming back; refresh layout.
        m = map.maps[mapid];
        m.invalidateSize();
        if (defaults.autoZoom.sticky) {
            m.fitBounds(defaults.bounds);
        }
        return;
    }

    // Create map, set default zoom and basemap
    m = map.maps[mapid] = L.map(divid);
    m.fitBounds(defaults.bounds);
    basemaps = map.createBaseMaps();
    basemap = Object.keys(basemaps)[0];
    basemaps[basemap].addTo(m);

    // Load layerconfs and add empty layer groups to map
    layers = {};
    layerConfs = map.getLayerConfs(page, itemid, mode, url);
    var overlays = layerConfs.map(map.createOverlay);
    var results = [];
    layerConfs.forEach(function(layerconf, i) {
        var layer = overlays[i];
        layers[layerconf.name] = layer;
        if (layer.ready) {
            results.push(layer.ready);
        }
        if (!layerconf.noAutoAdd) {
            layer.addTo(m);
        }
    });

    map.createLayerControl(basemaps, layers).addTo(m);

    Promise.all(results).then(autoZoom);

    function autoZoom() {
        if (mapconf.autoZoom !== undefined && !mapconf.autoZoom) {
            return;
        }
        if (!map.config.defaults.autoZoom) {
            return;
        }
        var lnames = Object.keys(layers);
        if (!lnames.length) {
            return;
        }
        var bounds = layers[lnames[0]].getBounds();
        if (lnames.length > 1) {
            lnames.slice(1).forEach(function(lname) {
                bounds.extend(layers[lname].getBounds());
            });
        }
        if (mapconf.minBounds) {
            bounds.extend(mapconf.minBounds);
        }
        setTimeout(function() {
            m.fitBounds(bounds, map.config.defaults.autoZoom);
        }, map.config.defaults.autoZoom.wait * 1000);
    }

    if (map.config.defaults.autoZoom.sticky) {
        m.on('moveend', function() {
            map.config.defaults.bounds = m.getBounds();
        });
    }
    if (owl) {
        m.on('moveend', function() {
            owl('map:moveend', {
                'zoom': m.getZoom(),
                'center': m.getCenter(),
                'bounds': m.getBounds()
            });
        });
        [
            'baselayerchange',
            'overlayadd',
            'overlayremove'
        ].forEach(_layerEvent);
    }
    function _layerEvent(name) {
        m.on(name, function(evt) {
            owl('map:' + name, {'layer': evt.name});
        });
    }

    // Ensure valid layout on screen
    setTimeout(function() {
        m.invalidateSize();
    }, 100);

    // Try to ensure no Leaflet widgets are enhanced by jQuery Mobile
    var $controls = $(div).find(".leaflet-control-container");
    $controls.find("input").attr("data-role", "none");

    if (mapconf.onshow) {
        mapconf.onshow(m, mode, itemid);
    }

    return m;
};

// Internal function for creating markers (used with layerconf.icon)
function _makeMarker(icon) {
    return function pointToLayer(geojson, latlng) {
        // Define icon as a function to customize per-feature
        var key;
        if (typeof icon == 'function') {
            key = icon(geojson.properties);
        } else {
            key = icon;
        }
        return L.marker(latlng, {'icon': map.icons[key]});
    };
}

// Load map configuration for a given page
function _getConf(page, mode) {
    var conf = map.config.maps[page];
    if (!conf) {
        throw 'Configuration for "' + page + '" not found!';
    }

    // Options that apply to all modes
    var mapconf = {};
    var reserved = ['defaults', 'list', 'detail', 'edit'];
    Object.keys(conf).forEach(function(key) {
        if (reserved.indexOf(key) > -1) {
            return;
        }
        mapconf[key] = conf[key];
    });

    // Mix in mode-specific options
    L.extend(mapconf, conf.defaults);
    if (mode && mode != 'defaults') {
        mapconf.layers = mapconf.layers.slice().concat(conf[mode].layers);
        Object.keys(conf[mode]).forEach(function(key) {
            if (key != 'layers') {
                mapconf[key] = conf[mode][key];
            }
        });
    }
    return mapconf;
}

return map;

});
