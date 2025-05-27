// Variables globales
let canvas = document.getElementById('editor-canvas');
let ctx = canvas.getContext('2d');
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let brushColor = '#000000';
let brushSize = 5;
let mode = 'draw';
let coverImage = new Image();
coverImage.src = 'medioak/PORTADA4-5/zuretzat.jpg'; // Replace with your initial cover image path

coverImage.onload = () => {
    drawBackground();
    redrawTexts();
};
let textPositions = [];

//Oscurecer fondo a medida que se baje//
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollFraction = Math.min(scrollTop / docHeight, 1);
  const maxOpacity = 0.6;
  const overlay = document.getElementById('background-overlay');
  if (overlay) {
    overlay.style.opacity = scrollFraction * maxOpacity;
  } else {
    console.warn('background-overlay element not found');
  }
});

// Dimensionar el canvas correctamente
function resizeCanvas() {
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate aspect ratio of the cover image
    const imgAspectRatio = coverImage.naturalWidth / coverImage.naturalHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let newWidth, newHeight;

    if (containerAspectRatio > imgAspectRatio) {
        // Container is wider than image aspect ratio
        newHeight = containerHeight;
        newWidth = newHeight * imgAspectRatio;
    } else {
        // Container is narrower or equal to image aspect ratio
        newWidth = containerWidth;
        newHeight = newWidth / imgAspectRatio;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    // Adjust canvas CSS size to match container size for layout
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    // Redibuja el fondo después de redimensionar
    drawBackground();
    redrawTexts();
}

// Inicializar el canvas
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// Dibujar fondo del canvas
function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (coverImage.complete && coverImage.naturalWidth !== 0) {
        ctx.drawImage(coverImage, 0, 0, canvas.width, canvas.height);
    }
    }

// Redibujar textos guardados
function redrawTexts() {
    textPositions.forEach(textObj => {
        // Use 'Inter' font with medium weight for the text
        ctx.font = `500 ${textObj.size}px Inter, sans-serif`;
        ctx.textAlign = textObj.align;

        // Use the color stored in the text object
        ctx.fillStyle = textObj.color || 'black';

        ctx.fillText(textObj.text, textObj.x, textObj.y);
    });
}

// Evento de selección de portada
document.querySelectorAll('.cover-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelector('.cover-option.selected').classList.remove('selected');
        this.classList.add('selected');

        const bgImage = getComputedStyle(this).backgroundImage;
        const imageUrl = bgImage.slice(5, -2); // Extract URL from 'url("...")'

        coverImage.src = imageUrl;
        coverImage.onload = () => {
        drawBackground();
        redrawTexts();
        };
    });
});

// Eventos de dibujo
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function startDrawing(e) {
    if (mode !== 'draw') return;
    
    isDrawing = true;
    [lastX, lastY] = [
        e.clientX - canvas.getBoundingClientRect().left,
        e.clientY - canvas.getBoundingClientRect().top
    ];
}

