let ul = document.querySelector('nav .ul');
let menuIcon = document.querySelector('nav .menu-icon');
let closeIcon = document.querySelector('nav .close-icon');

function openMenu(){
    ul.classList.add('open');
}

function closeMenu(){
    ul.classList.remove('open');
}

menuIcon.onclick = openMenu;
closeIcon.onclick = closeMenu;

// Pega o modal
var modal = document.getElementById("myModal");

// Pega o botão que abre o modal
var btn = document.getElementById("botaoPopUP");

// Pega o elemento <span> que fecha o modal
var span = document.getElementsByClassName("close")[0];

// Quando o usuário clicar no botão, abre o modal
btn.onclick = function(event) {
    event.preventDefault(); // Previne a ação padrão do link
    modal.style.display = "block";
}

// Quando o usuário clicar em <span> (x), fecha o modal
span.onclick = function() {
    modal.style.display = "none";
}

// Quando o usuário clicar fora do modal, fecha o modal
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}