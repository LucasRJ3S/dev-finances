//No javascript precisamos organizar nossas ideias do que fazer primeiro, e comenta-las por exemplo para depois tentar passar isso para o codigo, estamos praticamente traduzindo nossas ideias para o codigo

//Abrir e fechar o Modal - Se der tente fazer uma função só toogle
const Modal = {
   open() {
      //Abrir modal

      //Adicionar a class active ao model
      document.querySelector(".modal-overlay").classList.add("active");
   },
   close() {
      //fechar o modal
      //remover a class active do modal
      document.querySelector(".modal-overlay").classList.remove("active");
   },
};

//guardar as informações no localStorage do navegador, pra quando atualizar os dados não serem perdidos , lembrar de guardar a troca de tema também
const Storage = {
   get() {
      //parse vai transformar de string para objeto ou array
      return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
   },
   set(transactions) {
      //primeiro propiedade é nome que vc quer da chave, e o segundo é o valor que vc quer guardar no local storage, os valores no local storage é guardado como string, precisamos transformar um array para string.
      localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
   },
};

//Eu preciso somar as entradas e depois eu preciso somar as saidas e remover das entradas o valor das saidas assim, eu terei o total dos dois

const Transaction = {
   all: Storage.get(),

   //adicionar transações
   add(transaction) {
      Transaction.all.push(transaction);

      App.reload();
   },
   //removendo transações
   remove(index) {
      Transaction.all.splice(index, 1);

      App.reload();
   },

   incomes() {
      let income = 0;
      //pegar todas as transacoes
      //para cada transacao
      Transaction.all.forEach((transaction) => {
         //se ela for maior que zero
         if (transaction.amount > 0) {
            //somar a uma variavel e retornar a variavel
            //income = income + transaction.amount
            income += transaction.amount;
         }
      });

      return income;
   },
   expenses() {
      let expense = 0;
      //pegar todas as transacoes
      //para cada transacao
      Transaction.all.forEach((transaction) => {
         //se ela for menor que zero
         if (transaction.amount < 0) {
            //somar a uma variavel e retornar a variavel
            //expense = expense + transaction.amount
            expense += transaction.amount;
         }
      });
      return expense;
   },
   total() {
      return Transaction.incomes() + Transaction.expenses();
   },
};

//Substituir os dados do HTML com os dados do JS
//aqui é onde o js vai trabalhar com o html DOM

