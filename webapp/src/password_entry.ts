interface SavedPassword {
    SiteName: string;
    SiteURL: string;
    Username: string;
    Password: string;
    Notes: string;
    CreatedAt: Date;
}

class PasswordEntry extends HTMLElement {
    private shadow: ShadowRoot;
    private entryElement: HTMLElement;
    private detailsElement: HTMLElement;

    constructor() {
        super();
        // Attach a shadow DOM to this element
        this.shadow = this.attachShadow({ mode: 'open' });

        // Define the template for the password entry
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
                    cursor: pointer; /* Make the whole entry clickable */
                }
                .details {
                    display: none;
                    padding: 10px;
                    background-color: #f9f9f9;
                }
                .expand {
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

        // Append the template to the shadow DOM
        this.shadow.appendChild(template.content.cloneNode(true));

        // Cache elements
        this.entryElement = this.shadow.querySelector('.entry') as HTMLElement;
        this.detailsElement = this.shadow.querySelector('.details') as HTMLElement;

        // Attach an event listener to toggle the details visibility
        this.entryElement.addEventListener('click', () => this.toggleDetails());
    }

    /**
     * Toggle the visibility of the password details
     */
    private toggleDetails(): void {
        // Toggle the 'expanded' class on the entry element
        this.entryElement.classList.toggle('expanded');

        // Toggle the display of the details element
        const isExpanded = this.entryElement.classList.contains('expanded');
        this.detailsElement.style.display = isExpanded ? 'block' : 'none';
    }

    /**
     * Set the saved password data using the provided data
     * @param data - The saved password entry data
     */
    set data(data: SavedPassword) {
        // Cache the DOM elements for the fields to display
        const siteNameElem = this.shadow.querySelector('.site-name') as HTMLElement;
        const siteURLElem = this.shadow.querySelector('.site-url') as HTMLAnchorElement;
        const usernameElem = this.shadow.querySelector('.username') as HTMLElement;
        const passwordElem = this.shadow.querySelector('.password') as HTMLElement;
        const notesElem = this.shadow.querySelector('.notes') as HTMLElement;
        const createdAtElem = this.shadow.querySelector('.created-at') as HTMLElement;

        // Populate the elements with the data provided
        siteNameElem.textContent = data.SiteName;
        siteURLElem.href = data.SiteURL;
        siteURLElem.textContent = data.SiteURL;
        usernameElem.textContent = data.Username;
        passwordElem.textContent = data.Password;
        notesElem.textContent = data.Notes;

        // Format the CreatedAt date to a readable string
        createdAtElem.textContent = data.CreatedAt.toLocaleDateString();
    }
}

// Register the custom element as 'password-entry'
customElements.define('password-entry', PasswordEntry);
