(function () {
    document.querySelectorAll('.deer-roster').forEach(function (roster) {
        var strip = roster.querySelector('.dm-strip');
        function move(direction) {
            var cards = strip.querySelectorAll('.dm-card');
            if (cards.length < 2) return;
            var step = cards[1].offsetLeft - cards[0].offsetLeft;
            var end = strip.scrollWidth - strip.clientWidth;
            var target = strip.scrollLeft + direction * step;
            if (direction > 0 && strip.scrollLeft >= end - 2) target = 0;
            if (direction < 0 && strip.scrollLeft <= 2) target = end;
            strip.scrollTo({left: Math.max(0, Math.min(end, target)), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
        }
        roster.querySelector('.dm-prev').addEventListener('click', function () { move(-1); });
        roster.querySelector('.dm-next').addEventListener('click', function () { move(1); });
    });
})();
