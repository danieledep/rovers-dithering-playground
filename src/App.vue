<template lang="html">
  <div id="container">

    <nasa-picture id="picture" ref="picture"
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
import nasaApiKey from './NasaApiKey'
import wayPoints from './waypoints'
import Tweakpane from 'tweakpane'
import domtoimage from 'dom-to-image';

const PARAMS = {
  latitude: 'string',
  longitude: 'string',
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
      picMissionSol: "",
      picCamera: "",
      picCoordinates: "",
      pictureMarginTop: 0,
      pictureMarginBottom: -1,
      imageEffect: "Dithering",
      ditherThreshold: 150,
      cardNode: "",
      panel: "",
      panelElement: "",
      fold1: "",
      fold2: "",
      fold3: "",
      fold4: ""
    };
  },

  components: {
    NasaPicture
  },

  methods: {


    initPanelVars() {

    this.maxHeight = this.originalHeight;


    PARAMS.effect = this.imageEffect;
    PARAMS.rover = this.rover;
    PARAMS.setSol = this.picMissionSol;
    PARAMS.setPicID = this.picId;
    PARAMS.heightPic = this.maxHeight;
    PARAMS.ditThreshold = this.ditherThreshold;

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
          Perseverance: 'Perseverance',
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
        // this.downloadPic();
        this.downloadCard();
      });


    },


    togglePanel() {
      if (this.panelElement.classList.contains("hidden")) this.panelElement.classList.remove("hidden")
      else this.panelElement.classList.add("hidden")
    },


    downloadCard() {

      let vt = this;
      domtoimage.toJpeg(document.getElementById('container'), { quality: 0.99 })
        .then(function (dataUrl) {
            var link = document.createElement('a');
            link.download = vt.rover + '-' + vt.picMissionSol + '-' + vt.picId + '.jpeg';
            link.href = dataUrl;
            link.click();
        });

    },


    toggleInfo() {

      // toggle information paragraph and title
      if (document.getElementById("info").classList.contains("hidden")) document.getElementById("info").classList.remove("hidden")
      else document.getElementById("info").classList.add("hidden")

      if (document.getElementById("info-title").classList.contains("hidden")) document.getElementById("info-title").classList.remove("hidden")
      else document.getElementById("info-title").classList.add("hidden")

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
      const regexRovers = /SETROVER|curiosity|spirit|opportunity|perseverance/gi;

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
      const regexRovers = /SETROVER|curiosity|spirit|opportunity|perseverance/gi;
      this.manifestUrl = this.manifestUrl.replace(regexRovers, this.rover.toLowerCase())

      // set camera if  rover is Perseverance
      if (this.rover == "Perseverance") this.cam = "NAVCAM_RIGHT";
      else this.cam = "NAVCAM";
      
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
      const regexRovers = /SETROVER|curiosity|spirit|opportunity|perseverance/gi;
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
    this.initPanelVars()

    this.initPanelPicture()

    this.getRandomPic()
    
  }

}
</script>
