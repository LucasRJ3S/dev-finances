/* Open and Close Modal */
const Modal = {
  open(transactionId = "") {
    const form = document.querySelector(".modal-overlay");
    form.classList.add("active");

    if (transactionId) {
      transactionId = Number(transactionId);
      const [transaction] = Transaction.all.filter((transaction) => {
        return transaction.id == transactionId;
      });
      Form.setValues(
        transaction.description,
        transaction.amount / 100,
        Utils.formatStringDateToDate(transaction.date),
        transaction.id
      );
    }
  },
  close() {
    const form = document.querySelector(".modal-overlay");
    form.classList.remove("active");
  },
};

/* Storage data in LocalStorage */
const StorageTransactions = {
  storageKey: "dev.finances:transactions",
  get() {
    return JSON.parse(localStorage.getItem(StorageTransactions.storageKey)) || [];
  },
  set(transactions) {
    localStorage.setItem(StorageTransactions.storageKey, JSON.stringify(transactions));
  },
};

/* Global values */

const Transaction = {
  all: StorageTransactions.get(),

  //adicionar transações
  add(transaction) {
    const index = Transaction.all.findIndex((item, index) => {
      return item.id == transaction.id;
    });
    if (index > -1) {
      Transaction.all.splice(index, 1, transaction);
    } else {
      Transaction.all.push(transaction);
    }
    App.reload();
  },
  //removendo transações
  remove(transactionId) {
    const index = Transaction.all.findIndex((transaction, index) => {
      return transaction.id == transactionId;
    });

    Transaction.all.splice(index, 1);
    App.reload();
  },
  //pegar entradas
  incomes() {
    let income = 0;

    Transaction.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });

    return income;
  },
  //pegar gastos
  expenses() {
    let expense = 0;

    Transaction.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    });
    return expense;
  },
  //somando gastos e entradas
  total() {
    return Transaction.incomes() + Transaction.expenses();
  },
};

/* Form data */
const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),
  id: document.querySelector("input#id"),

  getValues() {
    return {
      id: Form.id.value,
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },
  setValues(description, amount, date, id) {
    Form.description.value = description;
    Form.amount.value = amount;
    Form.date.value = date;
    Form.id.value = id;
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
    let { id, description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);
    date = Utils.formatDateToStringDate(date);
    description = description.trim();

    if (id) {
      id = Number(id);
    } else {
      id = Number(new Date().getTime());
    }
    return {
      id,
      description,
      amount,
      date,
    };
  },

  clearFields() {
    Form.setValues("", "", new Date().toISOString().substr(0, 10), "");

    /* Form.description.value = "";
      Form.amount.value = "";
      Form.date.value = ""; */
  },

  submit(event) {
    event.preventDefault();
    try {
      Form.validadeFields();
      const transaction = Form.formatValues();
      Transaction.add(transaction);
      Form.clearFields();
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
  cancel() {
    Form.clearFields();
    Modal.close();
  },
};

/*  Show transactions in javascript */
const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
        <td class="description">${transaction.description}</td>
        <td class="${transaction.amount > 0 ? "income" : "expense"}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <ion-icon name="create-outline" onClick="Modal.open(${transaction.id})" class="edit-icon" ></ion-icon>
        </td>
        <td>
           <img class="remove-icon" onclick="Transaction.remove(${
             transaction.id
           })" src="/assets/minus.svg" title="Remover transação" />
        </td>
        
    
    `;

    return html;
  },

  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(Transaction.incomes());

    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(Transaction.expenses());

    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(Transaction.total());
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

/* Utils */
const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return `${signal} ${value}`;
  },
  formatAmount(value) {
    /* value = Number(value.replace(/\,\./g, "")) * 100 */
    value = value * 100;

    return Math.round(value);
  },
  formatDateToStringDate(date) {
    const splittedDate = date.split("-");
    return splittedDate[2] + "/" + splittedDate[1] + "/" + splittedDate[0];
  },
  formatStringDateToDate(stringDate) {
    const splittedDate = stringDate.split("/");
    return `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`;
  },
};

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);
    DOM.updateBalance();
    Form.clearFields();
    StorageTransactions.set(Transaction.all);
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

/* Init Application */
App.init();

/* Change Theme */

const html = document.querySelector("html");
const checkbox = document.querySelector("input[name=theme]");

const getStyle = (element, style) => window.getComputedStyle(element).getPropertyValue(style);

const initialColors = {
  bg: getStyle(html, "--bg"),
  bgPanel: getStyle(html, "--bg-panel"),
  colorHeadings: getStyle(html, "--color-headings"),
  colorNavbar: getStyle(html, "--color-navbar"),
  colorText: getStyle(html, "--color-text"),
};

const darkMode = {
  bg: "#1c1b1b",
  bgPanel: "#000000",
  colorHeadings: "#000000",
  colorNavbar: "#4723D9",
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

/* Show NavBar */

const showMenu = (toggleId, navbarId, bodyId) => {
  const toggle = document.getElementById(toggleId),
    navbar = document.getElementById(navbarId),
    bodypadding = document.getElementById(bodyId);

  if (toggle && navbar) {
    toggle.addEventListener("click", () => {
      navbar.classList.toggle("expander");

      bodypadding.classList.toggle("body-pd");
    });
  }
};

showMenu("nav-toggle", "navbar", "body-pd");

/* ativa links do navbar com clique */

const linkColor = document.querySelectorAll(".nav__link");
function colorLink() {
  linkColor.forEach((l) => l.classList.remove("active"));
  this.classList.add("active");
}

linkColor.forEach((l) => l.addEventListener("click", colorLink));

/* collapse menu */

const linkCollapse = document.getElementsByClassName("collapse__link");
console.log(linkCollapse);
var i;

for (i = 0; i < linkCollapse.length; i++) {
  linkCollapse[i].addEventListener("click", function () {
    const collapseMenu = this.nextElementSibling;
    collapseMenu.classList.toggle("showCollapse");

    const rotate = collapseMenu.previousElementSibling;
    rotate.classList.toggle("rotate");
  });
}
