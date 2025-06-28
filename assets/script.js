// Game state
let cookies = 0;
let cookiesPerSecond = 0;
let lastUpdate = Date.now();

// Upgrade data
const upgrades = {
    cursor: {
        name: 'Cursor',
        baseCost: 15,
        baseCPS: 0.1,
        owned: 0,
        cost: 15
    },
    grandma: {
        name: 'Grandma',
        baseCost: 100,
        baseCPS: 1,
        owned: 0,
        cost: 100
    },
    farm: {
        name: 'Farm',
        baseCost: 1100,
        baseCPS: 8,
        owned: 0,
        cost: 1100
    },
    mine: {
        name: 'Mine',
        baseCost: 12000,
        baseCPS: 47,
        owned: 0,
        cost: 12000
    }
};

// DOM elements
const cookieCountElement = document.getElementById('cookie-count');
const cpsElement = document.getElementById('cps');
const cookieButton = document.getElementById('cookiebutton');

// Initialize game
function initGame() {
    updateDisplay();
    setInterval(gameLoop, 100); // Update every 100ms for smooth animation
    loadGame(); // Load saved game if exists
}

// Main game loop
function gameLoop() {
    const now = Date.now();
    const deltaTime = (now - lastUpdate) / 1000; // Convert to seconds
    
    if (deltaTime >= 0.1) { // Update every 100ms
        cookies += cookiesPerSecond * deltaTime;
        lastUpdate = now;
        updateDisplay();
        saveGame();
    }
}

// Update all display elements
function updateDisplay() {
    cookieCountElement.textContent = Math.floor(cookies);
    cpsElement.textContent = cookiesPerSecond.toFixed(1);
    
    // Update upgrade displays
    Object.keys(upgrades).forEach(upgradeKey => {
        const upgrade = upgrades[upgradeKey];
        const costElement = document.getElementById(`${upgradeKey}-cost`);
        const ownedElement = document.getElementById(`${upgradeKey}-owned`);
        const buyButton = document.querySelector(`#${upgradeKey}-upgrade .buy-button`);
        
        if (costElement) costElement.textContent = Math.floor(upgrade.cost);
        if (ownedElement) ownedElement.textContent = upgrade.owned;
        
        // Enable/disable buy button based on affordability
        if (buyButton) {
            if (cookies >= upgrade.cost) {
                buyButton.disabled = false;
                buyButton.textContent = 'Buy';
            } else {
                buyButton.disabled = true;
                buyButton.textContent = 'Too Expensive';
            }
        }
    });
}

// Cookie click function
function clickCookie() {
    cookies += 1;
    updateDisplay();
    saveGame();
    
    // Visual feedback
    cookieButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        cookieButton.style.transform = 'scale(1)';
    }, 100);
}

// Buy upgrade function
function buyUpgrade(upgradeKey) {
    const upgrade = upgrades[upgradeKey];
    
    if (cookies >= upgrade.cost) {
        cookies -= upgrade.cost;
        upgrade.owned += 1;
        
        // Increase cost for next purchase (15% increase)
        upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.owned));
        
        // Recalculate cookies per second
        calculateCPS();
        
        updateDisplay();
        saveGame();
        
        // Visual feedback
        const buyButton = document.querySelector(`#${upgradeKey}-upgrade .buy-button`);
        if (buyButton) {
            buyButton.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
            setTimeout(() => {
                buyButton.style.background = '';
            }, 200);
        }
        
        // Show purchase notification
        showNotification(`Bought ${upgrade.name}! +${upgrade.baseCPS} CPS`);
    }
}

// Calculate total cookies per second
function calculateCPS() {
    cookiesPerSecond = 0;
    Object.values(upgrades).forEach(upgrade => {
        cookiesPerSecond += upgrade.baseCPS * upgrade.owned;
    });
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Save game to localStorage
function saveGame() {
    const gameData = {
        cookies: cookies,
        cookiesPerSecond: cookiesPerSecond,
        upgrades: upgrades,
        lastSave: Date.now()
    };
    localStorage.setItem('cookieClickerSave', JSON.stringify(gameData));
}

// Load game from localStorage
function loadGame() {
    const savedGame = localStorage.getItem('cookieClickerSave');
    if (savedGame) {
        try {
            const gameData = JSON.parse(savedGame);
            cookies = gameData.cookies || 0;
            cookiesPerSecond = gameData.cookiesPerSecond || 0;
            
            // Load upgrades
            if (gameData.upgrades) {
                Object.keys(gameData.upgrades).forEach(key => {
                    if (upgrades[key]) {
                        upgrades[key].owned = gameData.upgrades[key].owned || 0;
                        upgrades[key].cost = gameData.upgrades[key].cost || upgrades[key].baseCost;
                    }
                });
            }
            
            calculateCPS();
            updateDisplay();
            
            // Show welcome back message
            const timeSinceLastSave = Date.now() - (gameData.lastSave || Date.now());
            const hoursSinceLastSave = timeSinceLastSave / (1000 * 60 * 60);
            
            if (hoursSinceLastSave > 0.1) { // More than 6 minutes
                const offlineCookies = cookiesPerSecond * hoursSinceLastSave;
                cookies += offlineCookies;
                showNotification(`Welcome back! You earned ${Math.floor(offlineCookies)} cookies while away!`);
            }
            
        } catch (error) {
            console.error('Error loading saved game:', error);
        }
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Event listeners
cookieButton.addEventListener('click', clickCookie);

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initGame);

// Auto-save every 30 seconds
setInterval(saveGame, 30000);

// Save before page unload
window.addEventListener('beforeunload', saveGame);
