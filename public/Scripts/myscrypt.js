$(function () {

    $(window).scroll(function(){
    
    var scroll = $(window).scrollTop();
    
    if (scroll >= 400) {
    
    $('#advertisement').hide()
    
    $('#advertisement').show()
    
    }
    
    else{
    
    $('#advertisement').show();
    
    $('#advertisement').hide()
    
    }
    
    });
    
    })
    