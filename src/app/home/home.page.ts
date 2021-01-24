import { OnInit, AfterContentInit, Component, ViewChild } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import * as Leaflet from 'leaflet';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';

import { ModalController } from '@ionic/angular';
import { ModalComponent } from '../modal/modal.component';



const hereIcon = Leaflet.icon({
  iconUrl: 'assets/icon/hereicon.png',
  iconSize: [20, 20],
  iconAnchor: [0, 0],
  popupAnchor: [0, 0],
  //shadowUrl: 'my-icon-shadow.png',
  // shadowSize: [68, 95],
  // shadowAnchor: [22, 94]
});

const arriveIcon = Leaflet.icon({
  iconUrl: 'assets/icon/arriveicon.png',
  iconSize: [20, 20],
  iconAnchor: [0, 0],
  popupAnchor: [0, 0],
  //shadowUrl: 'my-icon-shadow.png',
  // shadowSize: [68, 95],
  // shadowAnchor: [22, 94]
});

const startIcon = Leaflet.icon({
  iconUrl: 'assets/icon/starticonnew.png',
  iconSize: [20, 20],
  iconAnchor: [0, 0],
  popupAnchor: [0, 0],
  //shadowUrl: 'my-icon-shadow.png',
  // shadowSize: [68, 95],
  // shadowAnchor: [22, 94]
});

const GeolocationOption = { enableHighAccuracy: true };

