import {
  BASE_URL_FVRTS,
  deletFavoriteSneakers,
  postFavoriteSneakers,
} from "./favorites.js";

const backdrop = document.getElementById("backdrop");
const modal = document.getElementById("modal");
const ul_mainPage = document.getElementsByClassName("cards_container");
const basketSvg = document.getElementById("basket");
const modalContentMain = document.getElementsByClassName("modal-content__main");
const ul_mainPageF = document.getElementById("fv_cards");

const BASE_URL = "https://7b07443e1598fb30.mokky.dev/sneakers";

//
export function toggleModalHandler() {
  backdrop.classList.toggle("visible");
  modal.classList.toggle("visible");
}
//
basketSvg.onclick = toggleModalHandler;
backdrop.onclick = toggleModalHandler;
// ?
async function getMainSneakers() {
  try {
    const response = await fetch(BASE_URL);
    const data = await response.json();
    renderMainSneakers(data);
  } catch (error) {
    throw new Error(error);
  }
}

const renderMainSneakers = (mainSneakers) => {
  ul_mainPage[0].innerHTML = "";
  mainSneakers.forEach((item) => {
    console.log("Рендерим карточку", item.id, "isFavorite:", item.isFavorite);
    const li = document.createElement("li");
    li.classList.add("card");
    li.insertAdjacentHTML(
      "beforeend",
      `
                 <img src="./assets/icons/${
                   item.isFavorite ? "red-heart" : "white-heart"
                 }.svg" 
             alt="heart" 
             class="heart icon" 
             data-id="${item.id}" 
             data-favorite="${item.isFavorite}" />
                <img
                  src=${item.imageURL}
                  alt="shoes"
                  class="shoes"
                />
                <div class="card_description">
                  <p>${item.status}</p>
                  <p>${item.title}</p>
                </div>
                <div class="card_low__info">
                  <div class="card_low__info--price">
                    <span>Цена:</span>
                    <p>${item.price}руб</p>
                  </div>
                  
                      <img src="./assets/icons/${
                        item.isBasket ? "green-check" : "plus"
                      }.svg" 
             alt="plus" 
             class="plus icon" 
             data-id="${item.id}" 
             data-basket="${item.isBasket}" />
                </div>
            `
    );

    li.querySelector(".plus").addEventListener("click", function () {
      if (!item.isBasket) {
        postSneakers(item);
      } else {
        deleteBasketSneakers(item.id);
      }
      toggleBasket(item, this);
    });
    li.querySelector(".heart").addEventListener("click", function () {
      if (this.getAttribute("data-clicked") === "true") {
        this.src = "./assets/icons/white-heart.svg";
        this.setAttribute("data-clicked", "false");
      } else {
        this.src = "./assets/icons/red-heart.svg";
        this.setAttribute("data-clicked", "true");
      }
      toggleFavorite(item, this);
    });
    ul_mainPage[0].appendChild(li);
  });
};
const toggleBasket = (item, btn) => {
  item.isBasket = !item.isBasket;

  btn.src = `./assets/icons/${item.isBasket ? "green-check" : "plus"}.svg`;
  btn.setAttribute("data-basket", item.isBasket);

  updateBasketStatus(item.id, item.isBasket);
};

