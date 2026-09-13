const ITEMS = [
  {
    id: "moonstone",
    name: "Moonstone Bonda",
    img: "assets/moonstone-bonda.jpg",
    price: 49,
    desc: "Chettan says he picked it up himself.",
    tags: ["edible", "space", "questionable"],
  },
  {
    id: "stardust",
    name: "Stardust Pazham Pori",
    img: "assets/stardust-pazham-pori.jpg",
    price: 69,
    desc: "Banana fritter. Sparkly. That’s it.",
    tags: ["edible", "space"],
  },
  {
    id: "saturn",
    name: "Saturn Ring",
    img: "assets/saturn-ring.jpg",
    price: 99,
    desc: "Crispy. Price is the joke.",
    tags: ["edible", "space", "questionable"],
  },
  {
    id: "sunshine",
    name: "Sunshine Tea",
    img: "assets/sunshine-tea.jpg",
    price: 25,
    desc: "Hot. Very hot. Glass also hot.",
    tags: ["edible", "space", "shouldnt"],
  },
  {
    id: "rain",
    name: "Rainwater Soup",
    img: "assets/rainwater-soup.jpg",
    price: 35,
    desc: "Today’s rain. Tomorrow is extra.",
    tags: ["edible", "questionable"],
  },
  {
    id: "melted",
    name: "Melted Ice Cream",
    img: "assets/melted-ice-cream.jpg",
    price: 40,
    desc: "Already melted. Spoon is optional.",
    tags: ["edible", "questionable", "shouldnt"],
  },
  {
    id: "bubble",
    name: "Bubble Tea Without Tea",
    img: "assets/bubble-tea.jpg",
    price: 30,
    desc: "Cup of air. Straw included.",
    tags: ["questionable", "shouldnt"],
  },
  {
    id: "wifi",
    name: "Coconut Wi-Fi",
    img: "assets/coconut-wifi.jpg",
    price: 15,
    desc: "Password is inside. Bring a knife.",
    tags: ["questionable", "shouldnt"],
  },
  {
    id: "ghost",
    name: "Ghost Puffs",
    img: "assets/ghost-puffs.jpg",
    price: 66,
    desc: "Jar looks empty. Chettan insists.",
    tags: ["questionable", "shouldnt"],
  },
  {
    id: "empty",
    name: "Empty Parcel",
    img: "assets/empty-parcel.jpg",
    price: 10,
    desc: "Air. Premium, apparently.",
    tags: ["shouldnt"],
  },
  {
    id: "mystery",
    name: "Mystery Item",
    img: "assets/mystery-item.jpg",
    price: 10,
    desc: "Chettan packed this. That is all.",
    tags: ["questionable", "shouldnt"],
    mystery: true,
  },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "edible", label: "Edible" },
  { id: "questionable", label: "Questionable" },
  { id: "space", label: "From space" },
  { id: "shouldnt", label: "Shouldn’t exist" },
  { id: "chettan", label: "Chettan decide" },
];

const PAY_METHODS = [
  { id: "upi", label: "UPI", img: "assets/pay-upi.jpg", note: "Sent to a coconut. He’ll check later." },
  { id: "cash", label: "Cash", img: "assets/pay-cash.jpg", note: "Small notes. Moon has no change." },
  { id: "card", label: "Credit card", img: "assets/pay-card.jpg", note: "We take cards. No machine though." },
  { id: "bless", label: "Blessings", img: "assets/pay-bless.jpg", note: "Works spiritually. Confuses the accounts." },
  { id: "later", label: "Pay later", img: "assets/pay-later.jpg", note: "Chettan will remember your face." },
];

const TRACK_STEPS = [
  { text: "Order confirmed", caption: "Kettle’s already on." },
  { text: "Chettan is packing it", caption: "Newspaper, string, one extra banana." },
  { text: "Left the shop", caption: "Scooter kick. Goats optional." },
  { text: "Currently on the Moon", caption: "Still on the Moon." },
  { text: "Back on Earth", caption: "Came in through Palakkad." },
  { text: "Delayed. Cow on the road.", caption: "Standard. The cow is not moving." },
  { text: "Delivered", caption: "Here. Contents: see below." },
];

const MYSTERY_RESULTS = [
  "One grain of rice",
  "Half a biscuit",
  "A spoon",
  "A photograph of tea",
  "Another mystery box",
  "Nothing",
];

const ACHIEVEMENTS = [
  { id: "first", title: "First order", copy: "It happened." },
  { id: "five", title: "Five orders", copy: "You came back. Chettan noticed." },
  { id: "spend", title: "₹500 spent", copy: "He knows your name now." },
  { id: "empty", title: "Bought empty parcel", copy: "Respect." },
];

