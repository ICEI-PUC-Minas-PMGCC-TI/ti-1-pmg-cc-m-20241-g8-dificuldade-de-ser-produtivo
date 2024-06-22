window.onload = function() {
    // Seleciona todos os elementos com a classe 'sugestao'
    var sugestoes = document.querySelectorAll('.sugestao');

    // Seleciona o pop-up, o botão de fechar, a caixa de pesquisa e o formulário de adicionar
    var popup = document.getElementById('popup');
    var fecharPopup = document.getElementById('fechar-popup');
    var textoPopup = document.getElementById('texto-popup');
    var pesquisaSugestoes = document.getElementById('pesquisa-sugestoes');
    var adicionarSugestao = document.getElementById('adicionar-sugestao');
    var nomeSugestao = document.getElementById('nome-sugestao');

    // Função para adicionar eventos de clique a uma sugestão
    function adicionarEventosSugestao(sugestao) {
        sugestao.addEventListener('click', function() {
            // Atualiza o texto do pop-up e o mostra
            textoPopup.textContent = `Você selecionou a sugestão: ${this.textContent}`;
            popup.style.display = 'block';
        });
    }

    // Adiciona um evento de clique a cada sugestão
    sugestoes.forEach(adicionarEventosSugestao);

    // Adiciona um evento de clique ao botão de fechar para esconder o pop-up
    fecharPopup.addEventListener('click', function() {
        popup.style.display = 'none';
    });

    // Adiciona um evento de input à caixa de pesquisa para filtrar as sugestões
    pesquisaSugestoes.addEventListener('input', function() {
        var filtro = this.value.toLowerCase();
        sugestoes.forEach(function(sugestao) {
            var nome = sugestao.textContent.toLowerCase();
            sugestao.style.display = nome.includes(filtro) ? '' : 'none';
        });
    });

    // Adiciona um evento de submit ao formulário de adicionar para adicionar uma nova sugestão
    adicionarSugestao.addEventListener('click', function(event) {
        event.preventDefault();
        var novaSugestao = document.createElement('div');
        novaSugestao.textContent = nomeSugestao.value;
        novaSugestao.classList.add('sugestao');
        document.querySelector('main').appendChild(novaSugestao);
        nomeSugestao.value = '';
        adicionarEventosSugestao(novaSugestao);
        sugestoes = document.querySelectorAll('.sugestao');
    });
};