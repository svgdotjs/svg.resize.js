# Examples

<script setup>
  import { ref, onMounted } from 'vue'
  import { SVG } from '@svgdotjs/svg.js';
  import '@svgdotjs/svg.select.js';
  import '@svgdotjs/svg.resize.js';
  import '@svgdotjs/svg.select.js/src/svg.select.css'
  import './style.css'

  const polygonNormal = ref();
  const polygonSnap = ref();
  const polygonCtrl = ref();

  onMounted(() => {
    new SVG()
      .addTo(polygonNormal.value)
      .size("100%", "100%")
      .polygon("350,50 283,250 450,122 250,122 416,250")
      .select()
      .pointSelect()
      .resize();

    new SVG()
      .addTo(polygonSnap.value)
      .size("100%", "100%")
      .polygon("350,50 283,250 450,122 250,122 416,250")
      .select()
      .pointSelect()
      .resize();
    
    var poly = new SVG().addTo(polygonCtrl.value)
      .size("100%", "100%")
      .polygon("350,50 283,250 450,122 250,122 416,250")
      .select()
      .pointSelect()
      .resize();

    window.addEventListener('keydown', function(e){
      if(e.keyCode == 17){
          poly.resize({'grid': 20, 'degree':15});
      }
    })

    window.addEventListener('keyup', function(e){
      if(e.keyCode == 17){
          poly.resize({'grid': 1,'degree':0.1});
      }
    })
  })
</script>

This page demonstrates some of the built-in markdown extensions provided by VitePress.

## Normal resizing

```ts
new SVG()
  .addTo("#polygon_normal")
  .size("100%", "100%")
  .polygon("350,50 283,250 450,122 250,122 416,250")
  .select()
  .pointSelect()
  .resize();
```

<div ref="polygonNormal" class="box"></div>

## Resizing with grid and degree

```ts
new SVG()
  .addTo("#polygon_snap")
  .size("100%", "100%")
  .polygon("350,50 283,250 450,122 250,122 416,250")
  .select()
  .pointSelect()
  .resize({ grid: 20, degree: 15 });
```

<div ref="polygonSnap" class="box"></div>

## Snaps on ctrl down

```ts
var poly = new SVG()
  .addTo("#polygon_ctrl")
  .size("100%", "100%")
  .polygon("350,50 283,250 450,122 250,122 416,250")
  .select()
  .pointSelect()
  .resize();

window.addEventListener("keydown", function (e) {
  if (e.keyCode == 17) {
    poly.resize({ grid: 20, degree: 15 });
  }
});

window.addEventListener("keyup", function (e) {
  if (e.keyCode == 17) {
    poly.resize({ grid: 1, degree: 0.1 });
  }
});
```

<div ref="polygonCtrl" class="box"></div>
