
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



    function copyToClipboard(e) {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val($(e.currentTarget).data('link')).select();
        document.execCommand("copy");
        $temp.remove();
        $(e.currentTarget).addClass('copied')
        $(e.currentTarget).find('done').removeClass('none')
        setTimeout(() => $(e.currentTarget).removeClass('copied'), 500);
    }



    $('.toggle-menu').on('click', (e) => $('#mobile-menu ul').toggleClass('active'))
    $('.wrapper').on('click', (e) => $('#mobile-menu ul').removeClass('active'))

    $('.pop-up_container_form').on('click', (e) => e.stopPropagation())
    $('.close-message').on('click', (e) => $('.user-message').remove())


    $(window).on('resize', checkWindowSize)

    $("#dashboard-menu-icon").on('click', toggleDashboardMenu);

    $('.copylink').on('click', copyToClipboard)

    $('.open-form').on('click', openForm)
    $('.close-form').on('click', closeForm)

    $('.pop-up_container').on('click', closeForm)
})




