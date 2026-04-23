// --- 1. LOADING TIPS LOGIC ---
function changeLoadingTip() {
    const tips = [
        'Play New Games!',
        'Loading....',
        'All hail Trump',
        "Please gift me keys",
        'Currently loading',
        'Adding new games!',
    ];
    const element = document.getElementsByClassName('loading-tip')[0];
    if (element) {
        element.textContent = 'Loading... \n' + tips[Math.floor(Math.random() * tips.length)];
    }
}

changeLoadingTip();
let changeTip = setInterval(changeLoadingTip, 3000);

// --- 2. THE "WAITER" & GAME LIST LOGIC ---
// This replaces the old "Dual Run" crash-prone code
function initSite() {
    // Check if the 'json' variable from config.js is actually here yet
    if (typeof json === 'undefined' || !json.games) {
        console.log("Waiting for config.js data...");
        setTimeout(initSite, 50); // Check again in 50ms
        return;
    }

    const games = json['games'];
    const gamesList = $('#gamesList');
    
    // Build the list
    for (let game in games) {
        gamesList.append(
            `<li url="games/${games[game]['path']}" ${
                games[game]['aliases'] ? 'aliases="' + games[game]['aliases'].join(',') + '"' : ''
            }>${game} <span class="star">★</span> </li>`
        );
    }

    // Initialize Starring system
    setupStars();
    updateGameList();
    setupClickListeners();
    
    // KILL THE LOADER
    clearInterval(changeTip);
    $('.loading').fadeOut({
        duration: 300,
        complete: () => {
            $('#everything-else').fadeIn(500);
        },
    });
}

// --- 3. STARRING & SORTING ---
let starredGamesList = JSON.parse(localStorage.getItem('starredGamesList')) || [];

function setupStars() {
    $(document).on('click', '.star', function (event) {
        event.preventDefault();
        event.stopPropagation();
        $(this).toggleClass('filled');

        const gameItem = $(this).parent();
        const gameName = gameItem.text().replace('★', '').trim();
        const isStarred = starredGamesList.includes(gameName);

        if (isStarred) {
            // FIXED: name !== gameName so it doesn't wipe the whole list
            starredGamesList = starredGamesList.filter((name) => name !== gameName);
        } else {
            starredGamesList.unshift(gameName);
        }

        localStorage.setItem('starredGamesList', JSON.stringify(starredGamesList));
        updateGameList();
    });
}

function updateGameList() {
    const gamesList = document.getElementById('gamesList');
    if (!gamesList) return;
    const children = Array.from(gamesList.children);

    children.forEach((gameItem) => {
        const currentGameName = gameItem.textContent.replace('★', '').trim();
        const star = gameItem.querySelector('.star');

        if (starredGamesList.includes(currentGameName)) {
            if (star) star.classList.add('filled');
            gamesList.insertBefore(gameItem, gamesList.firstChild);
        }
    });
}

// --- 4. NAVIGATION & PROXY ---
function setupClickListeners() {
    $('#gamesList li').on('click', function (e) {
        if ($(e.target).hasClass('star')) return;
        
        let url = $(this).attr('url');
        if (window.location.protocol === 'file:' && !url.includes('.html')) {
            url = url.endsWith('/') ? url + 'index.html' : url + '/index.html';
        }
        
        $('#everything-else').fadeOut();
        $('#page-loader').fadeIn();
        $('#page-loader iframe').attr('src', url).focus();
    });
}

// --- 5. JQUERY EXTENSIONS ---
jQuery.fn.extend({
    showModal: function () {
        return this.each(function () {
            if (this.tagName === 'DIALOG') {
                this.showModal();
            }
        });
    },
});

// --- 6. FPS METER ---
(function () {
    let previousTime = Date.now();
    let frames = 0;
    let refreshRate = 1000;
    let fpsMeter = document.createElement('div');
    fpsMeter.id = 'fpsMeter';
    document.body.appendChild(fpsMeter);

    requestAnimationFrame(function loop() {
        const TIME = Date.now();
        frames++;
        if (TIME > previousTime + refreshRate) {
            let fps = Math.round((frames * refreshRate) / (TIME - previousTime));
            previousTime = TIME;
            frames = 0;
            fpsMeter.innerHTML = 'FPS: ' + fps;
        }
        requestAnimationFrame(loop);
    });

    Object.assign(fpsMeter.style, {
        position: 'fixed', top: '2.5%', right: '1%', zIndex: '10000',
        background: 'rgba(0, 0, 0, 0.5)', padding: '10px', color: 'white',
        fontFamily: 'monospace', fontSize: '24px', pointerEvents: 'none'
    });
})();

// START EVERYTHING
$(document).ready(() => {
    initSite();
});
