# Instalando as dependências
No CMD ou terminal do VS Code, vá para a pasta `codigo` e rode o comando:

```shell
npm install
```

Caso o comando `npm` não funcione, é provável que ele não esteja instalado no computador. Instale aqui: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

Se tudo der certo, uma pasta chamada `node_modules` aparecerá.

# Como rodar o servidor?

É mais fácil fazer essa parte no terminal do VS Code. Para abrir o terminal, use o atalho `ctrl + '`.

Com as dependêcias instaladas, ainda na pasta `codigo`, rode o comando no terminal:

```shell
npm start
```

Se tudo der certo, é para aparecer algo parecido com isso no terminal:

```plaintext
Index:
http://localhost:3000/
```

Esse é o link para o servidor local.

## Atenção

Caso você abra o link e não apareça a página desejada, há duas formas de resolver:
 
1. Renomear a página html para `index.html`. Isso faz com que ela seja a página inicial do site. <b>Depois de finalizar o desenvolvimento, renomeie o arquivo para o nome original</b>

2. Abrir o link `http://localhost:3000/nome-da-pagina.html`, onde nomeDaPagina é o nome da sua página

# Como parar o servidor?

Foque no terminal e use o atalho `ctrl + c`. Se tudo der certo, aparecerá um prompt parecido com esse no terminal:

```plaintext
Deseja finalizar o arquivo em lotes (S/N)?
```

Digite `s` para finalizar.