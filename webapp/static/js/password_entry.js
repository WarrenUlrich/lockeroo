"use strict";
class PasswordEntry extends HTMLElement {
    shadow;
    expandIcon;
    entryElement;
    detailsElement;
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                .entry {
                    border: 1px solid #ddd;
                    padding: 10px;
                    margin: 10px 0;
                    border-radius: 5px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .details {
                    display: none;
                    padding: 10px;
                    background-color: #f9f9f9;
                }
                .expand {
                    cursor: pointer;
                    transform: rotate(90deg);
                    transition: transform 0.3s;
                }
                .expanded .expand {
                    transform: rotate(0deg);
                }
            </style>
            <div class="entry">
                <div>
                    <span class="site-name"></span> (<a class="site-url" href="#" target="_blank"></a>) - <span class="username"></span>
                </div>
                <div class="expand">&#9654;</div>
            </div>
            <div class="details">
                <p><strong>Password:</strong> <span class="password"></span></p>
                <p><strong>Notes:</strong> <span class="notes"></span></p>
                <p><strong>Created At:</strong> <span class="created-at"></span></p>
            </div>
        `;
        this.shadow.appendChild(template.content.cloneNode(true));
        this.expandIcon = this.shadow.querySelector('.expand');
        this.entryElement = this.shadow.querySelector('.entry');
        this.detailsElement = this.shadow.querySelector('.details');
        this.expandIcon.addEventListener('click', () => this.toggleDetails());
    }
    toggleDetails() {
        this.entryElement.classList.toggle('expanded');
        const isExpanded = this.entryElement.classList.contains('expanded');
        this.detailsElement.style.display = isExpanded ? 'block' : 'none';
    }
    set data(data) {
        const siteNameElem = this.shadow.querySelector('.site-name');
        const siteURLElem = this.shadow.querySelector('.site-url');
        const usernameElem = this.shadow.querySelector('.username');
        const passwordElem = this.shadow.querySelector('.password');
        const notesElem = this.shadow.querySelector('.notes');
        const createdAtElem = this.shadow.querySelector('.created-at');
        siteNameElem.textContent = data.SiteName;
        siteURLElem.href = data.SiteURL;
        siteURLElem.textContent = data.SiteURL;
        usernameElem.textContent = data.Username;
        passwordElem.textContent = data.Password;
        notesElem.textContent = data.Notes;
        createdAtElem.textContent = data.CreatedAt.toLocaleDateString();
    }
}
customElements.define('password-entry', PasswordEntry);
