// Initialize the map centered on Saudi Arabia
const map = L.map('map', {
    zoomControl: false,
    attributionControl: false
}).setView([24.7136, 46.6753], 6);

// Add custom styled tiles
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
}).addTo(map);

// Add zoom control to top-left
L.control.zoom({
    position: 'topleft'
}).addTo(map);

// Add this helper function to calculate the convex hull
function calculateConvexHull(points) {
    // Graham Scan algorithm for convex hull
    function cross(o, a, b) {
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    }
    
    points.sort(function(a, b) {
        return a[0] - b[0] || a[1] - b[1];
    });
    
    var lower = [];
    for (var i = 0; i < points.length; i++) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) {
            lower.pop();
        }
        lower.push(points[i]);
    }
    
    var upper = [];
    for (var i = points.length - 1; i >= 0; i--) {
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) {
            upper.pop();
        }
        upper.push(points[i]);
    }
    
    upper.pop();
    lower.pop();
    return lower.concat(upper);
}

// Initialize marker clusters with modified options
const markers = L.markerClusterGroup({
    maxClusterRadius: 30,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false, // Disable default cluster hover
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 8,
    iconCreateFunction: function(cluster) {
        var count = cluster.getChildCount();
        var points = cluster.getAllChildMarkers().map(marker => [
            marker.getLatLng().lat,
            marker.getLatLng().lng
        ]);
        
        // Calculate and store the convex hull points
        cluster._convexHull = calculateConvexHull(points);
        
        return L.divIcon({
            html: `<div class="cluster-icon">${count}</div>`,
            className: 'custom-cluster',
            iconSize: L.point(40, 40)
        });
    }
});

// Active polygon tracker
let activePolygon = null;

// Enhanced hover events for clusters
markers.on('clustermouseover', function(event) {
    const cluster = event.layer;
    if (cluster._convexHull && cluster._convexHull.length > 2) {
        // Remove any existing active polygon
        if (activePolygon) {
            map.removeLayer(activePolygon);
        }
        
        // Create new polygon using convex hull points
        activePolygon = L.polygon(cluster._convexHull, {
            color: '#1a237e',
            weight: 2,
            opacity: 0.8,
            fillColor: '#1a237e',
            fillOpacity: 0.1,
            className: 'cluster-hover-polygon'
        }).addTo(map);
    }
});

markers.on('clustermouseout', function(event) {
    if (activePolygon) {
        map.removeLayer(activePolygon);
        activePolygon = null;
    }
});

// Handle zoom events to clear active polygon
map.on('zoomstart', function() {
    if (activePolygon) {
        map.removeLayer(activePolygon);
        activePolygon = null;
    }
});

