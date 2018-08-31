document.addEventListener('DOMContentLoaded', function () {
    new uaSlider(document.querySelector("#slider_1"), {
        slidesVisible: 3,
        slidesToScroll: 1,
        navigation: true,
        pagination: true
    });
});

// document.addEventListener('DOMContentLoaded', function () {
//     new uaSlider(document.querySelector("#slider_2"), {
//         slidesToScroll: 1,
//         slidesVisible: 3,
//         pagination: true
//     });
// });

// document.addEventListener('DOMContentLoaded', function () {
//     new uaSlider(document.querySelector("#slider_3"), {
//         slidesToScroll: 1,
//         slidesVisible: 3,
//         infinite: true,
//         pagination: true
//     });
// });

// document.addEventListener('DOMContentLoaded', function () {
//     new uaSlider(document.querySelector("#slider_4"), {
//         slidesToScroll: 1,
//         slidesVisible: 6,
//         infinite: true,
//         // pagination: true,
//         autoplay: true,
//         slideFix: 1
//     });
// });

document.addEventListener('DOMContentLoaded', function () {
    new uaSlider(document.querySelector("#slider_5"), {
        navigation: true,
        pagination: true,
        navigationThumbnail: true
    });
});