const state = {
  screen: "home",
  filter: "all",
  cart: {},
  payMethod: "upi",
  callCount: 0,
  nagCount: 0,
  paid: false,
  orders: Number(localStorage.getItem("chaya-orders") || 0),
  spent: Number(localStorage.getItem("chaya-spent") || 0),
  unlocked: JSON.parse(localStorage.getItem("chaya-ach") || "[]"),
};

const $ = (id) => document.getElementById(id);

function save() {
  localStorage.setItem("chaya-orders", String(state.orders));
  localStorage.setItem("chaya-spent", String(state.spent));
  localStorage.setItem("chaya-ach", JSON.stringify(state.unlocked));
}

function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add("hidden"), 2600);
}

function modal(msg) {
  $("modal-text").textContent = msg;
  $("modal").classList.remove("hidden");
}

function showScreen(name) {
  state.screen = name;
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.toggle("active", s.id === `screen-${name}`);
    s.hidden = s.id !== `screen-${name}`;
  });
  if (name === "cart") {
    $("bill-scold").classList.add("hidden");
    renderCart();
    clearTimeout(showScreen._bill);
    showScreen._bill = setTimeout(() => {
      if (state.screen === "cart" && cartCount()) $("bill-scold").classList.remove("hidden");
    }, 2800);
  }
  if (name === "payment") renderPayment();
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function cartCount() {
  return Object.values(state.cart).reduce((a, n) => a + n, 0);
}

function subtotal() {
  return Object.entries(state.cart).reduce((sum, [id, qty]) => {
    const item = ITEMS.find((i) => i.id === id);
    return sum + item.price * qty;
  }, 0);
}

function bill() {
  const sub = subtotal();
  const extras = sub
    ? [
        { label: "Delivery", amount: 20 },
        { label: "Moonlight", amount: 12 },
        { label: "Walking charge", amount: 15 },
        { label: "Tea GST", amount: 3.47 },
      ]
    : [];
  const total = +(sub + extras.reduce((a, e) => a + e.amount, 0)).toFixed(2);
  return { sub, extras, total };
}

function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  $("cart-count").textContent = cartCount();
  const item = ITEMS.find((i) => i.id === id);
  toast(`${item.name} in the parcel.`);
}

function removeFromCart(id) {
  if (!state.cart[id]) return;
  state.cart[id] -= 1;
  if (state.cart[id] <= 0) delete state.cart[id];
  $("cart-count").textContent = cartCount();
  renderCart();
}

function filteredItems() {
  if (state.filter === "all") return ITEMS;
  if (state.filter === "chettan") {
    const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    return [pick];
  }
  return ITEMS.filter((i) => i.tags.includes(state.filter));
}

function renderFilters() {
  $("filters").innerHTML = FILTERS.map(
    (f) =>
      `<button type="button" data-filter="${f.id}" class="${state.filter === f.id ? "active" : ""}">${f.label}</button>`
  ).join("");
}

function renderMenu() {
  renderFilters();
  const pick = $("chettan-pick");
  if (state.filter === "chettan") {
    pick.classList.remove("hidden");
    pick.innerHTML = "<strong>Chettan picked this.</strong> Eat it.";
  } else {
    pick.classList.add("hidden");
  }

  $("menu-grid").innerHTML = filteredItems()
    .map((item) => {
      const extra = item.mystery
        ? `<button class="btn ghost" type="button" data-mystery="${item.id}">What did I get?</button>`
        : "";
      return `<article class="menu-card ${item.mystery ? "mystery" : ""}">
        <img src="${item.img}" alt="${item.name}" />
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
        <p class="price">₹${item.price}</p>
        <button class="btn gold" type="button" data-add="${item.id}">Add to parcel</button>
        ${extra}
      </article>`;
    })
    .join("");
}

function renderCart() {
  const entries = Object.entries(state.cart);
  if (!entries.length) {
    $("cart-items").innerHTML = "<p>Parcel is empty. Add something from the board.</p>";
  } else {
    $("cart-items").innerHTML = entries
      .map(([id, qty]) => {
        const item = ITEMS.find((i) => i.id === id);
        return `<div class="cart-row">
          <img src="${item.img}" alt="" />
          <div class="cart-row-copy">
            <strong>${item.name}</strong>
            <div>₹${item.price} × ${qty}</div>
          </div>
          <button class="btn ghost" type="button" data-remove="${id}">Remove one</button>
        </div>`;
      })
      .join("");
  }

  const { extras, total } = bill();
  const lines = Object.entries(state.cart)
    .map(([id, qty]) => {
      const item = ITEMS.find((i) => i.id === id);
      return `<div class="bill-line"><span>${item.name}</span><span>₹${item.price * qty}</span></div>`;
    })
    .concat(extras.map((e) => `<div class="bill-line"><span>${e.label}</span><span>₹${e.amount}</span></div>`))
    .join("");
  $("bill-lines").innerHTML = lines || "<div class='bill-line'><span>Air</span><span>₹0</span></div>";
  $("bill-total").textContent = total.toFixed(2);
}

