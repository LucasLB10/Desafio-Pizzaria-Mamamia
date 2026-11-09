const pizzas = [
  {
    id: 1,
    nome: "Margherita",
    descricao: "Molho de tomate, muçarela, tomate e manjericão.",
    preco: 39.90,
    imagem: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=600"
  },
  {
    id: 2,
    nome: "Calabresa",
    descricao: "Muçarela, calabresa fatiada e cebola.",
    preco: 42.90,
    imagem: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600"
  },
  {
    id: 3,
    nome: "Quatro Queijos",
    descricao: "Muçarela, parmesão, provolone e gorgonzola.",
    preco: 46.90,
    imagem: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600"
  },
  {
    id: 4,
    nome: "Frango com Catupiry",
    descricao: "Frango desfiado, catupiry e muçarela.",
    preco: 45.90,
    imagem: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600"
  },
  {
    id: 5,
    nome: "Portuguesa",
    descricao: "Presunto, ovo, cebola, ervilha e muçarela.",
    preco: 44.90,
    imagem: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600"
  },
  {
    id: 6,
    nome: "Chocolate",
    descricao: "Chocolate ao leite e confeitos.",
    preco: 41.90,
    imagem: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600"
  }
];

let carrinho = [];

const formatarMoeda = valor => valor.toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function renderizarCardapio() {
  const lista = document.querySelector("#lista-pizzas");

  lista.innerHTML = pizzas.map(pizza => `
    <article class="pizza">
      <img
        class="foto-pizza"
        src="${pizza.imagem}"
        alt="Pizza ${pizza.nome}"
        loading="lazy"
      >
      <h3>${pizza.nome}</h3>
      <p>${pizza.descricao}</p>
      <div class="linha-pizza">
        <span class="preco">${formatarMoeda(pizza.preco)}</span>
        <button class="adicionar" type="button" data-id="${pizza.id}">Adicionar +</button>
      </div>
    </article>
  `).join("");

  lista.addEventListener("click", evento => {
    const botao = evento.target.closest("button[data-id]");
    if (!botao) return;
    adicionarAoCarrinho(Number(botao.dataset.id));
  });
}

function adicionarAoCarrinho(id) {
  const pizza = pizzas.find(item => item.id === id);
  const item = carrinho.find(item => item.id === id);

  if (item) item.quantidade += 1;
  else carrinho.push({ ...pizza, quantidade: 1 });

  renderizarCarrinho();
}

function alterarQuantidade(id, variacao) {
  const item = carrinho.find(produto => produto.id === id);
  if (!item) return;

  item.quantidade += variacao;

  if (item.quantidade <= 0) {
    carrinho = carrinho.filter(produto => produto.id !== id);
  }

  renderizarCarrinho();
}

function renderizarCarrinho() {
  const container = document.querySelector("#itens-carrinho");
  const quantidadeTotal = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
  const valorTotal = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);

  document.querySelector("#contador").textContent = quantidadeTotal;
  document.querySelector("#total").textContent = formatarMoeda(valorTotal);

  if (carrinho.length === 0) {
    container.innerHTML = '<p class="vazio">Seu carrinho está vazio.</p>';
    return;
  }

  container.innerHTML = carrinho.map(item => `
    <div class="item-carrinho">
      <div>
        <strong>${item.nome}</strong><br>
        <small>${item.quantidade} × ${formatarMoeda(item.preco)}</small>
      </div>
      <div>
        <strong>${formatarMoeda(item.preco * item.quantidade)}</strong><br>
        <button type="button" data-diminuir="${item.id}" aria-label="Diminuir ${item.nome}">−</button>
        <button type="button" data-aumentar="${item.id}" aria-label="Aumentar ${item.nome}">+</button>
      </div>
    </div>
  `).join("");
}

document.querySelector("#itens-carrinho").addEventListener("click", evento => {
  const diminuir = evento.target.closest("[data-diminuir]");
  const aumentar = evento.target.closest("[data-aumentar]");

  if (diminuir) alterarQuantidade(Number(diminuir.dataset.diminuir), -1);
  if (aumentar) alterarQuantidade(Number(aumentar.dataset.aumentar), 1);
});

document.querySelector("#form-pedido").addEventListener("submit", evento => {
  evento.preventDefault();

  const mensagem = document.querySelector("#mensagem");

  if (carrinho.length === 0) {
    mensagem.textContent = "Adicione pelo menos uma pizza antes de enviar o pedido.";
    return;
  }

  const dados = new FormData(evento.currentTarget);

  const pedido = {
    numero: Date.now(),
    cliente: String(dados.get("nome")).trim(),
    telefone: String(dados.get("telefone")).trim(),
    endereco: String(dados.get("endereco")).trim(),
    observacoes: String(dados.get("observacoes")).trim(),
    itens: carrinho.map(({ id, nome, quantidade, preco }) => ({
      id, nome, quantidade, preco
    })),
    total: carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0),
    criadoEm: new Date().toISOString(),
    status: "Recebido"
  };

  const pedidosSalvos = JSON.parse(localStorage.getItem("mammaMiaPedidos") || "[]");
  pedidosSalvos.push(pedido);
  localStorage.setItem("mammaMiaPedidos", JSON.stringify(pedidosSalvos));

  mensagem.textContent = `Pedido de demonstração nº ${pedido.numero.toString().slice(-6)} salvo neste navegador!`;

  evento.currentTarget.reset();
  carrinho = [];
  renderizarCarrinho();
});

renderizarCardapio();
renderizarCarrinho();
