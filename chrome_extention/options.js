// Saves options to chrome.storage
const saveOptions = () => {
    const urlGet1 = document.getElementById('urlGet1').value;
    const urlGet2 = document.getElementById('urlGet2').value;
    const urlPost = document.getElementById('urlPost').value;
    const key = document.getElementById('api-key').value;
    const secret = document.getElementById('api-secret').value;
  
    chrome.storage.sync.set(
      {urlGet1: urlGet1, urlGet2: urlGet2, urlPost: urlPost, apiKey: key, apiSecret: secret},
      () => {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
          status.textContent = '';
        }, 750);
      }
    );
  };
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  const restoreOptions = () => {
    chrome.storage.sync.get(
      ["urlGet1", "urlGet2", "urlPost", "apiKey", "apiSecret"],
      (items) => {
        document.getElementById('urlGet1').value = items.urlGet1;
        document.getElementById('urlGet2').value = items.urlGet2;
        document.getElementById('urlPost').value = items.urlPost;
        document.getElementById('api-key').value = items.apiKey;
        document.getElementById('api-secret').value = items.apiSecret;
      }
    );
  };
  
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('save').addEventListener('click', saveOptions);