function renderPayment() {
  $("pay-amount").textContent = bill().total.toFixed(2);
  $("pay-result").classList.add("hidden");
  $("pay-methods").innerHTML = PAY_METHODS.map(
    (m) => `<button class="pay-card ${state.payMethod === m.id ? "selected" : ""}" type="button" data-pay="${m.id}">
      <img src="${m.img}" alt="">
      <strong>${m.label}</strong>
      <p>${m.note}</p>
    </button>`
  ).join("");
}

function unlock(id) {
  if (state.unlocked.includes(id)) return;
  state.unlocked.push(id);
  save();
  const ach = ACHIEVEMENTS.find((a) => a.id === id);
  toast(`${ach.title} — noted on the board`);
  renderAchievements();
}

function renderAchievements() {
  $("achievements").innerHTML = ACHIEVEMENTS.map((a) => {
    const on = state.unlocked.includes(a.id);
    return `<article class="achievement ${on ? "" : "locked"}">
      <h3>${a.title}</h3>
      <p>${on ? a.copy : "Not yet."}</p>
    </article>`;
  }).join("");
}

function startTracking() {
  const list = $("track-steps");
  list.innerHTML = TRACK_STEPS.map((s) => `<li>${s.text}</li>`).join("");
  $("delivery-reveal").classList.add("hidden");
  $("nag-text").textContent = "";
  state.nagCount = 0;
  const items = [...list.children];
  let i = 0;
  const tick = () => {
    if (i >= items.length) return;
    items[i].classList.add("done");
    $("track-caption").textContent = TRACK_STEPS[i].caption;
    if (i === items.length - 1) $("delivery-reveal").classList.remove("hidden");
    i += 1;
    if (i < items.length) setTimeout(tick, 1400);
  };
  tick();
}

function completeOrder() {
  const { total } = bill();
  state.orders += 1;
  state.spent += total;
  if (state.cart.empty) unlock("empty");
  if (state.orders >= 1) unlock("first");
  if (state.orders >= 5) unlock("five");
  if (state.spent >= 500) unlock("spend");
  save();
  state.cart = {};
  $("cart-count").textContent = "0";
  startTracking();
  showScreen("track");
}

document.addEventListener("click", (e) => {
  const go = e.target.closest("[data-go]");
  if (go) showScreen(go.dataset.go);

  const filter = e.target.closest("[data-filter]");
  if (filter) {
    state.filter = filter.dataset.filter;
    renderMenu();
  }

  const add = e.target.closest("[data-add]");
  if (add) addToCart(add.dataset.add);

  const remove = e.target.closest("[data-remove]");
  if (remove) removeFromCart(remove.dataset.remove);

  const mystery = e.target.closest("[data-mystery]");
  if (mystery) {
    const result = MYSTERY_RESULTS[Math.floor(Math.random() * MYSTERY_RESULTS.length)];
    modal(`What did I get?\n\n${result}`);
  }

  const pay = e.target.closest("[data-pay]");
  if (pay) {
    state.payMethod = pay.dataset.pay;
    renderPayment();
  }
});

$("call-chettan").addEventListener("click", () => {
  state.callCount += 1;
  modal(
    state.callCount % 2 === 1
      ? "Calling…\n\nChettan’s in the middle of a tea. Try after this glass."
      : "Calling…\n\nHe poured another one."
  );
});

$("modal-close").addEventListener("click", () => $("modal").classList.add("hidden"));

document.querySelector(".bill").addEventListener("click", () => {
  if (cartCount()) $("bill-scold").classList.remove("hidden");
});

$("to-payment").addEventListener("click", () => {
  if (!cartCount()) {
    toast("Parcel is empty. Add something first.");
    return;
  }
  showScreen("payment");
});

$("pay-now").addEventListener("click", () => {
  const { total } = bill();
  state.paid = true;
  const result = $("pay-result");
  result.classList.remove("hidden");
  result.textContent = `Paid. ₹${total.toFixed(2)} is now with Chettan.`;
  setTimeout(completeOrder, 1600);
});

$("order-yes").addEventListener("click", () => showScreen("menu"));

$("order-no").addEventListener("click", () => {
  state.nagCount += 1;
  const el = $("nag-text");
  if (state.nagCount === 1) el.textContent = "Sure?";
  else if (state.nagCount === 2) el.textContent = "Think of Chettan.";
  else if (state.nagCount === 3) el.textContent = "Okay.";
  else {
    el.textContent = "Fine. 10% off next time. He might forget.";
    toast("10% noted. Maybe.");
    showScreen("menu");
  }
});

renderMenu();
renderAchievements();
$("cart-count").textContent = cartCount();
