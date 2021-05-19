
/*jslint browser: true*/

/*global console, alert, $, jQuery*/
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

    function openForm(e) {
        $('#create_form').removeClass('none')
        setTimeout(() => $('.pop-up_container_form').addClass('animate_form'), 100);
    }
    function closeForm() {
        $('.pop-up_container_form').removeClass('animate_form')
        setTimeout(() => $('#create_form').addClass('none'), 100);
    }



    $('.pop-up_container_form').on('click', (e) => e.stopPropagation())



    $(window).on('resize', checkWindowSize)
    $("#dashboard-menu-icon").on('click', toggleDashboardMenu);

    $('body').on('click', '.open-form', openForm)
    
    $('.pop-up_container').on('click', closeForm)
    $('.close-form').on('click', closeForm)
})