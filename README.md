# UA Slider

![version](https://img.shields.io/badge/Version-2.0.0-green.svg)

UA Slider is a free slider which can use as a simple responsive slider or with a fix item.

[Demo](https://ua-slider.alexandreurbain.fr)

## Summary
+ [Features](#features)
+ [Quick start](#quick-start)
+ [Browser Support](#browser-support)
+ [Contributing](#contributing)
+ [License](#license)

## Features

| Name | Description |
| ---- | ----- |
| slidesToScroll | Number of elements to scroll |
| slidesVisible | Number of elements visible in a slider |
| navigation | Active the navigation |
| navigationThumbnail | Active the navigation by Thumbnail |
| pagination | Active the pagination |
| loop | Active infinite slider |
| autoplay | Active autoplay slider |
| autoplaySpeed | Speed autoplay slider |
| slideSpace | Space between two slide |
| slideFix | Location of the fix slide (first or last slide visible) |
| touchActive | Active touch slider |

## Quick start

### Install

This package can be install with :
- NPM : `npm install aurbain25/ua-slider`
- Download : [latest release](https://github.com/aurbain25/ua-slider/archive/v2.0.0.zip)

### Load

#### 1. Add CSS

```html
<link rel="stylesheet" href="./node_modules/ua-slider/ua-slider.min.css">
```

#### 2. Add UA Slider script

```html
<script src="./node_modules/ua-slider/ua-slider.min.js"></script>
```

#### 3. Add markup

```html
<div id="slider_1">
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
</div>
```

#### 4. Init slider

```js
const slider = new uaSlider("#slider_1", {});
```


## Browser Support

**Desktop:**
- Chrome 81+ ✓
- Firefox 78+ ✓
- Safari 13+ ✓
- Edge  ✓
- IE 11+ ✓

**Mobile:**
- Chrome 81+ ✓
- Firefox Android 68+ ✓
- Firefox iOS 27+ ✓
- Safari 13.1+ ✓

## Contributing

### Development

First you need to install all dependencies :

```
npm install
```

Next, build the project :

```
npm run build
```

### Production

```
npm run build --prod
```

## License

This project is available under the [ISC](https://opensource.org/licenses/ISC) license.