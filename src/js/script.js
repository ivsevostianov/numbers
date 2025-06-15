const CONFIG = {
    API_BASE_URL: 'https://api.allorigins.win/raw?url=http://numbersapi.com',
    ELEMENTS: {
      number: 'number',
      numberFact: 'number-fact',
      newNumber: 'new-number',
      dateFact: 'date-fact'
    }
  };
  
  class NumbersApiService {
    static getFact(number) {
      const url = `${CONFIG.API_BASE_URL}/${number}/trivia`;
      return fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
          }
          return response.text();
        });
    }
  
    static getRandomFact() {
      const url = `${CONFIG.API_BASE_URL}/random/trivia`;
      return fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
          }
          return response.text();
        });
    }
  
    static getDateFact(month, day) {
      const url = `${CONFIG.API_BASE_URL}/${month}/${day}/date`;
      return fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
          }
          return response.text();
        });
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
  
        this.setupButton('randomBtn', () => {
          window.location.href = 'random.html';
        });
  
        this.setupButton('dateBtn', () => {
          window.location.href = 'date.html';
        });
      } 
      else if (currentPath.includes('random.html')) {
        this.setupButton('fetchRandomFact', () => {
          PageController.handleRandomFact();
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
      }
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    EventHandler.setupEventListeners();
  
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('random.html')) {
      PageController.handleRandomFact();
    } else if (currentPath.includes('result.html')) {
      const params = new URLSearchParams(window.location.search);
      const number = params.get('number');
      
      if (number) {
        PageController.handleNumberFact(number);
      } else {
        UIHandler.updateElement(CONFIG.ELEMENTS.number, 'Error');
        UIHandler.updateElement(CONFIG.ELEMENTS.numberFact, 'No number provided.');
      }
    }
  });
  