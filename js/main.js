// Classic Slider
/*document.addEventListener('DOMContentLoaded', function () {
    new uaSlider(document.querySelector("#slider_1"), {});
});*/

document.querySelector("#slider_1").uaSlider({
    navigation: true
});

// Slider With Pagination
document.addEventListener('DOMContentLoaded', function () {
    new UaSlider(document.querySelector("#slider_2"), {
        pagination: true
    });
});

// Slider Without Navigation But With Pagination
document.addEventListener('DOMContentLoaded', function () {
    new UaSlider(document.querySelector("#slider_3"), {
        navigation: false,
        pagination: true
    });
});

// Multiple Slider
document.addEventListener('DOMContentLoaded', function () {
    new UaSlider(document.querySelector("#slider_4"), {
        navigation: true,
        pagination: true,
        slidesVisible: 3,
        slidesToScroll: 1
    });
});

// Multiple Slider Infinite
document.addEventListener('DOMContentLoaded', function () {
    new UaSlider(document.querySelector("#slider_5"), {
        navigation: true,
        pagination: true,
        infinite: true,
        slidesVisible: 3,
        slidesToScroll: 1
    });
});

// Multiple Slider With One Fix Element
document.addEventListener('DOMContentLoaded', function () {
    new UaSlider(document.querySelector("#slider_6"), {
        navigation: true,
        pagination: true,
        infinite: true,
        slidesVisible: 3,
        slidesToScroll: 1,
        slideFix: 1
    });
});

// Autoplay Slider
document.addEventListener('DOMContentLoaded', function () {
    new UaSlider(document.querySelector("#slider_7"), {
        navigation: true,
        pagination: true,
        infinite: true,
        slidesVisible: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000 // 5000 = 5s
    });
});

// Slider Thumbnail Navigation
document.addEventListener('DOMContentLoaded', function () {
    new UaSlider(document.querySelector("#slider_8"), {
        navigation: false,
        pagination: false,
        infinite: true,
        navigationThumbnail: true,
        slidesVisible: 1,
        slidesToScroll: 1
    });
});