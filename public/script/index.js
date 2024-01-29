const openModalButtons = document.querySelectorAll(".openModal");
const closeAdminDialogButton = document.querySelector(".closeAdminDialog");
const closeStatusDialogButton = document.querySelector(".closeStatusDialog");
const submitAdminKey = document.querySelector("#submitAdminKey");
const adminDialog = document.querySelector(".adminDialog");
const statusDialog = document.querySelector(".statusDialog");

openModalButtons.forEach((openModalButton) => {
  openModalButton.addEventListener("click", (e) => {
    let url = e.target.getAttribute("data-attribute");
    const form = adminDialog.querySelector("form");
    form.action = url;
    adminDialog.show();
  });
});

if (submitAdminKey) {
  submitAdminKey.addEventListener("click", () => {
    const form = adminDialog.querySelector("form");
    const inputValue = adminDialog.querySelector("input").value;
    form.action += `${inputValue}/delete`;
  });
}

closeAdminDialogButton.addEventListener("click", (e) => {
  e.preventDefault();
  adminDialog.close();
});

closeStatusDialogButton.addEventListener("click", () => {
  statusDialog.close();
});
