<template lang="html">
  <div id="container">

    <nasa-picture id="picture" ref="picture"
      :downloadPic= "dwnlPic"
      :picId = "picId"
      :didaCamera = "cam"
      :didaRover = "rover"
      :didaCoord = "picCoordinates"
      :didaMissionSol = "picMissionSol"
      :didaMissionDuration = "missionDuration"
      :imageLink = "pictureUrl"
      :setEffect = "imageEffect"
      :threshold = "ditherThreshold">
    </nasa-picture>


    <vue-global-events
      @keyup.tab="getRandomPic"   
      @keyup.up="togglePanel"
      @keyup.down="printPage">
    </vue-global-events>


    </div>


</template>

<script>

import NasaPicture from './components/NasaPicture.vue'
import VueGlobalEvents from "vue-global-events"
import * as MarsDate from "marsdate"
import SolarSystem from 'solaris-model'
import nasaApiKey from './NasaApiKey'
import wayPoints from './waypoints'
import coordinates from './coordinates'
import Tweakpane from 'tweakpane'
import { log } from 'three'

const PARAMS = {
  baseName: 'string',
  latitude: 'string',
  longitude: 'string',
  marsArrival:'string',
  year0: 0,
  gotodate: 'string',
  effect : 'string',
  rover: 'string',
  setSol: 'string',
  setPicID: 'string',
  heightPic: 'string',
  ditThreshold: 'string',
};


