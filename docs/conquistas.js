window.onload = function() {
    // Seleciona todos os elementos com a classe 'conquista'
    var conquistas = document.querySelectorAll('.conquista');

    // Seleciona o pop-up, o botão de fechar, o botão de esconder, a caixa de pesquisa e o formulário de adicionar
    var popup = document.getElementById('popup');
    var fecharPopup = document.getElementById('fechar-popup');
    var textoPopup = document.getElementById('texto-popup');
    var esconderConquistas = document.getElementById('esconder-conquistas');
    var mostrarConquistas = document.getElementById('mostrar-conquistas');
    var pesquisaConquistas = document.getElementById('pesquisa-conquistas');
    var adicionarConquista = document.getElementById('adicionar-conquista');
    var nomeConquista = document.getElementById('nome-conquista');

    // Carrega as conquistas clicadas do localStorage
    var conquistasClicadas = JSON.parse(localStorage.getItem('conquistasClicadas')) || [];

    // Função para adicionar eventos de clique a uma conquista
    function adicionarEventosConquista(conquista, index) {
        // Se a conquista foi clicada, a destaca
        if (conquistasClicadas.includes(index)) {
            conquista.classList.add('destaque');
        }

        conquista.addEventListener('click', function() {
            // Atualiza o texto do pop-up e o mostra
            textoPopup.textContent = this.textContent;
            popup.style.display = 'block';

            // Adiciona a conquista à lista de conquistas clicadas e salva no localStorage
            conquistasClicadas.push(index);
            localStorage.setItem('conquistasClicadas', JSON.stringify(conquistasClicadas));

            // Adiciona a classe 'destaque' à conquista
            this.classList.add('destaque');
        });
    }

    // Adiciona um evento de clique a cada conquista
    conquistas.forEach(adicionarEventosConquista);

    // Adiciona um evento de clique ao botão de fechar para esconder o pop-up
    fecharPopup.addEventListener('click', function() {
        popup.style.display = 'none';
    });

    // Adiciona um evento de clique ao botão de esconder para esconder as conquistas clicadas
    esconderConquistas.addEventListener('click', function() {
        conquistasClicadas.forEach(function(index) {
            conquistas[index].style.display = 'none';
        });
        // Atualiza o texto do popup
        textoPopup.textContent = 'Conquistas escondidas!';
        // Mostra o popup
        popup.style.display = 'block';
    });

    // Adiciona um evento de clique ao botão de mostrar para mostrar as conquistas clicadas
    mostrarConquistas.addEventListener('click', function() {
        conquistasClicadas.forEach(function(index) {
            conquistas[index].style.display = 'block';
        });
        // Atualiza o texto do popup
        textoPopup.textContent = 'Conquistas mostradas!';
        // Mostra o popup
        popup.style.display = 'block';
    });

    // Adiciona um evento de input à caixa de pesquisa para filtrar as conquistas
    pesquisaConquistas.addEventListener('input', function() {
        var filtro = this.value.toLowerCase();
        conquistas.forEach(function(conquista) {
            var nome = conquista.textContent.toLowerCase();
            conquista.style.display = nome.includes(filtro) ? '' : 'none';
        });
    });

    // Adiciona um evento de submit ao formulário de adicionar para adicionar uma nova conquista
    adicionarConquista.addEventListener('submit', function(event) {
        event.preventDefault();
        var novaConquista = document.createElement('div');
        novaConquista.textContent = nomeConquista.value;
        novaConquista.classList.add('conquista');
        document.querySelector('main').appendChild(novaConquista);
        nomeConquista.value = '';
        adicionarEventosConquista(novaConquista, conquistas.length);
        conquistas = document.querySelectorAll('.conquista');
    });
};
