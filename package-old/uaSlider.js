class UaSlider {

    /**
     * @param {HTMLElement} element
     * @param {Object}      options
     * @param {Object}      options.slidesToScroll      Number of elements to scroll
     * @param {Object}      options.slidesVisible       Number of elements visible in a slider
     * @param {boolean}     options.navigation          Active the navigation
     * @param {boolean}     options.navigationThumbnail Active the navigation by Thumbnail
     * @param {boolean}     options.pagination          Active the pagination
     * @param {boolean}     options.infinite            Active infinite slider
     * @param {boolean}     options.autoplay            Active autoplay slider
     * @param {number}      options.autoplaySpeed       Speed autoplay slider
     * @param {number}      options.slideSpace          Space between two slide
     * @param {number}      options.slideFix            Location of the fix slide (first or last slide visible)
     * @param {boolean}     options.touchActive         Active touch slider
     */
    constructor(element, options = {}) {
        this.element = element;
        this.options = Object.assign({}, {
            slidesToScroll: 1,
            slidesVisible: 1,
            navigation: true,
            navigationThumbnail: false,
            pagination: false,
            infinite: false,
            autoplay: false,
            autoplaySpeed: 5000, // 5000 = 5 seconds
            slideSpace: 5,
            slideFix: 0,
            touchActive: true
        }, options);

        // Retrieve element's children
        this.children = [].slice.call(element.children);

        if(this.options.slidesVisible >= this.children.length) {
            this.options.slidesVisible = this.children.length;
            this.options.navigation = false;
            this.options.pagination = false;
        }

        if (this.options.slidesVisible < this.options.slidesToScroll) {
            this.options.slidesToScroll = this.options.slidesVisible;
        }

        // Construct slider
        this.root = this.createDivWithClass("ua_slider");
        this.mainContainer = this.createDivWithClass("ua_slider_main_container");

        this.allItemsContainer = this.createDivWithClass("ua_slider_all_items_container");
        this.allItemsContainer.style.marginRight = "-" + this.options.slideSpace + "px";

        this.container = this.createDivWithClass("ua_slider_container");
        this.allItemsContainer.appendChild(this.container);
        this.mainContainer.appendChild(this.allItemsContainer);
        this.root.appendChild(this.mainContainer);

        // Init current item
        this.currentItem = 0;

        // Init offset
        this.offset = 0;

        // Init slideFix
        this.slideFix = undefined;

        // Init autoplay
        this.autoplay = true;

        // Add slider to element
        this.element.appendChild(this.root);

        // Move callbacks
        this.moveCallbacks = [];

        // Init Items
        this.items = this.children.map((child) => {
            let item = this.createDivWithClass("ua_slider_item");
            item.appendChild(child);

            return item;
        });

        if (this.options.slideFix !== 0 && this.offset !== (this.children.length + 1)) {
            if (this.options.slideFix <= this.options.slidesVisible) {
                this.initSlideFix();
            } else {
                throw new Error("the position of the fix slide is impossible !");
            }
        }

        // Add clone items before and after items to init infinite loop
        if (this.options.infinite) {
            this.offset = this.options.slidesVisible + this.options.slidesToScroll;
            let isConstructInfinite = true;

            if (this.offset > this.children.length) {
                console.warn(
                    "You don't have enough elements in the slider for this configuration (" +
                    "element : #" + element.id + ", " +
                    "slidesToScroll : " + this.options.slidesToScroll + ", " +
                    "offset > nbChildren : " + this.offset + " > " + this.children.length +
                    ")"
                );
                isConstructInfinite = false;
            }

            if(isConstructInfinite) {
                this.items = [
                    ...this.items.slice(this.items.length - this.offset).map(item => item.cloneNode(true)),
                    ...this.items,
                    ...this.items.slice(0, this.offset).map(item => item.cloneNode(true))
                ];

                let position = this.offset;
                if (this.slideFix !== undefined && this.options.slideFix === 1) {
                    position = position - 1;
                }

                this.goToItem(position, false);
            }
        }

        // Add final item's list in the container
        this.items.forEach(item => this.container.appendChild(item));

        // Events
        window.addEventListener('resize', this.onWindowResize.bind(this));

        if (this.options.infinite) {
            this.container.addEventListener('transitionend', this.resetInfinite.bind(this));
        }

        if (this.options.autoplay && this.offset < this.children.length) {
            this.root.addEventListener('mouseover', () => {
                this.autoplay = false;
                // console.log('AURDEBUG', "autoplay / mouseover", this.element.id, this.autoplay);
            });

            this.root.addEventListener('mouseout', () => {
                this.autoplay = true;
                // console.log('AURDEBUG', "autoplay / mouseout", this.element.id, this.autoplay);
            });
        }

        // Manage touch swipe
        if(this.options.touchActive) {
            let sliderManager = new Hammer.Manager(this.root);
            sliderManager.add(new Hammer.Pan({threshold: 0, pointers: 0}));
            sliderManager.on('pan', (e) => {
                if (e.isFinal) {
                    if (e.additionalEvent === "panleft") {
                        // console.log('next');
                        this.goToItem(this.currentItem + this.options.slidesToScroll);
                    } else if (e.additionalEvent === "panright") {
                        // console.log('previous');
                        this.goToItem(this.currentItem - this.options.slidesToScroll);
                    } else {
                        // console.log('current');
                        this.goToItem(this.currentItem);
                    }
                }
            });
        }

        // Call Methods
        this.init();
    }

    /**
     * Start the slider
     */
    init() {
        if (this.options.navigation && this.offset < this.children.length) {
            this.createNavigation();
        }

        if (this.options.navigationThumbnail && this.offset < this.children.length) {
            this.createNavigationThumbnail();
        }

        if (this.options.pagination && this.offset < this.children.length) {
            this.createPagination();
            this.moveCallbacks.forEach(cb => cb(this.currentItem));
        }

        if (this.options.autoplay) {
            this.initAutoPlay();
        }

        this.setStyle();
    }

    /**
     * Add slide fix
     */
    initSlideFix() {
        if(this.offset < this.children.length) {
            this.slideFix = this.items[this.options.slideFix - 1].cloneNode(true);

            let newList = [];

            if(this.options.infinite) {
                this.items.forEach((item, key) => {
                    if (key !== this.options.slideFix - 1) {
                        newList.push(item);
                    }
                });

                this.items = newList;
            }

            this.slideFix.classList.add("ua_slider_fix");

            this.allItemsContainer.appendChild(this.slideFix);
        }
    }

    /**
     * Init autoplay slider
     */
    initAutoPlay() {
        if(this.offset < this.children.length) {
            window.setInterval(() => {
                if(this.autoplay) {
                    this.next();
                }
            }, this.options.autoplaySpeed);
        }
    }

    /**
     * Set the size to slider's container and slider's items
     */
    setStyle() {
        let ratio = this.items.length / this.slidesVisible;
        let paddingRight = this.options.slideSpace;

        this.container.style.width = (ratio * 100) + "%";
        if (this.slideFix !== undefined) {
            this.slideFix.style.width = "calc(" + (100 / this.slidesVisible).toFixed(2) + "%" + " - 1px)";

            if (this.options.slideFix === this.options.slidesVisible) {
                this.slideFix.style.left = "calc(" + (100 / this.slidesVisible) * (this.options.slideFix - 1) + "% + 2px)";
            } else {
                this.slideFix.style.left = (100 / this.slidesVisible) * (this.options.slideFix - 1) + "%";
            }
        }

        this.items.forEach((item) => {
            item.style.paddingRight = paddingRight + "px";
            item.style.width = "calc(" + ((100 / this.slidesVisible) / ratio) + "%" + " - " + paddingRight + "px)";
        });
    }

    /**
     * Generate previous and next button
     */
    createNavigation() {
        let nextButton = this.createDivWithClass("ua_slider_next");
        let prevButton = this.createDivWithClass("ua_slider_prev");

        this.root.appendChild(nextButton);
        this.root.appendChild(prevButton);

        nextButton.addEventListener('click', this.next.bind(this));
        prevButton.addEventListener('click', this.prev.bind(this));
    }

    /**
     * Generate thumbnail selector
     */
    createNavigationThumbnail() {
        // console.log("AURDEBUG", this.children);

        let thumbnailsContainer = this.createDivWithClass("ua_slider_thumbnails");
        this.root.appendChild(thumbnailsContainer);

        for(let i in this.children) {
            let child = this.children[i];

            let itemPosition = parseInt(i) + this.offset;

            let thumbnail = this.createImg(child.dataset.thumbnail);
            thumbnailsContainer.appendChild(thumbnail);

            thumbnail.addEventListener('click', this.goToItem.bind(this, itemPosition, false));
        }
    }

    /**
     * Generate pagination
     */
    createPagination() {
        this.pagination = this.createDivWithClass('ua_slider_pagination');

        let buttons = [];

        let calcNbButton = 0;

        if (this.options.infinite) {
            calcNbButton = (this.items.length - this.offset * 2) / this.slidesToScroll - 1;
        } else {
            calcNbButton = ((this.items.length - this.offset * 2) - this.slidesVisible) / this.slidesToScroll;
        }

        if(this.options.slideFix !== 0) {
            calcNbButton = calcNbButton + 1;
        }

        let nbButtons = Math.floor(calcNbButton);

        if (calcNbButton > nbButtons) {
            nbButtons = nbButtons + 1;
        }

        if (this.slideFix !== undefined) {
            nbButtons = nbButtons - 1;
        }

        for (let i = 0; i <= nbButtons; i++) {
            let button = this.createDivWithClass('ua_slider_button');
            let itemPosition = i + this.offset;

            if(this.options.slideFix !== 0 && this.options.infinite) {
                itemPosition = itemPosition - 1;
            }

            button.addEventListener('click', () => this.goToItem(itemPosition));

            this.pagination.appendChild(button);
            buttons.push(button);
        }

        this.onMove(index => {
            let count = this.items.length - this.offset * 2;

            let calcIndexButton = ((index - this.offset) % count) / this.slidesToScroll;
            let indexButton = Math.floor(calcIndexButton);

            if (calcIndexButton > indexButton && this.offset === 0) {
                indexButton = indexButton + 1;
            }

            if(this.options.slideFix !== 0 && indexButton === (count - 1)) {
                indexButton = indexButton - count;
            }

            if(this.options.slideFix !== 0 && this.options.infinite) {
                indexButton = indexButton + 1;
            }

            let activeButton = buttons[indexButton];

            buttons.forEach(button => button.classList.remove('active'));

            if (activeButton) {
                activeButton.classList.add('active');
            }
        });

        this.root.appendChild(this.pagination);
    }

    /**
     * Go to next item
     */
    next() {
        let index = this.currentItem + this.slidesToScroll;
        this.goToItem(index);
    }

    /**
     * Go to previous item
     */
    prev() {
        let index = this.currentItem - this.slidesToScroll;
        this.goToItem(index);
    }

    /**
     * Move the slider to the select element
     * @param {int} index
     * @param {boolean} animation
     */
    goToItem(index, animation = true) {
        if (index < 0) {
            index = 0;
        }

        if (parseInt(index) + this.slidesVisible >= this.items.length) {
            index = this.items.length - this.slidesVisible;
        }

        let translateX = index * -100 / this.items.length;

        if (animation === false) {
            this.disableTransition();
        }

        this.container.style.transform = 'translate3d(' + translateX + '%, 0, 0)';

        // force repaint
        this.container.offsetHeight;

        if (animation === false) {
            this.enableTransition();
        }

        this.currentItem = index;

        this.moveCallbacks.forEach(cb => cb(index));
    }

    /**
     * Move container to give the impression of a infinite' slide
     */
    resetInfinite() {
        if (this.currentItem <= this.options.slidesToScroll) {
            let position = this.currentItem + (this.items.length - this.offset * 2);
            this.goToItem(position, false);
        } else if (this.currentItem >= this.items.length - this.offset) {
            let position = this.currentItem - (this.items.length - this.offset * 2);
            this.goToItem(position, false);
        }
    }

    /**
     * @param {moveCallback} cb
     */
    onMove(cb) {
        this.moveCallbacks.push(cb);
    }

    onWindowResize() {
        this.setStyle();

        if(this.pagination) {
            this.pagination.remove();
            this.createPagination();
        }
    }

    /**
     *
     * @param {string} className
     * @returns {HTMLElement}
     */
    createDivWithClass(className) {
        let div = document.createElement('div');
        div.setAttribute('class', className);
        return div;
    }

    /**
     *
     * @param {string} path
     * @returns {HTMLElement}
     */
    createImg(path) {
        let img = document.createElement('img');
        img.setAttribute('src', path);
        return img;
    }

    disableTransition() {
        this.container.style.transition = 'none';
    }

    enableTransition() {
        this.container.style.transition = '';
    }

    /**
     * @returns {number}
     */
    get slidesToScroll() {
        let slideToScroll = this.options.slidesToScroll;
        if(this.windowWith <= 900) {
            slideToScroll = 1;
        }

        return slideToScroll;
    }

    /**
     * @returns {number}
     */
    get slidesVisible() {
        let slidesVisible = this.options.slidesVisible;

        if(this.windowWith <= 400 && this.options.slidesVisible >= 1) {
            slidesVisible = 1;
        } else if(this.windowWith <= 600 && this.options.slidesVisible >= 2) {
            slidesVisible = 2;
        } else if(this.windowWith <= 900 && this.options.slidesVisible >= 4) {
            slidesVisible = 4;
        }

        // Remove slide
        if(this.slideFix) {
            if (slidesVisible === 1) {
                this.slideFix.style.display = "none";
                // console.log(this.slideFix);
            } else {
                this.slideFix.style.display = "block";
            }
        }

        return slidesVisible;
    }

    get windowWith() {
        return window.screen.availWidth < window.innerWidth ? window.screen.availWidth : window.innerWidth;
    }
}

Element.prototype.uaSlider = function (object = {}) {
    return new UaSlider(this, object);
};