export default {
  data() {
    return {
      apiKey: "",
      urlCover: "https://danieledep.github.io/whole-mars-calendar/cover.png",
      manifestUrl: "https://api.nasa.gov/mars-photos/api/v1/manifests/SETROVER?api_key=SETAPIKEY",
      picturesApiUrl: "https://api.nasa.gov/mars-photos/api/v1/rovers/SETROVER/photos?sol=SETSOL&camera=SETCAM&api_key=SETAPIKEY",
      pictureUrl: "",
      dwnlPic: 0,
      originalHeight: 700,
      maxHeight: 0,
      picId: "",
      rover: "Curiosity",
      cam: "NAVCAM",
      missionDuration: 0,
      missionSolTotPics: 0,
      randomPicture: 0,
      picMarsDate: "",
      picMissionSol: "",
      picCamera: "",
      picCoordinates: "",
      pictureMarginTop: 0,
      pictureMarginBottom: -1,
      imageEffect: "Dithering",
      ditherThreshold: 150,
      displayDate: "",
      beginDisplay: "",
      dateBegin: "",
      dateEnd: "",
      endDisplay: "",
      sSystem: "",
      panel: "",
      panelElement: "",
      fold1: "",
      fold2: "",
      fold3: "",
      fold4: "",
      firstBase: "Arcadia Base",
      baseLong: -150,
      baseLat: 65,
      marsArrival: "2040-04-12",
      yearZero: 1953,
      yearZeroMars: 0
    };
  },

  components: {
    NasaPicture
  },

  methods: {
    prevMonth() {

      // PICTURE CTRLS
      //this.getRandomPic()

      // HEADER CTRLS
      this.displayDate.m--;
      if (this.displayDate.m == -1) {
        this.displayDate.m = 23;
        this.displayDate.y--;
      }
      // Tweak to redeclare displayDate
      // in order to trigger the watch in the child component
      var convertDate = new MarsDate(this.displayDate.y, this.displayDate.m, this.displayDate.d);
      this.displayDate = convertDate.json;

      // CALENDAR CTRLS
      this.updateDisplay()

    },

    nextMonth() {

      // PICTURE CTRLS
      //this.getRandomPic();

      // HEADER CTRLS
      this.displayDate.m++;
      if (this.displayDate.m == 24) {
        this.displayDate.m = 0;
        this.displayDate.y++;
      }
      // Tweak to redeclare displayDate
      // in order to trigger the watch in the child component
      var convertDate = new MarsDate(this.displayDate.y, this.displayDate.m, this.displayDate.d);
      this.displayDate = convertDate.json;

      // CALENDAR CTRLS
      this.updateDisplay()
    },

    printPage() {
      this.togglePanel()
      window.print();
      this.togglePanel()
    },

    solsInMonth(date) {
      if (date.m == 5 || date.m == 11 || date.m == 17) return 27
      //leap days formula: (Y-1)\2 + Y\10 - Y\100 + Y\500
      if (date.y % 2 == 0 && (date.y % 10 != 0 || (date.y % 100 == 0 && date.y % 500 != 0)) && date.m == 23) return 27
      else return 28
    },

    updateDisplay() {

      // Update the date of begin and end of calendar 
      // MarsDate is 0-based counter for months
      this.beginDisplay = new MarsDate(this.displayDate.y, this.displayDate.m, 1, 0, 0, 0 )
      this.endDisplay = new MarsDate(this.displayDate.y, this.displayDate.m, this.solsInMonth(this.displayDate), 23, 59, 59 )

      // Get the date of begin and end of calendar in Earth date 
      // formatted YYYY-MM-DD to use for calculations
      this.dateBegin = this.getDateFormatted(this.beginDisplay)
      this.dateEnd = this.getDateFormatted(this.endDisplay)

    },

    initPanelVars() {

    this.baseLong = coordinates[0].baseLongitude
    this.baseLat = coordinates[0].baseLatitude
    this.maxHeight = this.originalHeight;


    // initialize martian year0 if different than Darian 1609
    var initDate = this.yearZero + "-01-01";
    var convertDate = new MarsDate(new Date(initDate));
    this.yearZeroMars = convertDate.json.y;

    PARAMS.marsArrival = this.marsArrival;
    PARAMS.gotodate = this.dateBegin;
    PARAMS.year0 = this.yearZero;
    PARAMS.baseName = this.firstBase;
    PARAMS.longitude = this.baseLong
    PARAMS.latitude = this.baseLat
    PARAMS.effect = this.imageEffect;
    PARAMS.rover = this.rover;
    PARAMS.setSol = this.picMissionSol;
    PARAMS.setPicID = this.picId;
    PARAMS.heightPic = this.maxHeight;
    PARAMS.ditThreshold = this.ditherThreshold;

    },

    initPanelDev () {

     // CONTROL PANEL
    this.panel = new Tweakpane();
    this.panelElement = document.getElementsByClassName("tp-dfwv")[0];
    
    this.fold1 = this.panel.addFolder({
      title: 'time',
    });

    this.fold2 = this.panel.addFolder({
      title: 'picture',
    });
    
    this.fold3 = this.panel.addFolder({
      title: 'colony',
    });

    this.fold4 = this.panel.addFolder({
      title: 'controls',
    });

    this.fold1.addInput(PARAMS, 'year0', {
      label: "Year 0"
    })
    .on('change', (year0) => {

      var splitDate = year0 + "-01-01";

      if (year0 >= 1609)  {
            var convertDate = new MarsDate(new Date(splitDate));
            this.yearZero = year0;
            this.yearZeroMars = convertDate.json.y;
          }
       else {
         console.log("invalid date")
         window.alert("Insert valid date")
         PARAMS.year0 = this.yearZero;
       }
      });

    this.fold1.addInput(PARAMS, 'marsArrival', {
      label: "Arrival date"
    })
      .on('change', (marsArrival) => {

        var newDate =new Date (marsArrival),
          splitDate = marsArrival.split('-');

          // if it is a date
      if ((Object.prototype.toString.call(newDate) === "[object Date]") &&
          // if it is a valid date 
         (!isNaN(newDate.getTime())) &&
         // set year limits
         (splitDate[0] > 2020 && splitDate[0] <2100) )  {

            var convertDate = new MarsDate(new Date(marsArrival));
            this.marsArrival = convertDate.json;
          }
       else {
         console.log("invalid date")
         window.alert("Insert valid date")
         PARAMS.marsArrival = this.marsArrival;
       }
      });

    this.fold1.addInput(PARAMS, 'gotodate', {
      label: "Go to date"
    })
      .on('change', (gotodate) => {

      var newDate =new Date (gotodate),
          splitDate = gotodate.split('-');

          // if it is a date
      if ((Object.prototype.toString.call(newDate) === "[object Date]") &&
          // if it is a valid date 
         (!isNaN(newDate.getTime())) &&
         // set year limits
         (splitDate[0] > 2000 && splitDate[0] <2100) )  {

            var convertDate = new MarsDate(new Date(gotodate));
            this.displayDate = convertDate.json;
              
            this.updateDisplay()
          }

       else {
         console.log("invalid date")
         window.alert("Insert valid date")
         PARAMS.gotodate = this.dateBegin;
       }
      });

    const btnPrev = this.fold1.addButton({
        title: '◄ Previous Month',
      });
      btnPrev.on('click', () => {
        this.prevMonth()
      });

    const btnNext = this.fold1.addButton({
        title: '► Next Month ',
      });
      btnNext.on('click', () => {
        this.nextMonth()
      });

      this.fold2.addInput(PARAMS, 'effect', {
        label: "Effect",
        options: {
          None: 'None',
          Dithering: 'Dithering',
        },
      }).on('change', (effect) => {

        this.imageEffect = effect

      });


      this.fold2.addInput(PARAMS, 'rover', {
        label: "Rover",
        options: {
          Curiosity: 'Curiosity',
          Spirit: 'Spirit',
          Opportunity: 'Opportunity',
        },
      }).on('change', (rover) => {

        this.rover = rover
        this.getRandomPic()

      });

      this.fold2.addInput(PARAMS, 'setSol', {
        label: "Mission sol"
      })
      .on('change', (setSol) => {

        if ((setSol > 0) && (setSol < this.missionDuration)) {
          this.picMissionSol = setSol;
          this.getRequestedPic()
          } else {
        console.log("Sol must be between 0 and ", this.missionDuration)
         window.alert("Sol must be between 0 and " + this.missionDuration)
        }
      });

      this.fold2.addInput(PARAMS, 'setPicID', {
        label: "Picture ID"
      })
      .on('change', (setPicID) => {

        if (setPicID > 0) {
          this.picId = setPicID;
          this.getRequestedPic()
          } else {
        console.log("ID must be bigger than zero")
         window.alert("ID must be bigger than zero")
        }
      });

      this.fold2.addInput(PARAMS, 'ditThreshold', {
        label: "Threshold",
        step: 1,
        min: 0,
        max: 255,
      }).on('change', (ditThreshold) => {

        this.ditherThreshold = ditThreshold;

      });


      this.fold2.addInput(PARAMS, 'heightPic', {
        label: "Height"
      })
      .on('change', (heightPic) => {

        if (heightPic>0 && heightPic<2000) {

          this.maxHeight = heightPic
          this.$refs.picture.$el.setAttribute("style","height:" +this.maxHeight+ "px; margin-bottom:" +this.pictureMarginBottom+ "px; margin-top:" +this.pictureMarginTop+ "px;"); 

          }  else {
        console.log("Out of bounds value")
         window.alert("Out of bounds value")
        }
      });

    const covPic = this.fold2.addButton({
        title: '■ Show cover picture',
      });
      covPic.on('click', () => {
        this.getCoverPic();
      });

    const btnPic = this.fold2.addButton({
        title: '⟳ Random picture',
      });
      btnPic.on('click', () => {
        this.getRandomPic();
      });

    const dwnPic = this.fold2.addButton({
        title: '↓ Save picture',
      });
      dwnPic.on('click', () => {
        this.downloadPic();
      });

    
    this.fold3.addInput(PARAMS, 'baseName', {
      label: "Base name"
    })
      .on('change', (baseName) => {
        this.firstBase = baseName;
      });

      this.fold3.addInput(PARAMS, 'longitude', {
        label: "Set longitude"
      })
      .on('change', (longitude) => {

        if (longitude >= -180 && longitude <= 180) {
          this.baseLong = longitude;
        }
        else {
          window.alert ("Insert value between -180 and 180")
          PARAMS.longitude = this.baseLong
        }
        
      });

    this.fold3.addInput(PARAMS, 'latitude', {
      label: "Set latitude"
    })
      .on('change', (latitude) => {

        if (latitude >=  -90 && latitude <= 90) {
          this.baseLat = latitude;
        }
        else {
          window.alert ("Insert value between -90 and 90")
          PARAMS.latitude = this.baseLat
        }
      });

    const sqrPic = this.fold4.addButton({
        title: '□ Print Layout',
      });
      sqrPic.on('click', () => {
        this.togglePrintLayout();
      });

    const hideInfo = this.fold4.addButton({
        title: '✕ Hide info',
      });
      hideInfo.on('click', () => {
        this.toggleInfo();
      });

    const btnPrint = this.fold4.addButton({
        title: ' ↓ Save page ',
      });
      btnPrint.on('click', () => {
        this.printPage()
      });

    const btnToggle = this.fold4.addButton({
        title: '✕ Hide panel ',
      });
      btnToggle.on('click', () => {
        this.togglePanel()
      });

    // ADD CALENDAR ICONS
    // PRINTER COUNT
    },

    initPanelPicture () {

     // CONTROL PANEL
    this.panel = new Tweakpane();
    this.panelElement = document.getElementsByClassName("tp-dfwv")[0];
    

    this.fold2 = this.panel.addFolder({
      title: 'picture',
    });


      this.fold2.addInput(PARAMS, 'effect', {
        label: "Effect",
        options: {
          None: 'None',
          Dithering: 'Dithering',
        },
      }).on('change', (effect) => {

        this.imageEffect = effect

      });


      this.fold2.addInput(PARAMS, 'rover', {
        label: "Rover",
        options: {
          Curiosity: 'Curiosity',
          Spirit: 'Spirit',
          Opportunity: 'Opportunity',
        },
      }).on('change', (rover) => {

        this.rover = rover
        this.getRandomPic()

      });

      this.fold2.addInput(PARAMS, 'setSol', {
        label: "Mission sol"
      })
      .on('change', (setSol) => {

        if ((setSol > 0) && (setSol < this.missionDuration)) {
          this.picMissionSol = setSol;
          this.getRequestedPic()
          } else {
        console.log("Sol must be between 0 and ", this.missionDuration)
         window.alert("Sol must be between 0 and " + this.missionDuration)
        }
      });

      this.fold2.addInput(PARAMS, 'setPicID', {
        label: "Picture ID"
      })
      .on('change', (setPicID) => {

        if (setPicID > 0) {
          this.picId = setPicID;
          this.getRequestedPic()
          } else {
        console.log("ID must be bigger than zero")
         window.alert("ID must be bigger than zero")
        }
      });

      this.fold2.addInput(PARAMS, 'ditThreshold', {
        label: "Threshold",
        step: 1,
        min: 0,
        max: 255,
      }).on('change', (ditThreshold) => {

        this.ditherThreshold = ditThreshold;

      });



    const btnPic = this.fold2.addButton({
        title: '⟳ Random picture',
      });
      btnPic.on('click', () => {
        this.getRandomPic();
      });

    const dwnPic = this.fold2.addButton({
        title: '↓ Save picture',
      });
      dwnPic.on('click', () => {
        this.downloadPic();
      });


    },

    initPanelDist () {

     // CONTROL PANEL
    this.panel = new Tweakpane();
    this.panelElement = document.getElementsByClassName("tp-dfwv")[0];
    

    this.fold2 = this.panel.addFolder({
      title: 'picture',
    });
    
    this.fold3 = this.panel.addFolder({
      title: 'colony',
    });

    this.fold4 = this.panel.addFolder({
      title: 'controls',
    });

    const btnPic = this.fold2.addButton({
        title: '⟳ Random picture',
      });
      btnPic.on('click', () => {
        this.getRandomPic();
      });

    const dwnPic = this.fold2.addButton({
        title: '↓ Save picture',
      });
      dwnPic.on('click', () => {
        this.downloadPic();
      });

      this.fold3.addInput(PARAMS, 'baseName', {
        label: "Base name"
      })
      .on('change', (baseName) => {
        this.firstBase = baseName;
      });


    this.fold3.addInput(PARAMS, 'longitude', {
      label: "Set longitude"
    })
      .on('change', (longitude) => {

        if (longitude >= -180 && longitude <= 180) {
          this.baseLong = longitude;
        }
        else {
          window.alert ("Insert value between -180 and 180")
          PARAMS.longitude = this.baseLong
        }
        
      });

    this.fold3.addInput(PARAMS, 'latitude', {
      label: "Set latitude"
    })
      .on('change', (latitude) => {

        if (latitude >=  -90 && latitude <= 90) {
          this.baseLat = latitude;
        }
        else {
          window.alert ("Insert value between -90 and 90")
          PARAMS.latitude = this.baseLat
        }
      });


    const btnToggle = this.fold4.addButton({
        title: '✕ Hide panel ',
      });
      btnToggle.on('click', () => {
        this.togglePanel()
      });

    },

    togglePanel() {
      if (this.panelElement.classList.contains("hidden")) this.panelElement.classList.remove("hidden")
      else this.panelElement.classList.add("hidden")
    },

    downloadPic () {
      this.dwnlPic++
    },

    getCoverPic() {
      document.getElementById("picture").classList.add("wholeBlack")
      this.picMissionSol = 0
      this.picId = 0
      this.pictureUrl = this.urlCover
    },

    togglePrintLayout() {

      // setTimeout because at mounting components don't have correct height
      setTimeout(() => {
        
        var newHeight = this.$refs.header.$el.clientHeight + this.$refs.calendar.$el.clientHeight + this.$refs.orbit.$el.clientHeight

        if (this.maxHeight == newHeight) {
          this.pictureMarginTop = 0
          this.pictureMarginBottom = -1
          this.maxHeight = this.originalHeight
          PARAMS.heightPic = this.maxHeight;
          this.panel.refresh()
          this.$refs.picture.$el.setAttribute("style","height:" +this.maxHeight+ "px; margin-bottom:" +this.pictureMarginBottom+ "px; margin-top:" +this.pictureMarginTop+ "px;"); 

        } else {

        this.pictureMarginTop = 100
        this.pictureMarginBottom = 350
        this.maxHeight = newHeight;
        PARAMS.heightPic = this.maxHeight;
        this.panel.refresh()
        this.$refs.picture.$el.setAttribute("style","height:" +this.maxHeight+ "px; margin-bottom:" +this.pictureMarginBottom+ "px; margin-top:" +this.pictureMarginTop+ "px;"); 
        }
      } , 1000);

    },

    toggleInfo() {

      // toggle information paragraph and title
      if (document.getElementById("info").classList.contains("hidden")) document.getElementById("info").classList.remove("hidden")
      else document.getElementById("info").classList.add("hidden")

      if (document.getElementById("info-title").classList.contains("hidden")) document.getElementById("info-title").classList.remove("hidden")
      else document.getElementById("info-title").classList.add("hidden")

    },

    getDateFormatted (myDate) {

      var myYear, myMonth, myDay;

      // get begin of orbit and end of orbit, with leading zeroes
      myYear = myDate.earthDate.getFullYear()
      myMonth = (myDate.earthDate.getMonth() + 1) < 10 ? ("0" + (myDate.earthDate.getMonth() + 1)) : (myDate.earthDate.getMonth() + 1)
      myDay =   myDate.earthDate.getDate() < 10 ? ("0" + myDate.earthDate.getDate()) : myDate.earthDate.getDate()
  
      return (myYear + "-" + myMonth + "-" + myDay);

    },

    callApiUrl(url) {
      // Return a new promise.
      return new Promise(function(resolve, reject) {
        // Do the usual XHR stuff
        var req = new XMLHttpRequest();
        req.open('GET', url);
        req.onload = function() {
          // This is called even on 404 etc
          // so check the status
          if (req.status == 200) {

            // Resolve the promise with the response text
            resolve(req.response);
          }
          else {
            // Otherwise reject with the status text
            // which will hopefully be a meaningful error
            reject(Error(req.statusText));
          }
        },
        // Handle network errors
        req.onerror = function() {
          reject(Error("Network Error"));
        };
        // Make the request
        req.send();
      });
    },

    setApiKey() {

        this.apiKey = nasaApiKey[0].key
        const regexKey = /SETAPIKEY/gi;

        this.manifestUrl = this.manifestUrl.replace(regexKey, this.apiKey)
        this.picturesApiUrl = this.picturesApiUrl.replace(regexKey, this.apiKey)

    
    },

    getManifest() {

      // set rover for API call
      const regexRovers = /SETROVER|curiosity|spirit|opportunity/gi;

      this.manifestUrl = this.manifestUrl.replace(regexRovers, this.rover.toLowerCase())
      
      var vm = this;

      vm.callApiUrl(vm.manifestUrl).then(JSON.parse).then(function(response) {
      
        vm.missionDuration = response.photo_manifest.max_sol;
        vm.missionSolTotPics = response.photo_manifest.photos[(response.photo_manifest.photos.length)-1].total_photos
        
      })
    },

    getRandomPic() {

      // remove black background from cover picture
      if (document.getElementById("picture").classList.contains("wholeBlack")) document.getElementById("picture").classList.remove("wholeBlack")

      // set rover and camera for manifest api call
      const regexRovers = /SETROVER|curiosity|spirit|opportunity/gi;
      this.manifestUrl = this.manifestUrl.replace(regexRovers, this.rover.toLowerCase())
      
      var vm = this;

      vm.callApiUrl(vm.manifestUrl).then(JSON.parse).then(function(response) {
      
        vm.missionDuration = response.photo_manifest.max_sol;
        vm.picMissionSol = vm.random(vm.missionDuration)


      // replace rover value
      var replace =  vm.picturesApiUrl.match(/.rovers\/([^&]+)(\/|$)/)
      if (replace) vm.picturesApiUrl = vm.picturesApiUrl.replace(replace[1], vm.rover.toLowerCase())

      // replace sol value
      var replace =  vm.picturesApiUrl.match(/.sol=([^&]+)(&|$)/)
      if (replace) vm.picturesApiUrl = vm.picturesApiUrl.replace(replace[1], vm.picMissionSol)

      // replace camera value
      var replace =  vm.picturesApiUrl.match(/.camera=([^&]+)(&|$)/)
      if (replace) vm.picturesApiUrl = vm.picturesApiUrl.replace(replace[1], vm.cam.toLowerCase())


        // Queuing asynchronous actions
        return vm.callApiUrl(vm.picturesApiUrl)
        
      }).then(JSON.parse).then(function(response){

        vm.randomPicture = vm.random(response.photos.length)

        if (response.photos[vm.randomPicture]) {


            // fix response url for cors problems
            response.photos[vm.randomPicture].img_src = vm.corsFix(response.photos[vm.randomPicture].img_src)

            // update dida
            var convertDate = new MarsDate(new Date(response.photos[vm.randomPicture].earth_date));
            vm.picMarsDate = convertDate.json
            vm.picMissionSol = response.photos[vm.randomPicture].sol
            vm.picCamera = response.photos[vm.randomPicture].camera.name
            vm.picId = response.photos[vm.randomPicture].id

            //update panel
            PARAMS.setSol = vm.picMissionSol;
            PARAMS.setPicID = vm.picId;
            vm.panel.refresh()

            // find coordinates going through waypoints geojson file
            var distance = 100
            for (let point of wayPoints[0].features) {
              if (point.properties.sol > vm.picMissionSol) break;
              if ( Math.abs(vm.picMissionSol - point.properties.sol) < distance ) {
                distance = Math.abs(vm.picMissionSol - point.properties.sol)
                vm.picCoordinates = point.geometry.coordinates
                if (point.properties.sol == vm.picMissionSol) break;
              }
            }

            vm.pictureUrl = response.photos[vm.randomPicture].img_src     


          } else {
            console.log("no pictures available for this sol")
            vm.getRandomPic()
          }


      }).catch(function(error) {
        console.log("Failed api call!", error);
      })


    },

    getRequestedPic() {

      // remove black background from cover picture
      if (document.getElementById("picture").classList.contains("wholeBlack")) document.getElementById("picture").classList.remove("wholeBlack")


      // set rover and camera for manifest api call
      const regexRovers = /SETROVER|curiosity|spirit|opportunity/gi;
      this.manifestUrl = this.manifestUrl.replace(regexRovers, this.rover.toLowerCase())
      
      var vm = this;

      var foundPic = false

      vm.callApiUrl(vm.manifestUrl).then(JSON.parse).then(function(response) {
      
        vm.missionDuration = response.photo_manifest.max_sol;

       if (vm.picMissionSol > 0 && vm.picMissionSol < vm.missionDuration) {

        // replace rover value
      var replace =  vm.picturesApiUrl.match(/.rovers\/([^&]+)(\/|$)/)
      if (replace) vm.picturesApiUrl = vm.picturesApiUrl.replace(replace[1], vm.rover.toLowerCase())

      // replace sol value
      var replace =  vm.picturesApiUrl.match(/.sol=([^&]+)(&|$)/)
      if (replace) vm.picturesApiUrl = vm.picturesApiUrl.replace(replace[1], vm.picMissionSol)

      // replace camera value
      var replace =  vm.picturesApiUrl.match(/.camera=([^&]+)(&|$)/)
      if (replace) vm.picturesApiUrl = vm.picturesApiUrl.replace(replace[1], vm.cam.toLowerCase())

        // Queuing asynchronous actions
        return vm.callApiUrl(vm.picturesApiUrl)

      } else {
        window.alert("Invalid sol date!")
        console.log("Invalid sol date! pick a sol between 0 and ", vm.missionDuration)
        }
      }).then(JSON.parse).then(function(response){

        for(let i = 0; i<response.photos.length; i++) {

          if (response.photos[i].id == vm.picId) {

            foundPic = true;

           // fix response url for cors problems
            response.photos[i].img_src = vm.corsFix(response.photos[i].img_src)

            // update dida
            var convertDate = new MarsDate(new Date(response.photos[i].earth_date));
            vm.picMarsDate = convertDate.json
            vm.picMissionSol = response.photos[i].sol
            vm.picCamera = response.photos[i].camera.name
            vm.picId = response.photos[i].id

            //update panel
            PARAMS.setSol = vm.picMissionSol;
            PARAMS.setPicID = vm.picId;
            vm.panel.refresh()

            // find coordinates going through waypoints geojson file
            var distance = 100
            for (let point of wayPoints[0].features) {
              if (point.properties.sol > vm.picMissionSol) break;
              if ( Math.abs(vm.picMissionSol - point.properties.sol) < distance ) {
                distance = Math.abs(vm.picMissionSol - point.properties.sol)
                vm.picCoordinates = point.geometry.coordinates
                if (point.properties.sol == vm.picMissionSol) break;
              }
            }

             vm.pictureUrl = response.photos[i].img_src

          }
        }
        if (!foundPic) {
          window.alert("Id photo not found!")
          console.log("Id photo not found!")
          }
      }).catch(function(error) {
        console.log("Failed api call!", error);
      })
    
    },

    random(max) {
     return Math.floor(Math.random() * Math.floor(max));
    },

    corsFix(fixedUrl) {

      if ((fixedUrl.substring(0, 4) === "http") && (fixedUrl.substring(4, 5) != "s")) {
          fixedUrl = fixedUrl.slice(0, 4) + "s" + fixedUrl.slice(4);
      }
      if (fixedUrl.includes(".jpl")) {
          fixedUrl = fixedUrl.replace(".jpl", "");
      }

      return fixedUrl
    },

  },

  mounted() {

    this.setApiKey()

    var convertDate = new MarsDate();
    this.displayDate = convertDate.json;
    this.sSystem = new SolarSystem;
    

    this.updateDisplay()
    this.initPanelVars()

    //  this.initPanelDev()
    this.initPanelPicture()
    //this.initPanelDist()

    this.getRandomPic()

    
  }

}
</script>
