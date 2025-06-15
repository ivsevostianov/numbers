const CONFIG = {
    PROXY_URLS: [
      'https://api.allorigins.win/raw?url=http://numbersapi.com',
      'https://cors-anywhere.herokuapp.com/http://numbersapi.com',
      'https://api.codetabs.com/v1/proxy?quest=http://numbersapi.com'
    ],
    ELEMENTS: {
      number: 'number',
      numberFact: 'number-fact',
      newNumber: 'new-number',
      dateFact: 'date-fact'
    }
  };
  
  class NumbersApiService {
    static async fetchWithFallback(endpoint) {
      let lastError;
      
      for (let i = 0; i < CONFIG.PROXY_URLS.length; i++) {
        try {
          const url = `${CONFIG.PROXY_URLS[i]}/${endpoint}`;
          console.log(`Trying proxy ${i + 1}: ${CONFIG.PROXY_URLS[i]}`);
          
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const text = await response.text();
          console.log(`Success with proxy ${i + 1}`);
          return text;
        } catch (error) {
          console.warn(`Proxy ${i + 1} failed:`, error.message);
          lastError = error;
          
          // If it's the last proxy, throw the error
          if (i === CONFIG.PROXY_URLS.length - 1) {
            throw new Error(`All proxies failed. Last error: ${lastError.message}`);
          }
        }
      }
    }

    static getFact(number) {
      return this.fetchWithFallback(`${number}/trivia`);
    }
  
    static getRandomFact() {
      return this.fetchWithFallback('random/trivia');
    }
  
    static getDateFact(month, day) {
      return this.fetchWithFallback(`${month}/${day}/date`);
    }
  }
  
  class UIHandler {
    static updateElement(elementId, content) {
      const element = document.getElementById(elementId);
      if (element) {
        element.innerText = content;
      }
    }
  
    static showError(elementId, message = 'An error occurred. Please try again.') {
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = `
          <div class="bg-red-500 bg-opacity-50 p-4 rounded-md">
            <p class="text-white">${message}</p>
            <button onclick="window.location.reload()" 
                    class="mt-2 bg-white text-red-500 px-4 py-1 rounded">
              Retry
            </button>
          </div>
        `;
      }
    }
  
    static getInputValue(elementId) {
      return document.getElementById(elementId)?.value;
    }
  
    static validateDateNumber(number) {
      const parsed = parseInt(number, 10);
      return parsed >= 1 && parsed <= 31 ? parsed : null;
    }
  
    static formatDate(dayNumber) {
      const date = new Date(2020, 0);
      date.setDate(dayNumber);
      return {
        month: date.getMonth() + 1,
        day: date.getDate()
      };
    }
  
    static showLoading(elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.innerText = 'Loading...';
      }
    }
  }
  
  class PageController {
    static handleNumberFact(number) {
      UIHandler.showLoading(CONFIG.ELEMENTS.numberFact);
      NumbersApiService.getFact(number)
        .then((fact) => {
          UIHandler.updateElement(CONFIG.ELEMENTS.number, number);
          UIHandler.updateElement(CONFIG.ELEMENTS.numberFact, fact);
        })
        .catch((err) => {
          console.error(err);
          UIHandler.showError(CONFIG.ELEMENTS.numberFact);
        });
    }
  
    static handleRandomFact() {
      UIHandler.showLoading('number-fact');
      NumbersApiService.getRandomFact()
        .then((fact) => {
          const numberMatch = fact.match(/\d+/);
          const number = numberMatch ? numberMatch[0] : 'Unknown';
  
          UIHandler.updateElement('number', number);
          UIHandler.updateElement('number-fact', fact);
        })
        .catch((err) => {
          console.error(err);
          UIHandler.showError('number-fact');
        });
    }
  
    static handleDateFact(number) {
      const validNumber = UIHandler.validateDateNumber(number);
      if (!validNumber) {
        alert('Please enter a number between 1 and 31.');
        return;
      }
  
      UIHandler.showLoading(CONFIG.ELEMENTS.dateFact);
      const { month, day } = UIHandler.formatDate(validNumber);
      NumbersApiService.getDateFact(month, day)
        .then((fact) => {
          UIHandler.updateElement(CONFIG.ELEMENTS.dateFact, fact);
        })
        .catch((err) => {
          console.error(err);
          UIHandler.showError(CONFIG.ELEMENTS.dateFact);
        });
    }
  }
  
  class EventHandler {
    static setupEventListeners() {
      const currentPath = window.location.pathname;
  
      if (currentPath.endsWith('index.html') || currentPath.endsWith('/')) {
        this.setupButton('fetchFact', () => {
          const number = UIHandler.getInputValue('number');
          if (number) {
            window.location.href = `result.html?number=${number}`;
          } else {
            alert('Please enter a number.');
          }
        });
  

  
        this.setupButton('dateBtn', () => {
          window.location.href = 'date.html';
        });
      }
      else if (currentPath.includes('result.html')) {
        this.setupButton('fetchNewFact', () => {
          const number = UIHandler.getInputValue('new-number');
          if (number) {
            PageController.handleNumberFact(number);
          } else {
            alert('Please enter a number.');
          }
        });
      }
      else if (currentPath.includes('date.html')) {
        this.setupButton('fetchNumberFact', () => {
          const number = UIHandler.getInputValue('number');
          if (number) {
            PageController.handleDateFact(number);
          } else {
            alert('Please enter a number.');
          }
        });
      }
    }
  
    static setupButton(id, callback) {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener('click', callback);
        console.log(`Event listener added to button: ${id}`);
      } else {
        console.warn(`Button with id '${id}' not found`);
        // Try again after a short delay
        setTimeout(() => {
          const retryButton = document.getElementById(id);
          if (retryButton) {
            retryButton.addEventListener('click', callback);
            console.log(`Event listener added to button (retry): ${id}`);
          }
        }, 100);
      }
    }
  }
  
  // Initialize when DOM is ready
  function initializeApp() {
    console.log('Initializing app...');
    EventHandler.setupEventListeners();
  
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('result.html')) {
      const params = new URLSearchParams(window.location.search);
      const number = params.get('number');
      
      if (number) {
        PageController.handleNumberFact(number);
      } else {
        UIHandler.updateElement(CONFIG.ELEMENTS.number, 'Error');
        UIHandler.updateElement(CONFIG.ELEMENTS.numberFact, 'No number provided.');
      }
    }
  }

  // Try multiple initialization methods to ensure it works
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    // DOM is already loaded
    initializeApp();
  }
  
  // Fallback initialization
  window.addEventListener('load', () => {
    if (!document.getElementById('fetchRandomFact')?.onclick) {
      console.log('Fallback initialization...');
      initializeApp();
    }
  });
  