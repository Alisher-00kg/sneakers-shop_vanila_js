import { renderFavoriteSneakers, toggleModalHandler } from "./main.js";

export const BASE_URL_FVRTS = "https://7b07443e1598fb30.mokky.dev/favorites";
const backdrop = document.getElementById("backdrop");
const basketSvg = document.getElementById("basket");
basketSvg.onclick = toggleModalHandler;
backdrop.onclick = toggleModalHandler;
export const postFavoriteSneakers = async (favorite) => {
  try {
    await fetch(BASE_URL_FVRTS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(favorite),
    });
    await getFavoriteSneakeres();
  } catch (error) {
    throw new Error(error);
  }
};

const getFavoriteSneakeres = async () => {
  try {
    const response = await fetch(BASE_URL_FVRTS);
    const data = await response.json();
    renderFavoriteSneakers(data);
  } catch (error) {
    throw new Error(error);
  }
};
getFavoriteSneakeres();

export const deletFavoriteSneakers = async (id) => {
  try {
    await fetch(`${BASE_URL_FVRTS}/${id}`, {
      method: "DELETE",
    });
    await getFavoriteSneakeres();
  } catch (error) {
    throw new Error(error);
  }
};