// Location data
const locations = [
    // Jeddah Region
    {
        type: "main",
        code: "JD01",
        name: "Jeddah",
        coords: [21.543333, 39.172779],
        gps_url: 'https://maps.app.goo.gl/X1HcotY2nhu7MsFd9'
    },
    {
        type: "sales office",
        code: "JDMK",
        name: "Makkah",
        coords: [21.384651764836086, 39.71107208465808],
        gps_url: 'https://maps.app.goo.gl/uGiBjyE87SVv68PN7'
    },
    {
        type: "sales office",
        code: "JDTF",
        name: "Taif",
        coords: [21.282482206647664, 40.40412918043725],
        gps_url: 'https://maps.app.goo.gl/i7vCqV2geTnbufCc6'
    },

    // Riyadh Region
    {
        type: "main",
        code: "RY01",
        name: "Riyadh",
        coords: [24.713552, 46.675297],
        gps_url: 'https://maps.app.goo.gl/K8v67nbmvanprBQ19'
    },
    {
        type: "sales office",
        code: "RYKJ",
        name: "AlKarj",
        coords: [24.155979, 47.318161],
        gps_url: 'https://maps.app.goo.gl/RMLpaFMJrsX1iYJSA?g_st=ic'
    },

    // Dammam Region
    {
        type: "main",
        code: "DM01",
        name: "Dammam",
        coords: [26.434373, 50.103115],
        gps_url: 'https://maps.app.goo.gl/LgJw55K7YKm4AVfQ6'
    },
    {
        type: "sales office",
        code: "DMJB",
        name: "Jobail",
        coords: [27.0174, 49.6225],
        gps_url: 'https://maps.app.goo.gl/YLjbEPWgYwoNyvmPA'
    },
    {
        type: "sales office",
        code: "DMHB",
        name: "Hafer AlBaten",
        coords: [28.4337, 45.9601],
        gps_url: 'https://maps.app.goo.gl/dG4X4fK88D6HfAb16?g_st=iw'
    },
    {
        type: "sales office",
        code: "DMSK",
        name: "Sikaka",
        coords: [29.9697, 40.2064],
        gps_url: 'https://maps.app.goo.gl/bsdjAevPAWKKHVm26?g_st=iw'
    },
    {
        type: "sales office",
        code: "DMQR",
        name: "AlQorayat",
        coords: [31.3318, 37.3429],
        gps_url: 'https://maps.app.goo.gl/1KZjj4Yafvaut9og9'
    },

    // Khamis Mushait Region
    {
        type: "main",
        code: "KM01",
        name: "Kamis Moshat",
        coords: [18.3093, 42.7662],
        gps_url: 'https://maps.app.goo.gl/tJm3G23Nh9MXuDeN9'
    },
    {
        type: "sales office",
        code: "KMGZ",
        name: "Jazan",
        coords: [16.8892, 42.5511],
        gps_url: 'https://maps.app.goo.gl/xm5oBodeKght8i3B6?g_st=iw'
    },
    {
        type: "sales office",
        code: "KMBH",
        name: "AlBaha",
        coords: [20.0129, 41.4677],
        gps_url: 'https://maps.app.goo.gl/okpdtr2FRXiqCMT27'
    },
    {
        type: "sales office",
        code: "KMMH",
        name: "Mahayel Asire",
        coords: [18.5503, 42.0499],
        gps_url: 'https://maps.app.goo.gl/BuXeYMb2Pau64kgN9'
    },
    {
        type: "sales office",
        code: "KMBS",
        name: "Bisha",
        coords: [19.9915, 42.6109],
        gps_url: 'https://maps.app.goo.gl/xjvZUH4fJaLERYXx5'
    },
    {
        type: "sales office",
        code: "KMQF",
        name: "AlQonfza",
        coords: [19.1247, 41.0783],
        gps_url: 'https://maps.app.goo.gl/gAiX1EsBNfgk8Kfv9'
    },
    {
        type: "sales office",
        code: "KMNM",
        name: "AlNamas",
        coords: [19.1207, 42.1375],
        gps_url: 'https://maps.app.goo.gl/iPG9pjMB9RgZDN6U9'
    },
    {
        type: "sales office",
        code: "KMWD",
        name: "Wadi AlDawasser",
        coords: [20.4716, 43.9159],
        gps_url: 'https://maps.app.goo.gl/UDkAum11LpPFxGdd7?g_st=iw'
    },
    {
        type: "sales office",
        code: "KMNG",
        name: "Najran",
        coords: [17.527675451390703, 44.19365786684825],
        gps_url: 'https://maps.app.goo.gl/jbmSGcBq1PVPb9QQ7'
    },
    {
        type: "main",
        code: "QA01",
        name: "Qassim",
        coords: [26.279776853015807, 44.01528109202862],
        gps_url: 'https://maps.app.goo.gl/ynPsbM2SrY64b71u8'
    },
    {
        type: "sales office",
        code: "QARS",
        name: "AlRass",
        coords: [25.861384073489585, 43.490065238248434],
        gps_url: 'https://maps.google.com/maps?q=25.8611717%2C43.4900867&z=17&hl=en'
    },
    {
        type: "sales office",
        code: "QAMJ",
        name: "AlMajmaa",
        coords: [25.918670521318635, 45.38121323825036],
        gps_url: 'https://maps.google.com/maps?q=25.9184872%2C45.3812347&z=17&hl=en'
    },
    {
        type: "sales office",
        code: "QADW",
        name: "AlDawadmi",
        coords: [24.49221101288227, 44.37684095582259],
        gps_url: 'https://maps.app.goo.gl/XzD2PQxG8cW54rLj6'
    },
    {
        type: "sales office",
        code: "QAHL",
        name: "Hail",
        coords: [27.518218576814146, 41.665484380634425],
        gps_url: 'https://maps.google.com/maps?q=27.518028259277344%2C41.66552734375&z=17&hl=en'
    },
    {
        type: "main",
        code: "MM01",
        name: "Madina",
        coords: [24.479464043106894, 39.607864533338045],
        gps_url: 'https://goo.gl/maps/hcNorE5AsWNoAVMC8'
    },
    {
        type: "main",
        code: "MMYN",
        name: "Yanbou",
        coords: [24.09560315041013, 38.069624456321655],
        gps_url: 'https://maps.app.goo.gl/SEYd4VmxUsF91eaD8'
    },
    {
        type: "sales office",
        code: "MMTB",
        name: "Tabouk",
        coords: [28.40991571039308, 36.546013267172896],
        gps_url: 'https://maps.google.com/?q=28.409727,36.546024'
    },
    {
        type: "main",
        code: "AH01",
        name: "Hassa",
        coords: [25.385964616798475, 49.59527882134313],
        gps_url: 'https://maps.app.goo.gl/KymFgM1JGyeca2hZ9'
    }

];

// Create custom markers and add to map
locations.forEach(location => {
    const marker = L.marker(location.coords, {
        icon: L.divIcon({
            className: 'custom-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 20], // Adjusted anchor point
            popupAnchor: [0, -20],
        })
    }).bindPopup(`
        <div class="popup-contain">
            <div class="close-btn" onclick="this.parentElement.style.display='none'">×</div>
            <strong>${location.name}</strong><br>
            <div class="details">${location.code} - ${location.type} </div>
            <a href="${location.gps_url}" target="_blank" class="direction-btn">Direction</a>
        </div>
    `);
    markers.addLayer(marker);
});

// Add markers to the map
map.addLayer(markers);

// Filter buttons functionality
const filterButtons = document.querySelectorAll('.filter-button');
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const type = button.dataset.type;

        markers.clearLayers();
        locations.forEach(location => {
            if (type === "all" || location.type === type) {
                const marker = L.marker(location.coords, {
                    icon: L.divIcon({
                        className: 'custom-marker',
                        iconSize: [20, 20],
                        iconAnchor: [10, 20], // Adjusted anchor point
                        popupAnchor: [0, -20],
                    })
                }).bindPopup(`
                    <div class="popup-contain">
                        <div class="close-btn" onclick="this.parentElement.style.display='none'">×</div>
                        <strong>${location.name}</strong><br>
                        <div class="details">${location.code} - ${location.type} </div>
                        <a href="${location.gps_url}" target="_blank" class="direction-btn">Direction</a>
                    </div>
                `);
                markers.addLayer(marker);
            }
        });
        map.addLayer(markers);
    });
});