
/*jslint browser: true*/

/*global console, alert, $, jQuery*/

// Check if serviceWorker work
// if ("serviceWorker" in navigator) {
//     navigator.serviceWorker
//         .register("../../sw.js")
//         .then(reg => {
//             console.log("Service Worker Registered", reg);
//         })
//         .catch(err => {
//             console.log("Server Worker Not registered", err);
//         });

//     // Add Home Screen Button
//     let deferredPrompt;
//     let btn = document.getElementById('install-btn');
//     window.addEventListener('beforeinstallprompt', e => {
//         console.log(e);
//         e.preventDefault();
//         deferredPrompt = e;
//         console.log(btn);
//         $('#install-btn').removeClass('none');
//     })
//     btn.addEventListener('click', e => {
//         deferredPrompt.prompt()
//         deferredPrompt.userChoice.then(choiceResult => {
//             if (choiceResult === 'accepted') {
//                 console.log('user accepted');

//             }
//         })
//     })

// }




$(document).ready(function () {
    'use strict';
    checkWindowSize()

    function checkWindowSize() {
        const screenWidth = $(window).width()

        if (screenWidth < 1025) {
            $("body").removeClass('opened-menu')
            $("#dashboard-menu").removeClass('shadow');
            setTimeout(() => { $("#dashboard-menu").css({ opacity: 1 }) }, 300);
        } else {
            $("body").addClass('opened-menu')
            $("#dashboard-menu").removeClass('shadow');
        }

    }

    $('body').on('click', '.wrapper', function (e) {
        $("#dashboard-menu").addClass('menu-closed');
        $("#dashboard-menu").removeClass('shadow');
        $("#dashboard-menu").removeClass('show');

    })

    function toggleDashboardMenu(e) {
        e.stopPropagation();
        $('body').toggleClass('opened-menu');
        $("#dashboard-menu").toggleClass('shadow');
        $("#dashboard-menu").toggleClass('show');
    }


    function openmenu(e) {
        e.stopPropagation()
        e.preventDefault()
        // $('.sub-menu').not($(e.target).siblings('ul')).removeClass('activeMenu')
        $(e.target).siblings('ul').toggleClass('activeMenu')
        $('body').on('click', function () { $('.sub-menu').removeClass('activeMenu') })
    }

    // $('.second-level').on('click', function (e) { e.stopPropagation() })
    function openForm(e) {
        const form = $(e.currentTarget).data('form')
        $(`.pop-up_container[data-form=${form}]`).removeClass('none')
        setTimeout(() => $(`.pop-up_container[data-form=${form}]`).find('.pop-up_container_form').addClass('animate_form'), 100);
    }



    function closeForm() {
        console.log('here');
        $('.pop-up_container_form').removeClass('animate_form')
        setTimeout(() => $('.pop-up_container').addClass('none'), 100);
    }


    function closemessage(e) {
        setTimeout(function () { $('.message').animate({ top: '0' }, 100, function () { $(this).remove() }) }, 100);

    }


    $('.pop-up_container_form').on('click', (e) => e.stopPropagation())



    $(window).on('resize', checkWindowSize)
    $(".dashboard-menu-icon").on('click', toggleDashboardMenu);

    $('body').on('click', '.open-form', openForm)
    $('.close-form').on('click', closeForm)

    $('.pop-up_container').on('click', closeForm)


    $('body').on('click', '.sub-menu_btn', openmenu)
    $('body').on('click', '.closemessage', closemessage)


})