const DOM = {
   //adicionando os dados pelo js no HTML no tbody
   transactionsContainer: document.querySelector("#data-table tbody"),
   addTransaction(transaction, index) {
      const tr = document.createElement("tr");
      tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
      tr.dataset.index = index;

      //adicionando os dados pelo js no HTML no tbody
      DOM.transactionsContainer.appendChild(tr);
   },
   innerHTMLTransaction(transaction, index) {
      //verificando se a transaction é maior que 0, se for maior é entrada, se não é despesas.
      const CSSclass = transaction.amount > 0 ? "income" : "expense";
      //
      const amount = Utils.formatCurrency(transaction.amount);
      const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
          <img onclick="Transaction.remove(${index})" src="../assets/minus.svg" alt="Remover transação" />
        </td>
    
    `;
      //return html - com isso podemos usar a variavel html fora desse escopo
      return html;
   },

   //pegando entradas e saidas da aplicação para ir mudando na tela
   updateBalance() {
      document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(Transaction.incomes());

      document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(Transaction.expenses());

      document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(Transaction.total());
   },

   clearTransactions() {
      DOM.transactionsContainer.innerHTML = "";
   },
};

//numeros formatados como moeda Brasileira
const Utils = {
   formatAmount(value) {
      /* value = Number(value.replace(/\,\./g, "")) * 100 */
      value = value * 100;

      return Math.round(value);
   },
   formatDate(date) {
      const splittedDate = date.split("-");
      return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
   },
   formatCurrency(value) {
      const signal = Number(value) < 0 ? "-" : "";

      value = String(value).replace(/\D/g, "");

      value = Number(value) / 100;

      value = value.toLocaleString("pt-BR", {
         style: "currency",
         currency: "BRL",
      });

      return signal + value;
   },
};

//button submit do modal
const Form = {
   //conectando os inputs do html no js, para fazer a validação do form
   description: document.querySelector("input#description"),
   amount: document.querySelector("input#amount"),
   date: document.querySelector("input#date"),

   //pegando valores dos inputs para guardar eles, acima está pegando a tag(elemento) inteiro
   getValues() {
      return {
         description: Form.description.value,
         amount: Form.amount.value,
         date: Form.date.value,
      };
   },

   validadeFields() {
      //desestruturando o objeto
      const { description, amount, date } = Form.getValues();
      //se um dos inputs estiver vazio , mostre um erro
      if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
         throw new Error("Por favor, preencha todos os campos");
      }
   },

   formatValues() {
      let { description, amount, date } = Form.getValues();

      amount = Utils.formatAmount(amount);

      date = Utils.formatDate(date);

      return {
         description,
         amount,
         date,
      };
   },

   saveTransaction(transaction) {},
   clearFields() {
      Form.description.value = "";
      Form.amount.value = "";
      Form.date.value = "";
   },

   submit(event) {
      //não enviar o formulario na url da pagina com preventDefault
      event.preventDefault();

      //qualquer erro que for disparado pelo throw o try catch vai mostrar o erro
      try {
         //verificar se os campos são validos
         Form.validadeFields();
         //formatar os dados para salvar
         const transaction = Form.formatValues();
         //salvar - adicionar transactions
         Transaction.add(transaction);
         //apagar os dados do formulario
         Form.clearFields();
         //modal feche
         Modal.close();
         //Atualizar a aplicação - não precisamos por aqui o app reload() porque já tem na const Transaction
         //App.reload()
      } catch (error) {
         //aqui vai aparecer uma caixa de alerta no navegador pedindo para preencher os campos do formulario
         alert(error.message);
      }

      //verificar se todas informações foram preenchidas
   },
};

const App = {
   //copulou - 2 / copulou a DOM novamente 5
   init() {
      //para cada elemento execute uma funcionalidade - está adicionando cada  transaçãos de forma automatica no HTMLs
      Transaction.all.forEach(DOM.addTransaction);
      DOM.updateBalance();
      Storage.set(Transaction.all);
   },
   //reiniciou - 4
   reload() {
      DOM.clearTransactions();
      App.init();
   },
};

// iniciando a aplicação - 1
App.init();

// array de objetos da tabela de transactions
//array do Transaction substituido pelo Storage para os dados ficarem salvos
/* all:[
	{
		description: "Luz",
		amount: -50010,
		date: "23/01/2021",
	},
	{
		description: "Website",
		amount: 500000,
		date: "23/01/2021",
	},
	{
		description: "Internet",
		amount: -20012,
		date: "23/01/2021",
	},
	{
		description: "App",
		amount: 200000,
		date: "23/01/2021",
	},
], */

//Change Theme

const html = document.querySelector("html");
const checkbox = document.querySelector("input[name=theme]");

const getStyle = (element, style) => window.getComputedStyle(element).getPropertyValue(style);

const initialColors = {
   bg: getStyle(html, "--bg"),
   bgPanel: getStyle(html, "--bg-panel"),
   colorHeadings: getStyle(html, "--color-headings"),
   colorText: getStyle(html, "--color-text"),
};

const darkMode = {
   bg: "#333333",
   bgPanel: "#000000",
   colorHeadings: "#363d41",
   colorText: "#FCFCFC",
};

const transformKey = (key) => "--" + key.replace(/([A-Z])/, "-$1").toLowerCase();

const changeColors = (colors) => {
   Object.keys(colors).map((key) => {
      html.style.setProperty(transformKey(key), colors[key]);
   });
};

checkbox.addEventListener("change", ({ target }) => {
   target.checked ? changeColors(darkMode) : changeColors(initialColors);
});

//Salvando no localStorage o template