const updateBasketStatus = async (id, isBasket) => {
  try {
    await fetch(`https://7b07443e1598fb30.mokky.dev/new-cross/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBasket }),
    });
  } catch (error) {
    console.error("Ошибка обновления корзины:", error);
  }
};

export async function postSneakers(boot) {
  try {
    await fetch("https://7b07443e1598fb30.mokky.dev/new-cross", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: boot.id,
        imageURL: boot.imageURL,
        title: boot.title,
        price: boot.price,
        status: boot.status,
      }),
    });
    getBasketSneakers();
  } catch (error) {
    throw new Error(error);
  }
}
async function getBasketSneakers() {
  try {
    const response = await fetch(
      "https://7b07443e1598fb30.mokky.dev/new-cross"
    );
    const data = await response.json();
    renderBasketSneakers(data);
  } catch (error) {
    throw new Error(error);
  }
}
const renderBasketSneakers = (array) => {
  modalContentMain[0].innerHTML = "";
  if (array.length === 0) {
    modalContentMain[0].insertAdjacentHTML(
      "beforeend",
      `<div class="empty-box-wrapper">
      <div class="empty-box">
        <img src="./assets/images/empty-basket.png" alt="empty-box" />
        <button class="green-btn back">
          <img
            src="./assets/icons/arrow-to-left.svg"
            alt="arrow-to-left"
          />Вернуться назад
        </button>
      </div>
    </div>`
    );
    modalContentMain[0]
      .querySelector(".back")
      .addEventListener("click", toggleModalHandler);
  } else {
    const basket_wrapper = document.createElement("div");
    const totalInfo = document.createElement("div");
    totalInfo.className = "total_info";
    basket_wrapper.className = "basket_wrapper";
    const ulBasket = document.createElement("ul");
    ulBasket.className = "ul_basket";
    ulBasket.innerHTML = "";

    array.map(({ imageURL, status, title, price, id }) => {
      const basket_card = document.createElement("li");
      basket_card.className = "basket_card";
      basket_card.insertAdjacentHTML(
        "beforeend",
        `<img
        src=${imageURL}
        alt="sneakers"
        class="basket_img"
      />
      <div class="basket_card__rigthside">
        <div class="basket_card__description">
          <div class="basket_card__description--text">
            <p>${status}</p>
            <p>${title}</p>
          </div>
          <p class="basket_card--price">${price}руб</p>
        </div>
        <img
          src="./assets/icons/remove-x.svg"
          alt="remove"
          class="remove-x icon"
        />
      </div>`
      );
      basket_card
        .querySelector(".remove-x")
        .addEventListener("click", () => deleteBasketSneakers(id));
      ulBasket.appendChild(basket_card);
    });
    const sumTotalReducer = (basket) => {
      return basket.reduce((acc, item) => acc + item.price, 0);
    };
    sumTotalReducer(array);
    //
    const updateNewInfo = (basket) => {
      const totalSum = sumTotalReducer(basket);
      const discount = totalSum * 0.005;
      basket_wrapper.innerHTML = "";
      totalInfo.insertAdjacentHTML(
        "beforeend",
        `
          <div class="total_info--block">
            <span>Итого: </span>
            <div class="border"></div>
            <p>${totalSum}руб</p>
          </div>
          <div class="total_info--block">
            <span>Налог 5%: </span>
            <div class="border"></div>
            <p>${discount.toFixed(2)}руб</p>
          </div>
          <button class="green-btn next">
            Оформить заказ
            <img src="./assets/icons/arrow-to-right.svg" alt="arrow-to-right" />
          </button>`
      );
    };
    updateNewInfo(array);
    //
    const someOtherFunc = (basket) => {
      const totalSum = sumTotalReducer(basket);
      const total_summary = document.getElementById("total-summary");
      total_summary.textContent = `${totalSum} руб`;
    };
    someOtherFunc(array);
    //
    basket_wrapper.append(ulBasket, totalInfo);
    modalContentMain[0].appendChild(basket_wrapper);
  }
};
async function deleteBasketSneakers(id) {
  try {
    const response = await fetch(
      `https://7b07443e1598fb30.mokky.dev/new-cross/${id}`,
      {
        method: "DELETE",
      }
    );
    const updatedBasketResponse = await fetch(
      "https://7b07443e1598fb30.mokky.dev/new-cross"
    );
    const updatedBasketData = await updatedBasketResponse.json();

    renderBasketSneakers(updatedBasketData);
    updateHeaderTotal(updatedBasketData);
  } catch (error) {
    throw new Error(error);
  }
}
const updateHeaderTotal = (basket) => {
  const totalSum = basket.reduce((acc, item) => acc + item.price, 0);
  const totalSummaryElement = document.getElementById("total-summary");
  totalSummaryElement.textContent = `${totalSum} руб`;
};

getBasketSneakers();
getMainSneakers();
// postFavoriteSneakers
export function renderFavoriteSneakers(favorite) {
  ul_mainPageF.innerHTML = "";
  favorite.forEach((item) => {
    console.log("Рендерим карточку", item.id, "isFavorite:", item.isFavorite);

    const li = document.createElement("li");
    li.classList.add("card");
    li.insertAdjacentHTML(
      "beforeend",
      `
                 <img src="./assets/icons/${
                   item.isFavorite ? "red-heart" : "white-heart"
                 }.svg" 
             alt="heart" 
             class="heart icon" 
             data-id="${item.id}" 
             data-favorite="${item.isFavorite}" />
                 <img
                   src=${item.imageURL}
                   alt="shoes"
                   class="shoes"
                 />
                 <div class="card_description">
                   <p>${item.status}</p>
                   <p>${item.title}</p>
                 </div>
                 <div class="card_low__info">
                   <div class="card_low__info--price">
                     <span>Цена:</span>
                     <p>${item.price}руб</p>
                   </div>
                   
                       <img src="./assets/icons/${
                         item.isBasket ? "green-check" : "plus"
                       }.svg" 
              alt="plus" 
              class="plus icon" 
              data-id="${item.id}" 
              data-basket="${item.isBasket}" />
                 </div>
             `
    );

    li.querySelector(".plus").addEventListener("click", function () {
      if (!item.isBasket) {
        postSneakers(item);
      } else {
        deleteBasketSneakers(item.id);
      }
      toggleBasket(item, this);
    });

    li.querySelector(".heart").addEventListener("click", function () {
      toggleFavorite(item, this);
    });

    ul_mainPageF.appendChild(li);
  });
}

async function toggleFavorite(item, btn) {
  item.isFavorite = !item.isFavorite;

  try {
    if (item.isFavorite) {
      await postFavoriteSneakers(item);
    } else {
      await deletFavoriteSneakers(item.id);
    }

    btn.src = `./assets/icons/${
      item.isFavorite ? "red-heart" : "white-heart"
    }.svg`;
    btn.setAttribute("data-favorite", item.isFavorite);
    getMainSneakers();
  } catch (error) {
    console.error("Ошибка при изменении избранного:", error);
  }
}
