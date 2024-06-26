window.onload = function() {
    // Seleciona os elementos necessários
    const popup = document.getElementById('popup');
    const fecharPopup = document.getElementById('fechar-popup');
    const textoPopup = document.getElementById('texto-popup');
    const pesquisaSugestoes = document.getElementById('pesquisa-sugestoes');
    const mostrarAdicionarSugestaoButton = document.getElementById('mostrar-adicionar-sugestao');
    const adicionarSugestaoButton = document.getElementById('adicionar-sugestao');
    const nomeSugestao = document.getElementById('nome-sugestao');
    const adicionarPopup = document.getElementById('popup-adicionar');
    const fecharAdicionarPopupButton = document.getElementById('fechar-popup-adicionar');
    const listaSugestoes = document.getElementById('lista-sugestoes');

    // Função para mostrar o popup com a sugestão selecionada
    function mostrarPopup(texto) {
        textoPopup.textContent = `Você selecionou a sugestão: ${texto}`;
        popup.style.display = 'block';
    }

    // Função para adicionar uma sugestão ao DOM
    function adicionarSugestaoAoDOM(texto) {
        const novaSugestao = document.createElement('li');
        novaSugestao.textContent = texto;
        novaSugestao.classList.add('sugestao');
        listaSugestoes.appendChild(novaSugestao);
    }

    // Evento de clique para fechar o popup
    fecharPopup.addEventListener('click', function() {
        popup.style.display = 'none';
    });

    // Evento de input para filtrar sugestões
    pesquisaSugestoes.addEventListener('input', function() {
        const filtro = this.value.toLowerCase();
        const sugestoes = document.querySelectorAll('.sugestao');
        sugestoes.forEach(function(sugestao) {
            const nome = sugestao.textContent.toLowerCase();
            sugestao.style.display = nome.includes(filtro) ? '' : 'none';
        });
    });

    // Evento de clique para mostrar o formulário de adicionar sugestão
    mostrarAdicionarSugestaoButton.addEventListener('click', function() {
        adicionarPopup.style.display = 'block';
    });

    // Evento de clique para fechar o popup de adicionar sugestão
    fecharAdicionarPopupButton.addEventListener('click', function() {
        adicionarPopup.style.display = 'none';
    });

    // Evento de clique para adicionar uma nova sugestão
    adicionarSugestaoButton.addEventListener('click', function() {
        const sugestao = nomeSugestao.value;
        if (sugestao) {
            adicionarSugestaoAoDOM(sugestao);
            salvarSugestao(sugestao);
            nomeSugestao.value = '';
            adicionarPopup.style.display = 'none';
        }
    });

    // Delegação de eventos para sugestões
    listaSugestoes.addEventListener('click', function(event) {
        if (event.target.classList.contains('sugestao')) {
            mostrarPopup(event.target.textContent);
        }
    });

    // Função para salvar sugestão no LocalStorage
    function salvarSugestao(texto) {
        const sugestoes = JSON.parse(localStorage.getItem('sugestoes')) || [];
        sugestoes.push(texto);
        localStorage.setItem('sugestoes', JSON.stringify(sugestoes));
    }

    // Função para carregar sugestões do LocalStorage
    function carregarSugestoes() {
        const sugestoes = JSON.parse(localStorage.getItem('sugestoes')) || [];
        sugestoes.forEach(adicionarSugestaoAoDOM);
    }

    // Carrega as sugestões ao iniciar
    carregarSugestoes();

    // Função para mostrar campo de resposta
    function mostrarCampoResposta(event) {
        const campoResposta = document.createElement('input');
        campoResposta.type = 'text';
        campoResposta.placeholder = 'Digite sua resposta aqui...';

        const botaoEnviar = document.createElement('button');
        botaoEnviar.textContent = 'Enviar';
        botaoEnviar.addEventListener('click', function() {
            const resposta = document.createElement('p');
            resposta.textContent = campoResposta.value;
            event.target.parentNode.appendChild(resposta);

            event.target.parentNode.removeChild(campoResposta);
            event.target.parentNode.removeChild(botaoEnviar);
        });

        event.target.parentNode.appendChild(campoResposta);
        event.target.parentNode.appendChild(botaoEnviar);
    }

    // Incluir botão de resposta nas sugestões
    listaSugestoes.addEventListener('click', function(event) {
        if (event.target.tagName === 'LI') {
            const botaoResposta = document.createElement('button');
            botaoResposta.textContent = 'Responder';
            botaoResposta.addEventListener('click', mostrarCampoResposta);
            event.target.appendChild(botaoResposta);
        }
    });
};
