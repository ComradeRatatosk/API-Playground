chrome.storage.sync.get(
  ["urlGet1", "urlGet2", "urlPost", "apiKey", "apiSecret"],
  (items) => {
    localStorage.clear();
    localStorage.setItem("urlGet1", items.urlGet1);
    localStorage.setItem("urlGet2", items.urlGet2);
    localStorage.setItem("urlPost", items.urlPost);
    localStorage.setItem("apiKey", items.apiKey);
    localStorage.setItem("apiSecret", items.apiSecret);
  }
);
  
async function getData(url = "") {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "api-key": localStorage.getItem("apiKey"),
      "api-secret": localStorage.getItem("apiSecret")
    },
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

// Container for content
const personateSection = document.createElement("div");
personateSection.setAttribute("id", "personate");

const regex3 = /[^\/]+/g;
var username;

// Update content acccoring on api and href type(is user logged in)
function update() {
  if (window.location.href.match(regex3)[2] == 'in') {
    username = window.location.href.endsWith('/') ? window.location.href.match(regex3)[3] : window.location.href.split('?')[0].match(regex3)[3];
    
    getData(`${localStorage.getItem("urlGet1")}${username}`).then((data) => {
      var xhr = new XMLHttpRequest();
      
      xhr.open('GET', `${localStorage.getItem("urlGet2")}${data.id}/preview`);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'blob';
      xhr.setRequestHeader("api-key", localStorage.getItem("apiKey"));
      xhr.setRequestHeader("api-secret", localStorage.getItem("apiSecret"));
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) { // This persone is in api databese
            var data_url = URL.createObjectURL(this.response);
            personateSection.innerHTML = window.location.href.endsWith('/') ? `<section class="artdeco-card" style="padding: 2rem; margin-bottom: 1rem"><h3>Personate</h3><iframe src="${data_url}"></iframe></section>` : `<h3>Personate</h3><iframe src="${data_url}"></iframe>`;
          } else { // This persone doesn't exist in api databese
            const fname = document.getElementsByTagName('h1')[0].textContent.trim().split(' ')[0];
            const lname = document.getElementsByTagName('h1')[0].textContent.trim().split(' ').length > 1 ? document.getElementsByTagName('h1')[0].textContent.trim().slice(document.getElementsByTagName('h1')[0].textContent.trim().split(' ')[0].length) : document.getElementsByTagName('h1')[0].textContent.trim().split(' ')[0];

            personateSection.innerHTML = window.location.href.endsWith('/') ? `<section class="artdeco-card" style="padding: 2rem; margin-bottom: 1rem">
            <h3>Personate</h3>
            <p>użytkownik ${fname} ${lname} nie istnieje</p>
            <label>Podaj email<input id="email" type="text"></label>
            <button id="addButton" class="artdeco-button artdeco-button--2 artdeco-button--primary" type="button" style="margin-top: 1rem;">
              <li-icon aria-hidden="true" type="connect" class="artdeco-button__icon" size="small"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" data-supported-dps="16x16" fill="currentColor" class="mercado-match" width="16" height="16" focusable="false">
              <path d="M9 4a3 3 0 11-3-3 3 3 0 013 3zM6.75 8h-1.5A2.25 2.25 0 003 10.25V15h6v-4.75A2.25 2.25 0 006.75 8zM13 8V6h-1v2h-2v1h2v2h1V9h2V8z"></path>
              </svg></li-icon>
              <span class="artdeco-button__text">Dodaj do Personate</span>
            </button><p id="information"></p></section>` : 
            `<h3>Personate</h3>
            <p>użytkownik ${fname} ${lname} nie istnieje</p>
            <label>Podaj email<br><input id="email" type="text" style="border: solid 1px black"></label>
            <button id="addButton" class="btn-sm btn-primary" type="button" style="margin: 1rem 0;">Dodaj do Personate</button><p id="information"></p>`;

            // Get email
            const emailIframe = document.createElement('iframe');
            emailIframe.src = document.getElementById('top-card-text-details-contact-info');
            emailIframe.style.display = 'none';
            document.getElementsByTagName('main')[0].insertBefore(emailIframe, document.getElementsByTagName('main')[0].firstChild);
            var email;
            emailIframe.onload = () => {
              email = (emailIframe.contentDocument) ? emailIframe.contentDocument : emailIframe.contentWindow.document;
              email = email.getElementsByClassName('ci-email')[0];
              email = email.getElementsByTagName('a')[0].textContent.trim();
              document.getElementById('email').value = email;
            };

            // Add person to api database
            document.getElementById("addButton").addEventListener("click", async function() {
              const response = await fetch(localStorage.getItem("urlPost"), {
                method: 'POST',
                body: JSON.stringify({
                  "data": {
                    "firstName": fname,
                    "lastName": lname,
                    "email": document.getElementById('email').value,
                    "linkedin": decodeURI(window.location.href),
                    }
                }),
                headers: {
                  "Content-Type": "application/json",
                  "api-key": localStorage.getItem("apiKey"),
                  "api-secret": localStorage.getItem("apiSecret"),
                },
              });
              update();
            });
          }
        }
      }
      const place = window.location.href.endsWith('/') ? document.getElementsByTagName('aside')[0] : document.getElementsByClassName('right-rail')[0];
      place.insertBefore(personateSection,place.firstChild);
    });
  }
}

// Update on reload
if (window.location.href.match(regex3).pop() != 'contact-info') {
  update();
}

// Update on link change
const observeUrlChange = () => {
  let oldHref = document.location.href;
  const body = document.querySelector("body");
  const observer = new MutationObserver(mutations => {
    if (oldHref !== document.location.href) {
      oldHref = document.location.href;
      // Update
      if (window.location.href.match(regex3).pop() != 'contact-info') {
        update();
      }
    }
  });
  observer.observe(body, { childList: true, subtree: true });
};

window.onload = observeUrlChange;