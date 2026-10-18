$('.nav1 .nLi').mouseenter(function(){
    $(this).children('.nav-cont').stop().animate({'height': 'toggle'},300);
    $(this).children('.nav-cont').find('span').stop().animate({'top': '-9x'},300);
    $(this).children('.nav-cont').find('p').stop().animate({'width':200},160,'linear')
})

$('.nav1 .nLi').mouseleave(function(){
    $(this).children('.nav-cont').stop().animate({'height': 'toggle'},300);
    $(this).children('.nav-cont span').find('span').stop().animate({'top': '0x'},300);
    $(this).children('.nav-cont').find('p').stop().animate({'width':5},160,'linear')
})

setTimeout(function(){
    $("#app_btn").click(function(){
        $("#app_btn").toggleClass("on");
        $("#app_header").toggleClass("on");
    });
    $("#app_nav>ul>li i").click(function(){
        $(this).parent().find(".app_nav_sub").slideToggle();
        $(this).parent().toggleClass("on");
        $(this).parent().siblings().find(".app_nav_sub").slideUp();
        $(this).parent().siblings().removeClass("on");
    })
},1600);

$(function(){
    $('.TRS_Editor img').each(function(){
        $(this).parents('p').css({textIndent:0})
    })
})