const startType = 0
const arriveType = 1
const intermediateType = 2


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {




  map: Leaflet.Map;
  mapOptions: any;
  mapCenter = { lat: null, lng: null };
  zoom = 15;

  precision = 5;

  /******/
  markerhere = null;

  markerType = null
  markerStart = null
  markerStop = null
  markerStartPlaced = false
  markerStopPlaced = false

  placedStartColor = "null"
  placedStopColor = "null"

  displayTime = "00:00:000"

  startedTime = null
  playStopTimer = "play"
  modalClosed = true
  /******/




  started = null;
  arrived = null;

  startCoords;
  stopCoords;

  isTimerStarted = false;
  shouldTimerRun = false;
  sec = 0;

  subscription;

  constructor(private geolocation: Geolocation, private locationAccuracy: LocationAccuracy,
    public modalController: ModalController) {
    this.getCurrentPos()
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalComponent,


    });
    return await modal.present();
  }

  onMapClick(e) {

    var markPoint;

    if (this.markerType != null) {
      if (this.markerType == startType) {

        if (this.markerStart != null) {
          return console.log("start gia presente")
        }
        markPoint = Leaflet.marker([e.latlng.lat, e.latlng.lng], { icon: startIcon });
        markPoint.bindPopup('<h1>Partenza</h1>');
        this.markerStart = markPoint
        this.startCoords = { lat: parseFloat(this.markerStart._latlng.lat.toFixed(this.precision)), lon: parseFloat(this.markerStart._latlng.lng.toFixed(this.precision)) }
        this.map.addLayer(markPoint);
        this.markerStartPlaced = true;
        this.placedStartColor = "danger"

      } else if (this.markerType = arriveType) {

        if (this.markerStop != null) {
          return console.log("stop gia presente")
        }
        markPoint = Leaflet.marker([e.latlng.lat, e.latlng.lng], { icon: arriveIcon });
        markPoint.bindPopup('<h1>Arrivo</h1>');
        this.markerStop = markPoint
        this.stopCoords = { lat: parseFloat(this.markerStop._latlng.lat.toFixed(this.precision)), lon: parseFloat(this.markerStop._latlng.lng.toFixed(this.precision)) }
        this.map.addLayer(markPoint);
        this.markerStopPlaced = true;
        this.placedStopColor = "danger"
      }
    } else {
      console.log("marker tupo e null")
    }
  }

  removeStartAndArrive() {

    this.stopCount();

    try {
      this.map.removeLayer(this.markerStart);
      this.map.removeLayer(this.markerStop);
    } catch { }

    this.placedStopColor = "null"
    this.placedStartColor = "null"

    this.markerStart = null
    this.markerStartPlaced = false

    this.markerStop = null
    this.markerStopPlaced = false

    this.markerType = null;

  }
  addStartMarker() {

    if(this.markerType == arriveType && this.markerStop == null){
      this.placedStopColor = "null"
    }

    this.markerType = startType;
    this.placedStartColor = "success"


    try {
      this.map.removeLayer(this.markerStart);
      this.markerStart = null
      this.markerStartPlaced = false
      this.placedStartColor = "null"
      this.markerType = null

    } catch { }
  }

  addArriveMarker() {

    if(this.markerType == startType && this.markerStart == null){
      this.placedStartColor = "null"
    }
    this.markerType = arriveType;
    this.placedStopColor = "success"


    try {
      this.map.removeLayer(this.markerStop);
      this.markerStop = null
      this.markerStopPlaced = false
      this.placedStopColor = "null"
      this.markerType = null
    } catch { }
  }

  changeGpsPrecision(e) {
    this.precision = e
  }

  refreshCurrentPosition() {

    this.shouldTimerRun = false;
    this.isTimerStarted = false;
    this.map.removeLayer(this.markerhere);
    this.geolocation.getCurrentPosition(GeolocationOption).then((resp) => {

      console.log(resp.coords)
      this.mapCenter.lat = resp.coords.latitude;
      this.mapCenter.lng = resp.coords.longitude;

      this.map.setView([this.mapCenter.lat, this.mapCenter.lng], this.zoom);

      // Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      //   attribution: 'edupala.com © Angular LeafLet',
      // }).addTo(this.map);

      // const markPoint = Leaflet.marker([this.mapCenter.lat, this.mapCenter.lng], { icon: hereIcon });
      const markPoint = Leaflet.marker([this.mapCenter.lat, this.mapCenter.lng]);
      // const markPoint = Leaflet.marker([this.mapCenter.lat, this.mapCenter.lng]);
      markPoint.bindPopup('<p>Sei qui</p>');
      this.markerhere = markPoint;
      this.map.addLayer(markPoint);

    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }
  getCurrentPos() {

    this.geolocation.getCurrentPosition({ enableHighAccuracy: true }).then((resp) => {

      console.log(resp.coords)
      this.mapCenter.lat = resp.coords.latitude;
      this.mapCenter.lng = resp.coords.longitude;

      this.map = Leaflet.map('mapId').setView([this.mapCenter.lat, this.mapCenter.lng], this.zoom);

      this.map.on('dblclick', (e) => {
        // this.setStart(e)
      });


      this.map.on('click', (e) => {
        this.onMapClick(e)
      });

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'edupala.com © Angular LeafLet',
      }).addTo(this.map);

      // const markPoint = Leaflet.marker([this.mapCenter.lat, this.mapCenter.lng], { icon: hereIcon });
      const markPoint = Leaflet.marker([this.mapCenter.lat, this.mapCenter.lng]);
      // const markPoint = Leaflet.marker([this.mapCenter.lat, this.mapCenter.lng]);
      markPoint.bindPopup('<p>Sei qui</p>');
      this.markerhere = markPoint;
      this.map.addLayer(markPoint);

    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }
  locationAcc() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {

      if (canRequest) {
        // the accuracy option will be ignored by iOS
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
          () => this.getCurrentPos(),
          error => console.log('Error requesting location permissions', error)
        );
      }

    });
  }

  stopCount() {
    this.shouldTimerRun = false;
    this.displayTime = "00:00:000"
   // this.subscription.unsubscribe();
    this.playStopTimer = "play"
  }
  startCount() {

    if (this.playStopTimer == "stop") {
      return this.stopCount();
    }

    this.started = null;
    this.started = this.geolocation.watchPosition();
    this.subscription = this.started.subscribe((data) => {
      var myCoords =
      {
        lat: parseFloat(data.coords.latitude.toFixed(this.precision)),
        lon: parseFloat(data.coords.longitude.toFixed(this.precision))
      }


      // console.log("myCoords")
      // console.log(myCoords)
      // console.log("startCoords")
      // console.log(this.startCoords)

      // var myCoords = {lat:1 , lon:1}
      // var startCoords ={lat:1 , lon:1}

      if (JSON.stringify(myCoords) == JSON.stringify(this.startCoords)) {

        if (this.markerStop != null) {
          this.shouldTimerRun = true
        }

        if (this.isTimerStarted == false) {
          this.startTim();
        }

      }


      if (JSON.stringify(myCoords) == JSON.stringify(this.stopCoords)) {

        //this.stopCount();
        this.shouldTimerRun = false;

        // this.subscription.unsubscribe()
      }

    })
  }

  timeToString(time) {
    let diffInHrs = time / 3600000;
    let hh = Math.floor(diffInHrs);

    let diffInMin = (diffInHrs - hh) * 60;
    let mm = Math.floor(diffInMin);

    let diffInSec = (diffInMin - mm) * 60;
    let ss = Math.floor(diffInSec);

    let diffInMs = (diffInSec - ss) * 1000;
    let ms = Math.floor(diffInMs);

    let formattedMM = mm.toString().padStart(2, "0");
    let formattedSS = ss.toString().padStart(2, "0");
    let formattedMS = ms.toString().padStart(3, "0");

    return formattedMM + ':' + formattedSS + ':' + formattedMS;

  }
  // getSecondsAsDigitalClock(inputSeconds: number) {
  //   var sec_num = parseInt(inputSeconds.toString(), 10); // don't forget the second param
  //   var hours = Math.floor(sec_num / 3600);
  //   var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  //   var seconds = sec_num - (hours * 3600) - (minutes * 60);
  //   var hoursString = '';
  //   var minutesString = '';
  //   var secondsString = '';
  //   hoursString = (hours < 10) ? "0" + hours : hours.toString();
  //   minutesString = (minutes < 10) ? "0" + minutes : minutes.toString();
  //   secondsString = (seconds < 10) ? "0" + seconds : seconds.toString();
  //   return hoursString + ':' + minutesString + ':' + secondsString;
  // }

  startTim() {
    this.isTimerStarted = true
    this.playStopTimer = "stop"
    this.startedTime = Date.now();
    this.startTimer();
  }

  startTimer() {

    setTimeout(() => {

      if (this.shouldTimerRun == true) {

        this.sec = Date.now() - this.startedTime
        this.displayTime = this.timeToString(this.sec)
        this.startTimer();
      } else {

       // this.shouldTimerRun = true
        this.isTimerStarted = false
         this.playStopTimer = "play"
      }

    }, 1);
  }


  ionViewDidEnter() {
    this.startCount();
  }

}