function draw(e) {
    if (!isDrawing || mode !== 'draw') return;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    
    [lastX, lastY] = [
        e.clientX - canvas.getBoundingClientRect().left,
        e.clientY - canvas.getBoundingClientRect().top
    ];
    
    ctx.lineTo(lastX, lastY);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

// Color picker
document.getElementById('color-picker').addEventListener('input', function(e) {
    brushColor = e.target.value;
    // Update color of current text object if in text mode and dragging
    if (mode === 'text' && currentTextObj) {
        currentTextObj.color = brushColor;
        drawBackground();
        redrawTexts();
    }
});

// Brush size
document.getElementById('brush-size').addEventListener('input', function(e) {
    brushSize = e.target.value;
});

// Clear button
document.getElementById('clear-btn').addEventListener('click', function() {
    drawBackground();
    textPositions = [];
});

// Draw mode
document.getElementById('draw-btn').addEventListener('click', function() {
    mode = 'draw';
    this.classList.add('active');
    document.getElementById('text-btn').classList.remove('active');
    
    // Hide text modal if visible
    document.getElementById('add-text-modal').style.display = 'none';
});

// Text mode
document.getElementById('text-btn').addEventListener('click', function() {
    mode = 'text';
    this.classList.add('active');
    document.getElementById('draw-btn').classList.remove('active');
    
    document.getElementById('add-text-modal').style.display = 'flex';
});

// Text modal events
document.getElementById('cancel-text-btn').addEventListener('click', function() {
    document.getElementById('add-text-modal').style.display = 'none';
    mode = 'draw';
    document.getElementById('draw-btn').classList.add('active');
    document.getElementById('text-btn').classList.remove('active');
});

// Variable para almacenar la posición del texto durante la creación
let textDragging = false;
let currentTextObj = null;

document.getElementById('confirm-text-btn').addEventListener('click', function() {
    const text = document.getElementById('text-input').value.trim();
    if (text) {
        // Posición inicial en el centro
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        
        // Crear objeto de texto
        currentTextObj = {
            text: text,
            x: x,
            y: y,
            color: brushColor,
            size: 16,
            align: 'center',
            isDragging: false
        };
        
        // Dibujar el texto
        ctx.font = `500 ${currentTextObj.size}px Inter, sans-serif`;
        ctx.fillStyle = currentTextObj.color;
        ctx.textAlign = currentTextObj.align;
        ctx.fillText(currentTextObj.text, currentTextObj.x, currentTextObj.y);
        
        // Guardar posición del texto
        textPositions.push(currentTextObj);
        
        // Mostrar instrucciones
        alert('Ahora puedes arrastrar el texto para posicionarlo. Usa la rueda del ratón para cambiar el tamaño.');
        
        // Cambiar a modo de arrastrar texto
        textDragging = true;
        
        // Limpiar input
        document.getElementById('text-input').value = '';
    }
    
    document.getElementById('add-text-modal').style.display = 'none';
});

// Evento para arrastrar el texto
canvas.addEventListener('mousedown', function(e) {
    if (textDragging) {
        currentTextObj.isDragging = true;
        [lastX, lastY] = [
            e.clientX - canvas.getBoundingClientRect().left,
            e.clientY - canvas.getBoundingClientRect().top
        ];
    }
});

canvas.addEventListener('mousemove', function(e) {
    if (textDragging && currentTextObj.isDragging) {
        const mouseX = e.clientX - canvas.getBoundingClientRect().left;
        const mouseY = e.clientY - canvas.getBoundingClientRect().top;
        
        // Actualizar posición
        currentTextObj.x = mouseX;
        currentTextObj.y = mouseY;
        
        // Redibujar
        drawBackground();
        redrawTexts();
    }
});

canvas.addEventListener('mouseup', function() {
    if (textDragging && currentTextObj.isDragging) {
        currentTextObj.isDragging = false;
        textDragging = false;
        mode = 'draw';
        document.getElementById('draw-btn').classList.add('active');
        document.getElementById('text-btn').classList.remove('active');
    }
});

// Cambiar tamaño del texto con la rueda del ratón
canvas.addEventListener('wheel', function(e) {
    if (textDragging) {
        e.preventDefault();
        
        // Ajustar tamaño (aumentar o disminuir según dirección)
        if (e.deltaY < 0) {
            currentTextObj.size += 2;
        } else {
            currentTextObj.size = Math.max(8, currentTextObj.size - 2);
        }
        
        // Redibujar
        drawBackground();
        redrawTexts();
    }
});

// Save button
document.getElementById('save-btn').addEventListener('click', function() {
    const link = document.createElement('a');
    link.download = 'mirotz-azala.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// Send button
document.getElementById('send-btn').addEventListener('click', function() {
    alert('Eskerrik asko zure sorkuntzagatik! Taldeak laster jasoko du.');
    // Aquí iría la lógica para enviar la imagen al grupo
});

// Hamburger menu toggle
const hamburger = document.querySelector('.hamburger');
const menuList = document.getElementById('menu-list');
const closeMenuBtn = document.getElementById('close-menu-btn');

hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true' || false;
    hamburger.setAttribute('aria-expanded', !expanded);
    menuList.classList.toggle('open');
});

closeMenuBtn.addEventListener('click', () => {
    menuList.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
});

// Smooth scrolling for menu links
document.querySelectorAll('.menu-list a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSelector = link.getAttribute('href');
        let targetElement;
        if (targetSelector.startsWith('#')) {
            targetElement = document.querySelector(targetSelector);
        } else if (targetSelector.startsWith('.')) {
            targetElement = document.querySelector(targetSelector);
        }
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
        // Close menu on mobile after click
        if (menuList.classList.contains('open')) {
            menuList.classList.remove('open');
            hamburger.setAttribute('aria-expanded', false);
        }
    });
});

// Inicialización
drawBackground();

// Add dark overlay on background images for better contrast
window.addEventListener('DOMContentLoaded', () => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '-1';
    document.body.insertBefore(overlay, document.body.firstChild);
});
