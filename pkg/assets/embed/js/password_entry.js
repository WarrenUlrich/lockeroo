"use strict";class PasswordEntry extends HTMLElement{shadow;expandIcon;entryElement;detailsElement;constructor(){super(),this.shadow=this.attachShadow({mode:"open"});const e=document.createElement("template");e.innerHTML=`
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
        `,this.shadow.appendChild(e.content.cloneNode(!0)),this.expandIcon=this.shadow.querySelector(".expand"),this.entryElement=this.shadow.querySelector(".entry"),this.detailsElement=this.shadow.querySelector(".details"),this.expandIcon.addEventListener("click",()=>this.toggleDetails())}toggleDetails(){this.entryElement.classList.toggle("expanded");const e=this.entryElement.classList.contains("expanded");this.detailsElement.style.display=e?"block":"none"}set data(e){const s=this.shadow.querySelector(".site-name"),t=this.shadow.querySelector(".site-url"),n=this.shadow.querySelector(".username"),a=this.shadow.querySelector(".password"),o=this.shadow.querySelector(".notes"),r=this.shadow.querySelector(".created-at");s.textContent=e.SiteName,t.href=e.SiteURL,t.textContent=e.SiteURL,n.textContent=e.Username,a.textContent=e.Password,o.textContent=e.Notes,r.textContent=e.CreatedAt.toLocaleDateString()}}customElements.define("password-entry",PasswordEntry);
