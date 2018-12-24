class Map {
  constructor() {
    const savedCoordinates = JSON.parse(localStorage.getItem('latlng'));
    this.activeMarkers = [];
    this.storedMarkers = JSON.parse(localStorage.getItem('markers')) || [];
    this.partyLatlng = savedCoordinates || [600, 600];
    this.marksHidden = true;
    this.map = L.map('map', {
      crs: L.CRS.Simple,
      maxZoom: 2,
      minZoom: 0,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      zoomControl: false,
      scrollWheelZoom: false
    });
  }

  initiate() {
    this.createMap();
    this.createMarkers();
    this.createEvents();
  }

  createMap() {
    const img = new Image();
    img.src = 'images/map.jpg';
    img.onload = () => {
      let { height, width } = img;
      if (height > width && height > 1280) {
        width = 1280 * (width / height);
        height = 1280;
      } else if (width > height && width > 1280) {
        height = 1280 * (height / width);
        width = 1280;
      }
      const bounds = [[0, 0], [height, width]];

      L.imageOverlay('images/map.jpg', bounds).addTo(this.map);
      this.map.fitBounds(bounds);
      this.map.setView(this.partyLatlng, 2);
    };
  }

  createMarkers() {
    const icon = L.icon({
      iconUrl: 'images/redmark.png',
      iconSize: [25, 40],
      iconAnchor: [10, 37]
    });

    this.partyMarker = L.marker(L.latLng(this.partyLatlng), {
      draggable: true,
      icon
    });
    this.partyMarker.addTo(this.map);

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
    mark.addTo(this.map);

    this.activeMarkers.push(newMarker);
  }

  createEvents() {
    document.onkeypress = e => {
      if (e.keyCode === 104) {
        $('.control').toggleClass('hide');
      }
    };

    this.partyMarker.on('dragend', function(ev) {
      const coordinates = ev.target._latlng;
      const latlng = [coordinates.lat, coordinates.lng];
      localStorage.setItem('latlng', JSON.stringify(latlng));
    });

    $('.add-marker-control').on('click', e => {
      this.map._container.style.cursor = 'crosshair';
      this.map.addEventListener('click', this.onMapClickAddMarker.bind(this));
      $('.add-marker-control').addClass('active');
      $('.leaflet-container').addClass('add-mode');
    });

    $('.del-marker-control').on('click', e => {
      this.map._container.style.cursor = 'crosshair';
      $('.del-marker-control').toggleClass('active');
      this.deleteMode = true;
    });

    $('.hide-marker-control').on('click', e => {
      $('.hide-marker-control').toggleClass('active');
      this.toggleHideMarkers();
    });

    $('.clear-marker-control').on('click', e => {
      this.removeAllMarkers();
    });

    $('.night-mode-control').on('click', e => {
      $('body').toggleClass('night-mode');
      $('.night-mode-control').toggleClass('active');
    });

    $('.fog-mode-control').on('click', e => {
      $('body').toggleClass('fog-mode');
      $('.fog-mode-control').toggleClass('active');
    });

    // $('.settings-control, .settings-mask').on('click', e => {
    //   e.stopPropagation();
    //   $('.settings-control').toggleClass('active');
    //   $('body').toggleClass('modal');
    // });

    // $('#map-upload').on('change', e => {
    //   console.log(e.target.value);
    // });

    $('.zoomin-control').on('click', e => {
      const currentZoom = this.map.getZoom();
      const maxZoom = this.map.getMaxZoom();

      if (currentZoom === maxZoom) return;
      this.map.setZoom(currentZoom + 0.5);
      $('.zoomout-control').removeClass('active');
      if (maxZoom === currentZoom + 0.5) {
        $('.zoomin-control').addClass('active');
      }
    });

    $('.zoomout-control').on('click', e => {
      const currentZoom = this.map.getZoom();
      const minZoom = this.map.getMinZoom();

      if (currentZoom === minZoom) return;
      this.map.setZoom(currentZoom - 0.5);
      $('.zoomin-control').removeClass('active');
      if (minZoom === currentZoom - 0.5) {
        $('.zoomout-control').addClass('active');
      }
    });
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
        this.map.removeLayer(marker.mark);
      });
    this.storedMarkers = [];
    localStorage.setItem('markers', JSON.stringify(this.storedMarkers));
  }

  onMapClickAddMarker(e) {
    this.map._container.style.cursor = 'grab';
    $('.add-marker-control').toggleClass('active');
    $('.leaflet-container').removeClass('add-mode');
    const label = window.prompt('Marker Label?');
    this.map.removeEventListener('click');

    const marker = { latlng: e.latlng, title: label };
    this.createMarker(marker);
    this.storedMarkers.push(marker);
    localStorage.setItem('markers', JSON.stringify(this.storedMarkers));
  }

  onMarkerClickDelete(e) {
    if (!this.deleteMode) return;
    this.map._container.style.cursor = 'grab';
    $('.del-marker-control').toggleClass('active');
    const { lat, lng } = e.latlng;

    this.activeMarkers.forEach((marker, index) => {
      if (marker.latlng.lat === lat && marker.latlng.lng === lng) {
        this.map.removeLayer(marker.mark);
        this.storedMarkers.splice(index, 1);
      }
    });

    this.deleteMode = false;
    localStorage.setItem('markers', JSON.stringify(this.storedMarkers));
  }
}

const NewMap = new Map();
NewMap.initiate();
