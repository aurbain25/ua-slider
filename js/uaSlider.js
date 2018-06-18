class uaSlider {

    /**
     * This call type is called moveCallback
     *
     * @callback moveCallback
     * @param {number} index
     */

    /**
     * @param {HTMLElement} element
     * @param {Object} options
     * @param {Object} options.slidesToScroll Number of elements to scroll
     * @param {Object} options.slidesVisible Number of elements visible in a slider
     * @param {boolean} options.navigation Active the navigation
     * @param {boolean} options.pagination Active the pagination
     * @param {boolean} options.infinite Active infinite slider
     */
    constructor(element, options = {}) {
        this.element = element;
        this.options = Object.assign({}, {
            slidesToScroll: 1,
            slidesVisible: 1,
            navigation: true,
            pagination: false,
            infinite: false
        }, options);

        if(this.options.slidesVisible < this.options.slidesToScroll) {
            this.options.slidesToScroll = this.options.slidesVisible;
        }

        // Retrieve element's children
        let children = [].slice.call(element.children);

        // Construct slider
        this.root = this.createDivWithClass("ua_slider");
        this.mainContainer = this.createDivWithClass("ua_slider_main_container");
        this.container = this.createDivWithClass("ua_slider_container");
        this.mainContainer.appendChild(this.container);
        this.root.appendChild(this.mainContainer);

        // Init current item
        this.currentItem = 0;

        // Init offset
        this.offset = 0;

        // Add slider to element
        this.element.appendChild(this.root);

        // Move callbacks
        this.moveCallbacks = [];

        // Init Items
        this.items = children.map((child) => {
            let item = this.createDivWithClass("ua_slider_item");
            item.appendChild(child);

            return item;
        });

        // Add clone items before and after items to init infinite loop
        if(this.options.infinite) {
            this.offset = this.options.slidesVisible + this.options.slidesToScroll;

            if(this.offset > children.length) {
                throw new Error(
                    "You don't have enough elements in the slider for this configuration (" +
                        "element : #" + element.id + ", " +
                        "slidesToScroll : " + this.options.slidesToScroll +
                    ")"
                );
            }

            this.items = [
                ...this.items.slice(this.items.length - this.offset).map(item => item.cloneNode(true)),
                ...this.items,
                ...this.items.slice(0, this.offset).map(item => item.cloneNode(true))
            ];

            this.goToItem(this.offset, false);
        }

        // Add final item's list in the container
        this.items.forEach(item => this.container.appendChild(item));

        // Responsive mode
        this.isMobile = false;

        // Accessibility
        // this.root.setAttribute('tabindex', 0);
        this.root.addEventListener('keyup', e => {
            if(e.key === 'ArrowRight' || e.key === "Right") {
                this.next();
            } else if(e.key === 'ArrowLeft' || e.key === "Left") {
                this.prev();
            }
        });

        // Events
        window.addEventListener('resize', this.onWindowResize.bind(this));
        if(this.options.infinite) {
            this.container.addEventListener('transitionend', this.resetInfinite.bind(this));
        }

        // Call Methods
        this.init();
    }

    /**
     * Start the slider
     */
    init () {
        if(this.options.navigation) {
            this.createNavigation();
        }

        if(this.options.pagination) {
            this.createPagination();
            this.moveCallbacks.forEach(cb => cb(this.currentItem));
        }

        this.setStyle();
        this.onWindowResize();

        // new uaSliderTouchPlugin(this);
    }

    /**
     * Set the size to slider's container and slider's items
     */
    setStyle () {
        let ratio = this.items.length / this.slidesVisible;
        this.container.style.width = (ratio * 100) + "%";

        this.items.forEach(item => item.style.width = ((100 / this.slidesVisible) / ratio) + "%");

        if(this.options.pagination) {
            if(this.isMobile) {
                this.pagination.style.display = "none";
                this.mobilePagination.style.display = "block";
            } else {
                this.pagination.style.display = "block";
                this.mobilePagination.style.display = "none";
            }
        }
    }

    /**
     * Generate previous and next button
     */
    createNavigation () {
        let nextButton = this.createDivWithClass("ua_slider_next");
        let prevButton = this.createDivWithClass("ua_slider_prev");

        this.root.appendChild(nextButton);
        this.root.appendChild(prevButton);

        nextButton.addEventListener('click', this.next.bind(this));
        prevButton.addEventListener('click', this.prev.bind(this));
    }

    /**
     * Generate pagination
     */
    createPagination () {
        this.pagination = this.createDivWithClass('ua_slider_pagination');
        this.mobilePagination = this.createDivWithClass('ua_slider_pagination_mobile');

        let buttons = [];
        let mobileButtons = [];

        let calcNbButton = 0;

        if(this.options.infinite) {
            calcNbButton = (this.items.length - this.offset * 2) / this.slidesToScroll - 1;
        } else {
            calcNbButton = ((this.items.length - this.offset * 2) - this.slidesVisible) / this.slidesToScroll;
        }

        let nbButtons = Math.floor(calcNbButton);

        if(calcNbButton > nbButtons) {
            nbButtons = nbButtons + 1;
        }

        for(let i = 0; i <= nbButtons; i++) {
            let button = this.createDivWithClass('ua_slider_button');
            button.addEventListener('click', () => this.goToItem(i + this.offset));

            this.pagination.appendChild(button);
            buttons.push(button);
        }

        for(let i = 0; i < (this.items.length - this.offset * 2); i++) {
            let button = this.createDivWithClass('ua_slider_button');
            button.addEventListener('click', () => this.goToItem(i));

            this.mobilePagination.appendChild(button);
            mobileButtons.push(button);
        }

        this.onMove(index => {
            if(this.options.infinite && this.isMobile) {
                index = index - this.offset;
            }

            let count = this.items.length - this.offset * 2;

            let calcIndexButton = ((index - this.offset) % count) / this.slidesToScroll;
            let indexButton = Math.floor(calcIndexButton);

            if(calcIndexButton > indexButton && this.offset === 0) {
                indexButton = indexButton + 1;
            }

            let activeButton = buttons[indexButton];
            let mobileActiveButton = mobileButtons[index];

            buttons.forEach(button => button.classList.remove('active'));
            mobileButtons.forEach(button => button.classList.remove('active'));

            if(activeButton) {
                activeButton.classList.add('active');
            }

            if(mobileActiveButton) {
                mobileActiveButton.classList.add('active');
            }
        });

        this.root.appendChild(this.pagination);
        this.root.appendChild(this.mobilePagination);
    }

    /**
     * Go to next item
     */
    next () {
        let index = this.currentItem + this.slidesToScroll;
        this.goToItem(index);
    }

    /**
     * Go to previous item
     */
    prev () {
        let index = this.currentItem - this.slidesToScroll;
        this.goToItem(index);
    }

    /**
     * Move the slider to the select element
     * @param {int} index
     * @param {boolean} animation
     */
    goToItem (index, animation = true) {
        if(index < 0) {
            index = 0;
        }

        if(index + this.slidesVisible >= this.items.length) {
            index = this.items.length - this.slidesVisible;
        }

        let translateX = index * -100 / this.items.length;

        if(animation === false) {
            this.disableTransition();
        }

        this.container.style.transform = 'translate3d(' + translateX + '%, 0, 0)';

        // force repaint
        this.container.offsetHeight;

        if(animation === false) {
            this.enableTransition();
        }

        this.currentItem = index;

        this.moveCallbacks.forEach(cb => cb(index));
    }

    /**
     * Move container to give the impression of a infinite' slide
     */
    resetInfinite() {
        if(this.currentItem <= this.options.slidesToScroll) {
            let position = this.currentItem + (this.items.length - this.offset * 2);
            this.goToItem(position, false);
        } else if(this.currentItem >= this.items.length - this.offset) {
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

    onWindowResize () {
        let mobile = window.innerWidth < 800 || window.orientation !== undefined;

        if(mobile !== this.isMobile)  {
            this.isMobile = mobile;

            this.setStyle();
        }
    }

    /**
     *
     * @param {string} className
     * @returns {HTMLElement}
     */
    createDivWithClass (className) {
        let div = document.createElement('div');
        div.setAttribute('class', className);
        return div;
    }

    disableTransition () {
        this.container.style.transition = 'none';
    }

    enableTransition () {
        this.container.style.transition = '';
    }

    /**
     * @returns {number}
     */
    get slidesToScroll () {
        return this.isMobile ? 1 : this.options.slidesToScroll;
    }

    /**
     * @returns {number}
     */
    get slidesVisible () {
        return this.isMobile ? 1 : this.options.slidesVisible;
    }
}

/**
 * Add tactile navigation to uaSlider
 */
class uaSliderTouchPlugin {

    /**
     *
     * @param {uaSlider} slider
     */
    constructor(slider) {
        slider.element.addEventListener('mousedown', this.startDrag.bind(this));
        slider.element.addEventListener('touchstart', this.startDrag.bind(this));

        window.addEventListener('mousedown', this.drag.bind(this));
        window.addEventListener('touchstart', this.drag.bind(this));

        this.slider = slider;
    }

    /**
     * Start the slider move at the touch
     * @param {Touch | null} e
     * @param {TouchList | null} e.touches
     */
    startDrag (e) {
        if(e.touches) {
            if (e.touches.length > 1) {
                return false;
            } else {
                e = e.touches.item(0);
            }
        }

        this.origin = {
            x: e.screenX,
            y: e.screenY
        };

        this.slider.disableTransition();
    }

    /**
     * Move the slider
     * @param {Touch | null} e
     * @param {TouchList | null} e.touches
     */
    drag (e) {
        if(this.origin) {
            let point = e.touches ? e.touches.item(0) : e;
            let translation = {
                x: point.screenX - this.origin.x,
                y: point.screenY - this.origin.y
            };

            console.log(translation);
        }
    }
}