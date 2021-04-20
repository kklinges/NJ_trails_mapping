import makeMap from './map.js'
import sources from './mapSources.js'
import layers from './mapLayers.js'
import handleModal from './modal.js'
// add additional imports here (popups, forms, etc)


const modal = document.getElementById('modal')
const modalToggle = document.getElementById('modal-toggle')
const closeModal = document.getElementById('close-modal')
// get additional elements here (forms, etc)


// map
const map = makeMap()

map.on('load', () => {
    for(const source in sources) map.addSource(source, sources[source])
    for(const layer in layers) map.addLayer(layers[layer]);
    //KK added//
    map.addSource(
        'NJ_trails',
        {'type':'geojson',
        'data': 'https://arcgis.dvrpc.org/portal/rest/services/Transportation/NJ_Trails/FeatureServer/0/query?where=1=1&oursr=4326&outfields=*&f=geojson'
    });
    map.addLayer({
        'id':'NJ Trails',
        'type':'line',
        'source':'NJ_trails',
        'layout':{'visibility': 'visible'},
        'paint':{
            'line-width':3,
            'line-color': [
                "case",
                ["==", ["get","surface"], "S"],
                "#715427",
                ["==", ["get","surface"], "CSG"],
                "#000066",
                ["==", ["get","surface"], "D"],
                "#fa751f",
                ["==", ["get","surface"], "G"],
                "#266900",
                ["==", ["get","surface"], "P"],
                "#ff80ed",
                ["==", ["get","surface"], "SD"],
                "#407294",
                ["==", ["get","surface"], "V"],
                "#ffdb00",
                "#794d8d"],
            'line-opacity':1}
    });
    map.addSource(
        'circuit_trails',
        {'type':'geojson',
        'data':'https://opendata.arcgis.com/datasets/4a1321bb7b6f403da0c244402bcb0c0a_0.geojson'
        });
    map.addLayer({
        'id':'Circuit Trails',
        'type':'line',
        'source':'circuit_trails',
        'layout':{'visibility': 'visible'},
        'paint':{
        'line-width':1.5,
        'line-color':'#4fe314'
        }
    });
             // Grey Mask for PA Counties
             map.addLayer({
                "id": "county2",
                "type": "fill",
                "source": {
                    type: 'vector',
                    url: 'https://tiles.dvrpc.org/data/dvrpc-municipal.json'
                },
                "source-layer": "county",
                "layout": {},
                paint: {
                // 'fill-outline-color': '#f7c59f',
                 'fill-color': 'rgba(0,0,0,0.1)'
                },
                "filter": 
                //["==","dvrpc","Yes"]
                ["all",["!=","name","Burlington"],["!=","name","Camden"],["!=","name","Mercer"],["!=","name","Gloucester"]]
              });
  
              map.addSource('cnty', {
              'type': 'geojson',
                 'data':"https://arcgis.dvrpc.org/portal/rest/services/Boundaries/CountyBoundaries/FeatureServer/0/query?where=co_name+%3D+%27Bucks%27+or+co_name+%3D+%27Chester%27+or+co_name+%3D+%27Delaware%27+or+co_name+%3D+%27Montgomery%27+or+co_name+%3D+%27Philadelphia%27&outFields=*&returnGeometry=true&geometryPrecision=8&outSR=4326&f=geojson"
              });

});

// When a click event occurs on a feature in the states layer, open a popup at the
// location of the click, with description HTML from its properties.
map.on('click', 'NJ Trails', function (e) {
    if (e.features[0].properties["multi_use"] === "N"){ var mu_status = "<br/><b>Multi-Use:</b> No"   ;}
    else if (e.features[0].properties["multi_use"] === "Y"){ var mu_status = "<br/><b>Multi-Use:</b> Yes";}
    else if (e.features[0].properties["multi_use"] === "Yes"){ var mu_status = "<br/><b>Multi-Use:</b> Yes";}
    else if (e.features[0].properties["multi_use"] === "No"){ var mu_status = "<br/><b>Multi-Use:</b> No"   ;}
    else { var mu_status = "";}

    if (e.features[0].properties["owner"] === "null"){ var owner_txt = "" ;}
    else {var owner_txt="<br><b>Owner: </b>" + e.features[0].properties["owner"];}

    new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML('<b>Trail Name: </b>' + e.features[0].properties["name"]
     +  mu_status
     + owner_txt)
    .addTo(map);
    });



// Change the cursor to a pointer when the mouse is over the trails layer.
map.on('mouseenter', 'NJ Trails', function () {
    map.getCanvas().style.cursor = 'pointer';
    });

// Change it back to default when it leaves.
map.on('mouseleave', 'NJ Trails', function () {
    map.getCanvas().style.cursor = '';
    });

//Click Circuit Trails
    map.on('click', 'Circuit Trails', function (e) {
        new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML('<b>Trail Name: </b>' + e.features[0].properties["name"]
         + '<br>' + "<b>Status: </b>" + e.features[0].properties["circuit"])
        .addTo(map);
        });
    // Change the cursor to a pointer when the mouse is over the trails layer.
    map.on('mouseenter', 'Circuit Trails', function () {
        map.getCanvas().style.cursor = 'pointer';
        });
    
    // Change it back to default when it leaves.
    map.on('mouseleave', 'Circuit Trails', function () {
        map.getCanvas().style.cursor = '';
        });

// modal
handleModal(modal, modalToggle, closeModal)



//Make layers selectable
// After the last frame rendered before the map enters an "idle" state.
map.on('idle', function () {
    // If these two layers have been added to the style,
    // add the toggle buttons.
    if (map.getLayer('NJ Trails') && map.getLayer('Circuit Trails')) {
    // Enumerate ids of the layers.
    var toggleableLayerIds = ['NJ Trails', 'Circuit Trails'];
    // Set up the corresponding toggle button for each layer.
    for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];
    if (!document.getElementById(id)) {
    // Create a link.
    var link = document.createElement('a');
    link.id = id;
    link.href = '#';
    link.textContent = id;
    link.className = 'active';
    // Show or hide layer when the toggle is clicked.
    link.onclick = function (e) {
    var clickedLayer = this.textContent;
    e.preventDefault();
    e.stopPropagation();
     
    var visibility = map.getLayoutProperty(
    clickedLayer,
    'visibility'
    );
     
    // Toggle layer visibility by changing the layout object's visibility property.
    if (visibility === 'visible') {
    map.setLayoutProperty(
    clickedLayer,
    'visibility',
    'none'
    );
    this.className = '';
    } else {
    this.className = 'active';
    map.setLayoutProperty(
    clickedLayer,
    'visibility',
    'visible'
    );
    }
    };
    var layers = document.getElementById('menu');
    layers.appendChild(link);}}
    }});



