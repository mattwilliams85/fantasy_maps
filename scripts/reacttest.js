const MAXSIZE = 1280;

class FantasyMap extends React.Component {
  constructor() {
    this.state = {
      activeMarkers: [],
      storedMarkers: SON.parse(localStorage.getItem('markers')) || [],
      partyLatLng: JSON.parse(localStorage.getItem('latlng')) || [0, 0],
      marksHidden: true,
      map: L.map('map', {
        crs: L.CRS.Simple,
        maxZoom: 2,
        minZoom: 0,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        zoomControl: false,
        scrollWheelZoom: false
      })
    };
  }

  componentDidMount() {
    this.createMap();
    this.createMarkers();
    this.createEvents();
  }

  getDimensionLimits(x, y) {
    if (x > y && x > MAXSIZE) {
      y = MAXSIZE * (y / x);
      x = MAXSIZE;
    } else if (y > x && y > MAXSIZE) {
      x = MAXSIZE * (x / y);
      y = MAXSIZE;
    }
    return [x, y];
  }

  createMap() {
    const img = new Image();
    img.src = 'images/map.jpg';
    img.onload = () => {
      const { height, width } = img;
      const dimensions = getDimensionLimits(height, width);
      const bounds = [[0, 0], dimensions];

      L.imageOverlay('images/map.jpg', bounds).addTo(this.state.map);
      this.state.map.fitBounds(bounds);
      this.state.map.setView(this.partyLatlng, 2);
    };
  }

  createMarkers() {
    const icon = L.icon({
      iconUrl: 'images/redmark.png',
      iconSize: [25, 40],
      iconAnchor: [10, 37]
    });

    this.state.partyMarker = L.marker(L.latLng(this.partyLatlng), {
      draggable: true,
      icon
    });
    this.partyMarker.addTo(this.state.map);

    this.storedMarkers.forEach(marker => {
      this.createMarker(marker);
    });
  }

  createMarker(marker) {
    const newMarker = Object.assign({}, marker);
    const { latlng, title } = newMarker;
    const mark = L.marker(L.latLng(latlng));
    newMarker.mark = mark;

    newMarker.mark.addEventListener(
      'click',
      this.onMarkerClickDelete.bind(this)
    );
    if (title) mark.bindTooltip(title);
    mark.addTo(this.state.map);

    this.activeMarkers.push(newMarker);
  }

  createEvents() {
    document.onkeypress = e => {
      if (e.keyCode === 104) {
        $('.control').toggleClass('hide');
      }
    };
  }

  toggleHideMarkers() {
    this.activeMarkers.forEach(marker => {
      const { mark, options } = marker;

      if (options) return;
      this.marksHidden ? mark.setOpacity(0) : mark.setOpacity(1);
    });
    this.marksHidden = !this.marksHidden;
  }

  removeAllMarkers() {
    if (
      window.confirm(
        'This will permanently remove all map points, are you sure?'
      )
    )
      this.activeMarkers.forEach(marker => {
        this.state.map.removeLayer(marker.mark);
      });
    this.storedMarkers = [];
    localStorage.setItem('markers', JSON.stringify(this.storedMarkers));
  }

  onMapClickAddMarker(e) {
    this.state.map._container.style.cursor = 'grab';
    $('.add-marker-control').toggleClass('active');
    $('.leaflet-container').removeClass('add-mode');
    const label = window.prompt('Marker Label?');
    this.state.map.removeEventListener('click');

    const marker = { latlng: e.latlng, title: label };
    this.createMarker(marker);
    this.storedMarkers.push(marker);
    localStorage.setItem('markers', JSON.stringify(this.storedMarkers));
  }

  onMarkerClickDelete(e) {
    if (!this.deleteMode) return;
    this.state.map._container.style.cursor = 'grab';
    $('.del-marker-control').toggleClass('active');
    const { lat, lng } = e.latlng;

    this.activeMarkers.forEach((marker, index) => {
      if (marker.latlng.lat === lat && marker.latlng.lng === lng) {
        this.state.map.removeLayer(marker.mark);
        this.storedMarkers.splice(index, 1);
      }
    });

    this.deleteMode = false;
    localStorage.setItem('markers', JSON.stringify(this.storedMarkers));
  }

  render() {
    return <div>hi</div>;
  }
}

//   this.partyMarker.on('dragend', function(ev) {
//     const coordinates = ev.target._latlng;
//     const latlng = [coordinates.lat, coordinates.lng];
//     localStorage.setItem('latlng', JSON.stringify(latlng));
//   });

//   $('.add-marker-control').on('click', e => {
//     this.state.map._container.style.cursor = 'crosshair';
//     this.state.map.addEventListener('click', this.onMapClickAddMarker.bind(this));
//     $('.add-marker-control').addClass('active');
//     $('.leaflet-container').addClass('add-mode');
//   });

//   $('.del-marker-control').on('click', e => {
//     this.state.map._container.style.cursor = 'crosshair';
//     $('.del-marker-control').toggleClass('active');
//     this.deleteMode = true;
//   });

//   $('.hide-marker-control').on('click', e => {
//     $('.hide-marker-control').toggleClass('active');
//     this.toggleHideMarkers();
//   });

//   $('.clear-marker-control').on('click', e => {
//     this.removeAllMarkers();
//   });

//   $('.night-mode-control').on('click', e => {
//     $('body').toggleClass('night-mode');
//     $('.night-mode-control').toggleClass('active');
//   });

//   $('.fog-mode-control').on('click', e => {
//     $('body').toggleClass('fog-mode');
//     $('.fog-mode-control').toggleClass('active');
//   });

// $('.settings-control, .settings-mask').on('click', e => {
//   e.stopPropagation();
//   $('.settings-control').toggleClass('active');
//   $('body').toggleClass('modal');
// });

// $('#map-upload').on('change', e => {
//   console.log(e.target.value);
// });

//   $('.zoomin-control').on('click', e => {
//     const currentZoom = this.state.map.getZoom();
//     const maxZoom = this.state.map.getMaxZoom();

//     if (currentZoom === maxZoom) return;
//     this.state.map.setZoom(currentZoom + 0.5);
//     $('.zoomout-control').removeClass('active');
//     if (maxZoom === currentZoom + 0.5) {
//       $('.zoomin-control').addClass('active');
//     }
//   });

//   $('.zoomout-control').on('click', e => {
//     const currentZoom = this.state.map.getZoom();
//     const minZoom = this.state.map.getMinZoom();

//     if (currentZoom === minZoom) return;
//     this.state.map.setZoom(currentZoom - 0.5);
//     $('.zoomin-control').removeClass('active');
//     if (minZoom === currentZoom - 0.5) {
//       $('.zoomout-control').addClass('active');
//     }
//   });
// }
