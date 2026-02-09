(function () {
    var canvas = document.getElementById('gridCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var mouseX = -1000, mouseY = -1000;
    var gridSpacing = 30;
    var dotRadius = 1.5;
    var influenceRadius = 150;
    var maxDisplacement = 20;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('mouseleave', function () {
        mouseX = -1000;
        mouseY = -1000;
    });

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var cols = Math.ceil(canvas.width / gridSpacing) + 1;
        var rows = Math.ceil(canvas.height / gridSpacing) + 1;

        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                var x = i * gridSpacing;
                var y = j * gridSpacing;

                var dx = x - mouseX;
                var dy = y - mouseY;
                var distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < influenceRadius && distance > 0) {
                    var force = (1 - distance / influenceRadius) * maxDisplacement;
                    x += (dx / distance) * force;
                    y += (dy / distance) * force;
                }

                var opacity = 0.25;
                if (distance < influenceRadius) {
                    opacity = 0.25 + (1 - distance / influenceRadius) * 1;
                }

                ctx.beginPath();
                ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(59, 130, 246, ' + opacity + ')';
                ctx.fill();
            }
        }
        requestAnimationFrame(drawGrid);
    }
    drawGrid();
})();
