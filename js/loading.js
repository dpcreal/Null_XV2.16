// ==========================================
// loading.js - Optimized & Bulletproof
// ==========================================

function changeLoadingTip() {
    const tips = [
        'Play New Games!',
        'Loading....',
        'Currently loading',
        'Adding new games!',
        'Check out the car race!',
        'Press Ctrl + Click for secrets'
    ];
    const element = document.querySelector('.loading-tip');
    if (element) {
        element.textContent = 'Loading... \n' + tips[Math.floor(Math.random() * tips.length)];
    }
}

// 1. Initial State: Hide content, show loader
changeLoadingTip();
$('#everything-else').hide();
$('.games, .proxy, .settings, .cloaklaunch').hide();

let changeTip = setInterval(changeLoadingTip, 3000);

// 2. Game List Initialization
// Assumes 'json' variable is provided by config.js
if (typeof json !== 'undefined') {
    let games = json['games'];
    let gamesList = $('#gamesList');

    for (let game in games) {
        gamesList.append(
            `<li url="games/${games[game]['path']}" ${
                games[game]['aliases'] ? 'aliases="' + games[game]['aliases'].join(',') + '"' : ''
            }>${game} <span class="star">★</span> </li>`
        );
    }
} else {
    console.error("Config JSON not found. Check if config.js is loaded correctly.");
}

// 3. Star Logic (Fixed Filter Bug)
let starredGamesList = JSON.parse(localStorage.getItem('starredGamesList')) || [];

$(document).on('click', '.star', function (event) {
    event.preventDefault();
    event.stopPropagation();
    
    const star = $(this);
    const gameItem = star.parent();
    const gameName = gameItem.text().replace('★', '').trim();
    
    star.toggleClass('filled');

    if (starredGamesList.includes(gameName)) {
        // FIXED: name !== gameName (previously it deleted everything)
        starredGamesList = starredGamesList.filter((name) => name !== gameName);
    } else {
        starredGamesList.unshift(gameName);
    }

    localStorage.setItem('starredGamesList', JSON.stringify(starredGamesList));
    updateGameList();
});

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

// Run once on start
updateGameList();

// 4. Game Launch Logic
$('#gamesList').on('click', 'li', function (e) {
    if ($(e.target).hasClass('star')) return; // Don't launch if clicking star

    let url = $(this).attr('url');
    if (window.location.protocol === 'file:' && !url.includes('.html')) {
        url = url.endsWith('/') ? url + 'index.html' : url + '/index.html';
    }

    $('#everything-else').fadeOut(300);
    $('#page-loader').fadeIn(300);
    $('#page-loader iframe').attr('src', url).focus();
});

// 5. THE LOADER KILLER (The part that keeps you from being stuck)
$(window).on('load', () => {
    console.log("Assets loaded. Finalizing UI...");
    
    clearInterval(changeTip);

    // Fade out the loader and reveal the site
    // We use a timeout to ensure p5.js and other bg scripts have room to breathe
    setTimeout(() => {
        $('.loading, #page-loader').fadeOut(400, function() {
            $('#everything-else').fadeIn(500);
            console.log("Site Ready.");
        });
    }, 500);
});

// Emergency Fallback: If window load doesn't fire for some reason, 
// force show the site after 5 seconds
setTimeout(() => {
    if ($('#everything-else').is(':hidden')) {
        console.warn("Load event took too long. Force-showing site.");
        $('.loading, #page-loader').hide();
        $('#everything-else').show();
    }
}, 5000);

// 6. Custom jQuery Extensions
jQuery.fn.extend({
    showModal: function () {
        return this.each(function () {
            if (this.tagName === 'DIALOG') {
                this.showModal();
            }
        });
    },
});
