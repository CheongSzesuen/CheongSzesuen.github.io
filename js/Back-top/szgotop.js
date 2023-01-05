$(function() {
    $(window).scroll(function() {
            var scroHei = $(window).scrollTop();
            if (scroHei > 500) {
               $('.back-to-top').css('top','-200px');
               // $('.back-to-top').fadeIn();
            } else {                                                
                $('.back-to-top').css('top','-999px');
                // $('.back-to-top').fadeOut();
            }
        })
    $('.back-to-top').click(function() {
        $('body,html').animate({
            scrollTop: 0
        }, 600);
    })
})

