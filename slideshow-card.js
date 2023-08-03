class SlideshowCard extends HTMLElement {
  myPromise = new Promise((resolve) => { this.resolve = resolve });

  constructor() {
    super();
    this.slideIndex = 1;
    this.attachShadow({ mode: 'open' });
  }

  async ready() {
    super.ready();
    await Promise.all([this.updateComplete, this.myPromise]);
    this._setInnerCardStyle()
    this._createNavigation();
    this.shadowRoot.firstChild.querySelector('.card').querySelector('.prev').addEventListener('click', this._prevSlide.bind(this));
    this.shadowRoot.firstChild.querySelector('.card').querySelector('.next').addEventListener('click',this._nextSlide.bind(this));
    this._styleCard();
    if (this.config.auto_play) {
      this.interval = setInterval(this._autoPlay.bind(this), (this.config.auto_delay * 1000) || 5000);
      this.addEventListener('mouseover', this._stopSlide.bind(this));
      this.addEventListener('mouseout', this._startSlide.bind(this));
    }
    this._showSlides(this.slideIndex);
    
  }

  set hass(hass) {
    this.hasSetup = this.setupHass(hass);
  }

  async setupHass(hass) {
    this._cards = await Promise.all(this._cards);
    if (!this.content) {
      const card = document.createElement('ha-card');
      this.content = document.createElement('div');
      this.content.className = 'card';
      card.appendChild(this.content);
      if(this.config.cards) {
        this._cards.forEach(item => {
          item.hass = hass;
          item.className = 'slides fade';
        });
      }
        
      this.card = card;
      this.shadowRoot.appendChild(card);

      if(hass.states[this.config.folder]) {
        this.images = hass.states[this.config.folder].attributes.file_list;
        if (this.config.folder_sort) {
          this.images.sort()
        }
        this.images.forEach(item => {
          const image = document.createElement('img');
          var fileLocation = item.substring(item.indexOf("www")+3);
          image.setAttribute("src", "/local" + fileLocation);
          image.className = 'slides fade';
          image.style.setProperty("width", "100%");
          image.style.setProperty("max-height", "100%");
          for(var k in this.config.style) {
            image.style.setProperty(k, this.config.style[k]);
          }
          this.content.appendChild(image);
        });
      }
    }
    else {
      if (this.config.cards)
        this._cards.forEach(item => {
          item.hass = hass;
        });
      if(hass.states[this.config.folder]){
        this.images = hass.states[this.config.folder].attributes.file_list;
        if (this.config.folder_sort) {
          this.images.sort()
        }
        this.images.forEach(item => {
          if(!this.images.includes(item)){
            const image = document.createElement('img');
            var fileLocation = item.substring(item.indexOf("www")+3);
            image.setAttribute("src", "/local" + fileLocation);
            image.className = 'slides fade';
            image.style.setProperty("width", "100%");
            for(var k in this.config.style) {
              image.style.setProperty(k, this.config.style[k]);
            }
            this.content.appendChild(image);
            this.images.push(item);
          }
        });
      }
    }
    this.resolve();
  }

  setConfig(config) {
    this.config = config;

    if (!config || (!config.folder && (!config.cards || !Array.isArray(config.cards) || config.cards.length < 2))) {
      throw new Error('Card Configuration is not set up properly - no cards!');
    }
    
    if (!config || (config.folder && (!config.cards || !Array.isArray(config.cards) || config.cards.length < 1))) {
      throw new Error('Card Configuration is not set up properly - folder option needs at least 1 card!');
    }


    this._cards = config.cards.map(async (item) => {
      let element;
      const helper = await window.loadCardHelpers();
      if (item.type.startsWith("custom:")) {
        element = helper.createCardElement(item);
      } else {
        element = helper.createCardElement(item);
      }
      
      if (this.hass) {
        element.hass = this.hass;
      }

      return element;
    });
    
  }

  _styleCard() {
    for(var k in this.config.style) {
      this.card.style.setProperty(k, this.config.style[k]);
    }
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
      .card {
        position: relative;
        padding: ${this.config.fill ? '0' : '2'}em;
      }

      .slides {
          display: none;
      }

      /* Next & previous buttons */
      .prev, .next {
        cursor: pointer;
        position: absolute;
        top: 50%;
        width: auto;
        margin-top: -22px;
        opacity:  ${this.config.arrow_opacity || '1'};
        color: ${this.config.arrow_color || 'white'};
        font-weight: bold;
        font-size: 18px;
        transition: 0.6s ease;
        border-radius: 0 3px 3px 0;
        padding: 16px 10px
      }

      .next {
        right: 0;
        border-radius: 3px 0 0 3px;
      }

      .prev {
        left: 0;
      }

      .fade {
        -webkit-animation-name: fade;
        -webkit-animation-duration: DURATION;
        animation-name: fade;
        animation-duration: DURATION;
      }

      @-webkit-keyframes fade {
        from {opacity: .4}
        to {opacity: 1}
      }

      @keyframes fade {
        from {opacity: .4}
        to {opacity: 1}
      }
    `;
    if (this.config.no_fade) {
      style.innerHTML = style.innerHTML.replace("DURATION","0")
    } else {
      style.innerHTML = style.innerHTML.replace("DURATION","1s")
    }
    this.card.appendChild(style);
  }

  _setInnerCardStyle() {
    if(this.config.cards) {
      const styleCards = this._cards;
      styleCards.forEach(item => {
        this.content.appendChild(item);
        let target = null;
        
        if(item.shadowRoot && item.shadowRoot.querySelector("ha-card")) {
          target = item.shadowRoot.querySelector("ha-card");
        } else if(item.querySelector("ha-card")) {
          target = item.querySelector("ha-card");
        } else if(item.firstChild && item.firstChild.shadowRoot && item.firstChild.shadowRoot.querySelector("ha-card")) {
          target = item.firstChild.shadowRoot.querySelector("ha-card");
        } else {
          target = item;
        }

        let tempConfig = item.config;
        if(!tempConfig) {
          tempConfig = item._config;
        }
        if (tempConfig) {
          for(var k in tempConfig.style) {
            if(target && target.style) {
              target.style.setProperty(k, tempConfig.style[k]);
            }
            
          }
        }
        item.style.setProperty('box-shadow', 'none');
      });
      
    }
  }


  _createNavigation() {
    this.content.insertAdjacentHTML('beforeend',`<a class="prev">
      <svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path fill="${this.config.arrow_color || 'black'}" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
      </svg>
    </a>
    <a class="next">
      <svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path fill="${this.config.arrow_color || 'black'}" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
      </svg>
    </a>`);
  }

  _prevSlide() {
    clearInterval(this.interval);
    this._showSlides(this.slideIndex -= 1);
    if (this.config.auto_play)
      this.interval = setInterval(this._autoPlay.bind(this), (this.config.auto_delay * 1000) || 5000);
  }

  _nextSlide() {
    clearInterval(this.interval);
    this._showSlides(this.slideIndex += 1);
    if (this.config.auto_play)
      this.interval = setInterval(this._autoPlay.bind(this), (this.config.auto_delay * 1000) || 5000);
  }

  _showSlides(n) {
    var i;
    var slides = this.shadowRoot.firstChild.getElementsByClassName("slides");
    if (n > slides.length) {this.slideIndex = 1}
    if (n < 1) {this.slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    slides[this.slideIndex-1].style.display = "block";
  }

  _autoPlay() {
    var i;
    var slides = this.shadowRoot.firstChild.getElementsByClassName("slides");
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    this.slideIndex++;
    if (this.slideIndex > slides.length) {this.slideIndex = 1}
    slides[this.slideIndex-1].style.display = "block";
  }

  _stopSlide(){
    clearInterval(this.interval);
  }

  _startSlide() {
    clearInterval(this.interval);
    this.interval = setInterval(this._autoPlay.bind(this), (this.config.auto_delay * 1000) || 5000);
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('slideshow-card', SlideshowCard);
