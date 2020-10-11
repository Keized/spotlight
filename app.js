/**
 * @property {SpotlightItem[]} items
 * @property {SpotlightItem[]} matchedItems
 * @property {SpotlightItem} activeItem
 * @property {HTMLInputElement} input
 * @property {HTMLElement[]} suggestions
 */
class Spotlight extends HTMLElement {
    constructor() {
        super();
        this.shortcutHandler = this.shortcutHandler.bind(this);
        this.hide = this.hide.bind(this);
        this.reveal = this.reveal.bind(this);
        this.inputHandler = this.inputHandler.bind(this);
        this.arrowHandler = this.arrowHandler.bind(this);
    }

    connectedCallback() {
        this.classList.add('spotlight')

        this.innerHTML = `
            <div class="spotlight-bar">
                <input type="text">
                <ul class="spotlight-suggestions">
                    
                </ul>
            </div>
        `;

        this.input = this.querySelector('input');
        this.suggestions = this.querySelector('.spotlight-suggestions');
        this.items = Array.from(document.querySelectorAll(this.getAttribute('target')), (a) => {
            const item = new SpotlightItem(a.innerText.trim(), a.getAttribute('href'));
            this.suggestions.appendChild(item.element);
            return item;
        });

        window.addEventListener('keydown', this.shortcutHandler)
        this.input.addEventListener('blur', this.hide);
        this.input.addEventListener('input', this.inputHandler)
        this.input.addEventListener('keydown', this.keyHandler)
    }

    disconnectedCallback() {
        window.removeEventListener('keydown', this.shortcutHandler)
    }

    /**
     * @param {KeyboardEvent} e
     */
    shortcutHandler(e) {
        if (e.key === ' ' && e.ctrlKey === true) {
            this.reveal()
        }
    }

    /**
     * @param {KeyboardEvent} e
     */
    keyHandler(e) {
        if (e.key === 'Escape') {
            this.input.blur();
            return;
        }

        if (e.key === 'ArrowDown') {
            const index = this.matchedItems.findIndex(elem => elem === this.activeItem);
            if (index !== this.matchedItems.length - 1) {
                this.setActiveItem(index + 1);
            }
        }

        if (e.key === 'ArrowUp') {
            const index = this.matchedItems.findIndex(elem => elem === this.activeItem);
            if (index !== 0) {
                this.setActiveItem(index - 1);
            }
        }

        if (e.key === 'Enter') {
            this.activeItem.follow();
        }
    }

    /**
     * @param {InputEvent} e
     */
    inputHandler(e) {
        const search = e.target.value.trim();
        if (search === '') {
           this.items.forEach((item) => item.hide());
           this.matchedItems = [];
           return;
        }

        let exp = '^(.*)';
        for (const i in search) {
            exp += `(${search[i]})(.*)`
        }
        exp += '$';

        const regExp = new RegExp(exp, 'i')
        this.matchedItems = this.items.filter((item) => item.match(regExp));

        if (this.matchedItems.length > 0) {
            this.setActiveItem(0);
        }
    }

    /**
     * @param {number} n
     */
    setActiveItem(n) {
        if (this.activeItem) {
            this.activeItem.unselect();
        }
        this.activeItem = this.matchedItems[n];
        this.activeItem.select();
    }

    reveal() {
        this.classList.add('active');
        this.input.focus();
    }

    hide() {
        this.classList.remove('active');
    }
}


/**
 * @property {HTMLLIElement} element
 * @property {string} title
 * @property {string} href
 */
class SpotlightItem {
    constructor(title, href) {
        const li = document.createElement('li');
        const a = document.createElement('a');

        a.setAttribute('href', href);
        a.innerText = title;
        li.appendChild(a);
        this.element = li;
        this.title = title;
        this.href = href;
        this.hide();
    }

    /**
     * @param {RegExp} regexp
     * @return {boolean}
     */
    match(regexp) {
        const matches = this.title.match(regexp);
        if (matches === null) {
            this.hide()
            return false;
        }

        this.element.firstElementChild.innerHTML = matches.reduce((acc, match, index) => {
            if (index === 0) {
                return acc;
            }

            return acc + (index % 2 === 0 ? `<mark>${match}</mark>` : match);
        }, '')

        this.element.removeAttribute('hidden');
        return true;
    }

    hide() {
        this.element.setAttribute('hidden', 'hidden')
    }

    unselect() {
        this.element.classList.remove('selected')
    }

    select() {
        this.element.classList.add('selected');
    }

    follow() {
        window.location = this.href;
    }
}

customElements.define('spotlight-bar', Spotlight);
