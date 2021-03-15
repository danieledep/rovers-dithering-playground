<template>
<div  class="border-full">

  <canvas id="canvasPic" class="border-full"></canvas>
  <div class="canvasCapt">
    <p class="float-left">{{didaRover}} Rover {{didaCamera}}</p>
    
    <div class="float-right">


     <div class="float-right" v-if="didaMissionSol<10">
       <p>Mission Sol #000{{didaMissionSol}}/{{didaMissionDuration}}</p>
      </div>

      <div class="float-right" v-if="(didaMissionSol<100) && (didaMissionSol>=10)">
        <p>Mission Sol #00{{didaMissionSol}}/{{didaMissionDuration}}</p>
      </div>

       <div class="float-right" v-if="(didaMissionSol<1000) && (didaMissionSol>=100)">
        <p>Mission Sol #0{{didaMissionSol}}/{{didaMissionDuration}}</p>
      </div>

      <div class="float-right" v-if="didaMissionSol>=1000">
        <p>Mission Sol #{{didaMissionSol}}/{{didaMissionDuration}}</p>
      </div>

      <div class="float-right" v-if="didaRover=='Curiosity'">
      <p> Gale Crater,&nbsp;</p>
      </div>

      <div class="float-right" v-if="didaRover=='Spirit'">
      <p> Gusev Crater,&nbsp;</p>
      </div>

      <div class="float-right" v-if="didaRover=='Opportunity'">
      <p> Meridiani Planum,&nbsp;</p>
      </div>

      <div class="float-right" v-if="didaRover=='Curiosity'">
      <p> {{this.getVerticalCo(didaCoord[1])}} {{this.getHorizontalCo(didaCoord[0])}},&nbsp;</p>
      </div>

      <div class="float-right" v-if="didaRover=='Perseverance'">
      <p> Jezero Crater,&nbsp;</p>
      </div>

     </div>
  </div>
  

</div>
</template>

<script>

export default {

  props: ["picId", "didaCamera", "didaRover", "didaCoord", "didaMissionSol", "didaMissionDuration", "imageLink", "setEffect", "threshold"],
  data() {
    return {
      canvasPic: "",
      ctx: ""
    }
  },

  methods: {

    getHorizontalCo (xC) {
      return (xC == 0 ? ( xC + "°") : (xC < 0 ? ( Math.abs(xC) + "° W") : ( xC + "° E")))
    },

    getVerticalCo (yC) {
      return (yC == 0 ? ( yC + "°") : (yC < 0 ? ( Math.abs(yC) + "° S") : ( yC + "° N")))
    },

    dithFloyd(link) {

      var img = new Image();
      var imageData;
      var vn = this;
      img.crossOrigin = "anonymous";

      img.addEventListener("load", function() {

        vn.canvasPic.width = this.width;
        vn.canvasPic.height = this.height;
        if (this.width < 500) {
          console.log("small width picture")
          vn.$parent.getRandomPic()
          return
          }
        
        if (this.height < 500) {
          console.log("small height picture")
          vn.$parent.getRandomPic()
          return
          }
          
        vn.ctx.drawImage(this, 0, 0, this.width, this.height);
        imageData = vn.ctx.getImageData(0, 0, this.width, this.height);

        var imageDataLength = imageData.data.length;
        var w = vn.canvasPic.width;
        var newPixel, err;

        if (vn.setEffect == 'Dithering') {
          
          for (var currentPixel = 0; currentPixel <= imageDataLength; currentPixel += 4) {
            // threshold for determining current pixel's conversion to a black or white pixel
            newPixel = imageData.data[currentPixel] < vn.threshold ? 0 : 255;
            err = Math.floor((imageData.data[currentPixel] - newPixel) / 23);
            imageData.data[currentPixel + 0 * 1 - 0] = newPixel;
            imageData.data[currentPixel + 4 * 1 - 0] += err * 7;
            imageData.data[currentPixel + 4 * w - 4] += err * 3;
            imageData.data[currentPixel + 4 * w - 0] += err * 5;
            imageData.data[currentPixel + 4 * w + 4] += err * 1;
            // Set g and b values equal to r (effectively greyscales the image fully)
            imageData.data[currentPixel + 1] = imageData.data[currentPixel + 2] = imageData.data[currentPixel];
          }
        }

        vn.ctx.clearRect(0, 0, canvasPic.width, canvasPic.height);
        vn.ctx.putImageData(imageData, 0, 0);
        vn.ctx.globalCompositeOperation = 'multiply';

      });

      img.src = link

    }
  },

  watch: {

    imageLink() {
      this.dithFloyd(this.imageLink)
    },

    threshold() {
      this.dithFloyd(this.imageLink)
    },

    setEffect() {
      this.dithFloyd(this.imageLink)
    },

    downloadPic() {
      // download canvas 
      let downloadLink = document.createElement('a');
      downloadLink.setAttribute('download',  this.didaMissionSol + '-' + this.picId + '.png');
      let dataURL = this.canvasPic .toDataURL('image/png');
      let url = dataURL.replace(/^data:image\/png/,'data:application/octet-stream');
      downloadLink.setAttribute('href',url);
      downloadLink.click();
      }
  },
    mounted() {

    this.canvasPic = document.getElementById("canvasPic");
    this.ctx = canvasPic.getContext("2d");


  }

}
</script>
