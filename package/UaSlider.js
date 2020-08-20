"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Hammer = require("hammerjs");
var UaSlider = (function () {
    function UaSlider(element, options) {
        var _this = this;
        this.element = element;
        this.options = __assign({
            slidesToScroll: 1,
            slidesVisible: 1,
            navigation: true,
            navigationThumbnail: false,
            pagination: false,
            infinite: false,
            autoplay: false,
            autoplaySpeed: 5000,
            slideSpace: 5,
            slideFix: 0,
            touchActive: true
        }, options);
        this.children = [].slice.call(element.children);
        if (this.options.slidesVisible >= this.children.length) {
            this.options.slidesVisible = this.children.length;
            this.options.navigation = false;
            this.options.pagination = false;
        }
        if (this.options.slidesVisible < this.options.slidesToScroll) {
            this.options.slidesToScroll = this.options.slidesVisible;
        }
        this.root = this.createDivWithClass("ua_slider");
        this.mainContainer = this.createDivWithClass("ua_slider_main_container");
        this.allItemsContainer = this.createDivWithClass("ua_slider_all_items_container");
        this.allItemsContainer.style.marginRight = "-" + this.options.slideSpace + "px";
        this.container = this.createDivWithClass("ua_slider_container");
        this.allItemsContainer.appendChild(this.container);
        this.mainContainer.appendChild(this.allItemsContainer);
        this.root.appendChild(this.mainContainer);
        this.currentItem = 0;
        this.offset = 0;
        this.slideFix = undefined;
        this.autoplay = true;
        this.element.appendChild(this.root);
        this.moveCallbacks = [];
        this.items = this.children.map(function (child) {
            var item = _this.createDivWithClass("ua_slider_item");
            item.appendChild(child);
            return item;
        });
        if (this.options.slideFix !== 0 && this.offset !== (this.children.length + 1)) {
            if (this.options.slideFix <= this.options.slidesVisible) {
                this.initSlideFix();
            }
            else {
                throw new Error("the position of the fix slide is impossible !");
            }
        }
        if (this.options.infinite) {
            this.offset = this.options.slidesVisible + this.options.slidesToScroll;
            var isConstructInfinite = true;
            if (this.offset > this.children.length) {
                console.warn("You don't have enough elements in the slider for this configuration (" +
                    "element : #" + element.id + ", " +
                    "slidesToScroll : " + this.options.slidesToScroll + ", " +
                    "offset > nbChildren : " + this.offset + " > " + this.children.length +
                    ")");
                isConstructInfinite = false;
            }
            if (isConstructInfinite) {
                this.items = __spreadArrays(this.items.slice(this.items.length - this.offset).map(function (item) { return item.cloneNode(true); }), this.items, this.items.slice(0, this.offset).map(function (item) { return item.cloneNode(true); }));
                var position = this.offset;
                if (this.slideFix !== undefined && this.options.slideFix === 1) {
                    position = position - 1;
                }
                this.goToItem(position, false);
            }
        }
        this.items.forEach(function (item) { return _this.container.appendChild(item); });
        window.addEventListener('resize', this.onWindowResize.bind(this));
        if (this.options.infinite) {
            this.container.addEventListener('transitionend', this.resetInfinite.bind(this));
        }
        if (this.options.autoplay && this.offset < this.children.length) {
            this.root.addEventListener('mouseover', function () {
                _this.autoplay = false;
            });
            this.root.addEventListener('mouseout', function () {
                _this.autoplay = true;
            });
        }
        if (this.options.touchActive) {
            var sliderManager = new Hammer.Manager(this.root);
            sliderManager.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
            sliderManager.on('pan', function (e) {
                if (e.isFinal) {
                    if (e.type === "panleft") {
                        _this.goToItem(_this.currentItem + _this.options.slidesToScroll);
                    }
                    else if (e.type === "panright") {
                        _this.goToItem(_this.currentItem - _this.options.slidesToScroll);
                    }
                    else {
                        _this.goToItem(_this.currentItem);
                    }
                }
            });
        }
        this.init();
    }
    UaSlider.prototype.init = function () {
        var _this = this;
        if (this.options.navigation && this.offset < this.children.length) {
            this.createNavigation();
        }
        if (this.options.navigationThumbnail && this.offset < this.children.length) {
            this.createNavigationThumbnail();
        }
        if (this.options.pagination && this.offset < this.children.length) {
            this.createPagination();
            this.moveCallbacks.forEach(function (cb) { return cb(_this.currentItem); });
        }
        if (this.options.autoplay) {
            this.initAutoPlay();
        }
        this.setStyle();
    };
    UaSlider.prototype.initSlideFix = function () {
        var _this = this;
        if (this.offset < this.children.length) {
            this.slideFix = this.items[this.options.slideFix - 1].cloneNode(true);
            var newList_1 = [];
            if (this.options.infinite) {
                this.items.forEach(function (item, key) {
                    if (key !== _this.options.slideFix - 1) {
                        newList_1.push(item);
                    }
                });
                this.items = newList_1;
            }
            this.slideFix.classList.add("ua_slider_fix");
            this.allItemsContainer.appendChild(this.slideFix);
        }
    };
    UaSlider.prototype.initAutoPlay = function () {
        var _this = this;
        if (this.offset < this.children.length) {
            window.setInterval(function () {
                if (_this.autoplay) {
                    _this.next();
                }
            }, this.options.autoplaySpeed);
        }
    };
    UaSlider.prototype.setStyle = function () {
        var _this = this;
        var ratio = this.items.length / this.slidesVisible;
        var paddingRight = this.options.slideSpace;
        this.container.style.width = (ratio * 100) + "%";
        if (this.slideFix !== undefined) {
            this.slideFix.style.width = "calc(" + (100 / this.slidesVisible).toFixed(2) + "%" + " - 1px)";
            if (this.options.slideFix === this.options.slidesVisible) {
                this.slideFix.style.left = "calc(" + (100 / this.slidesVisible) * (this.options.slideFix - 1) + "% + 2px)";
            }
            else {
                this.slideFix.style.left = (100 / this.slidesVisible) * (this.options.slideFix - 1) + "%";
            }
        }
        this.items.forEach(function (item) {
            item.style.paddingRight = paddingRight + "px";
            item.style.width = "calc(" + ((100 / _this.slidesVisible) / ratio) + "%" + " - " + paddingRight + "px)";
        });
    };
    UaSlider.prototype.createNavigation = function () {
        var nextButton = this.createDivWithClass("ua_slider_next");
        var prevButton = this.createDivWithClass("ua_slider_prev");
        this.root.appendChild(nextButton);
        this.root.appendChild(prevButton);
        nextButton.addEventListener('click', this.next.bind(this));
        prevButton.addEventListener('click', this.prev.bind(this));
    };
    UaSlider.prototype.createNavigationThumbnail = function () {
        var thumbnailsContainer = this.createDivWithClass("ua_slider_thumbnails");
        this.root.appendChild(thumbnailsContainer);
        for (var i in this.children) {
            var child = this.children[i];
            var itemPosition = parseInt(i) + this.offset;
            var thumbnail = this.createImg(child.dataset.thumbnail);
            thumbnailsContainer.appendChild(thumbnail);
            thumbnail.addEventListener('click', this.goToItem.bind(this, itemPosition, false));
        }
    };
    UaSlider.prototype.createPagination = function () {
        var _this = this;
        this.pagination = this.createDivWithClass('ua_slider_pagination');
        var buttons = [];
        var calcNbButton = 0;
        if (this.options.infinite) {
            calcNbButton = (this.items.length - this.offset * 2) / this.slidesToScroll - 1;
        }
        else {
            calcNbButton = ((this.items.length - this.offset * 2) - this.slidesVisible) / this.slidesToScroll;
        }
        if (this.options.slideFix !== 0) {
            calcNbButton = calcNbButton + 1;
        }
        var nbButtons = Math.floor(calcNbButton);
        if (calcNbButton > nbButtons) {
            nbButtons = nbButtons + 1;
        }
        if (this.slideFix !== undefined) {
            nbButtons = nbButtons - 1;
        }
        var _loop_1 = function (i) {
            var button = this_1.createDivWithClass('ua_slider_button');
            var itemPosition = i + this_1.offset;
            if (this_1.options.slideFix !== 0 && this_1.options.infinite) {
                itemPosition = itemPosition - 1;
            }
            button.addEventListener('click', function () { return _this.goToItem(itemPosition); });
            this_1.pagination.appendChild(button);
            buttons.push(button);
        };
        var this_1 = this;
        for (var i = 0; i <= nbButtons; i++) {
            _loop_1(i);
        }
        this.onMove(function (index) {
            var count = _this.items.length - _this.offset * 2;
            var calcIndexButton = ((index - _this.offset) % count) / _this.slidesToScroll;
            var indexButton = Math.floor(calcIndexButton);
            if (calcIndexButton > indexButton && _this.offset === 0) {
                indexButton = indexButton + 1;
            }
            if (_this.options.slideFix !== 0 && indexButton === (count - 1)) {
                indexButton = indexButton - count;
            }
            if (_this.options.slideFix !== 0 && _this.options.infinite) {
                indexButton = indexButton + 1;
            }
            var activeButton = buttons[indexButton];
            buttons.forEach(function (button) { return button.classList.remove('active'); });
            if (activeButton) {
                activeButton.classList.add('active');
            }
        });
        this.root.appendChild(this.pagination);
    };
    UaSlider.prototype.next = function () {
        var index = this.currentItem + this.slidesToScroll;
        this.goToItem(index);
    };
    UaSlider.prototype.prev = function () {
        var index = this.currentItem - this.slidesToScroll;
        this.goToItem(index);
    };
    UaSlider.prototype.goToItem = function (index, animation) {
        if (animation === void 0) { animation = true; }
        if (index < 0) {
            index = 0;
        }
        if (index + this.slidesVisible >= this.items.length) {
            index = this.items.length - this.slidesVisible;
        }
        var translateX = index * -100 / this.items.length;
        if (animation === false) {
            this.disableTransition();
        }
        this.container.style.transform = 'translate3d(' + translateX + '%, 0, 0)';
        this.container.offsetHeight;
        if (animation === false) {
            this.enableTransition();
        }
        this.currentItem = index;
        this.moveCallbacks.forEach(function (cb) { return cb(index); });
    };
    UaSlider.prototype.resetInfinite = function () {
        if (this.currentItem <= this.options.slidesToScroll) {
            var position = this.currentItem + (this.items.length - this.offset * 2);
            this.goToItem(position, false);
        }
        else if (this.currentItem >= this.items.length - this.offset) {
            var position = this.currentItem - (this.items.length - this.offset * 2);
            this.goToItem(position, false);
        }
    };
    UaSlider.prototype.onMove = function (cb) {
        this.moveCallbacks.push(cb);
    };
    UaSlider.prototype.onWindowResize = function () {
        this.setStyle();
        if (this.pagination) {
            this.pagination.remove();
            this.createPagination();
        }
    };
    UaSlider.prototype.createDivWithClass = function (className) {
        var div = document.createElement('div');
        div.setAttribute('class', className);
        return div;
    };
    UaSlider.prototype.createImg = function (path) {
        var img = document.createElement('img');
        img.setAttribute('src', path);
        return img;
    };
    UaSlider.prototype.disableTransition = function () {
        this.container.style.transition = 'none';
    };
    UaSlider.prototype.enableTransition = function () {
        this.container.style.transition = '';
    };
    Object.defineProperty(UaSlider.prototype, "slidesToScroll", {
        get: function () {
            var slideToScroll = this.options.slidesToScroll;
            if (this.windowWith <= 900) {
                slideToScroll = 1;
            }
            return slideToScroll;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UaSlider.prototype, "slidesVisible", {
        get: function () {
            var slidesVisible = this.options.slidesVisible;
            if (this.windowWith <= 400 && this.options.slidesVisible >= 1) {
                slidesVisible = 1;
            }
            else if (this.windowWith <= 600 && this.options.slidesVisible >= 2) {
                slidesVisible = 2;
            }
            else if (this.windowWith <= 900 && this.options.slidesVisible >= 4) {
                slidesVisible = 4;
            }
            if (this.slideFix) {
                if (slidesVisible === 1) {
                    this.slideFix.style.display = "none";
                }
                else {
                    this.slideFix.style.display = "block";
                }
            }
            return slidesVisible;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UaSlider.prototype, "windowWith", {
        get: function () {
            return window.screen.availWidth < window.innerWidth ? window.screen.availWidth : window.innerWidth;
        },
        enumerable: false,
        configurable: true
    });
    return UaSlider;
}());
