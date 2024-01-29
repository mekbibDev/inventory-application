const openModalButtons = document.querySelectorAll(".openModal");
const closeDialogButton = document.querySelector(".closeDialog");
const submitAdminKey = document.querySelector("#submitAdminKey");
const dialog = document.querySelector("dialog");

openModalButtons.forEach((openModalButton) => {
  openModalButton.addEventListener("click", (e) => {
    let url = e.target.getAttribute("data-attribute");
    const form = dialog.querySelector("form");
    form.action = url;
    dialog.show();
  });
});
if (submitAdminKey) {
  submitAdminKey.addEventListener("click", () => {
    const form = dialog.querySelector("form");
    const inputValue = dialog.querySelector("input").value;
    form.action += `${inputValue}/delete`;
  });
}

closeDialogButton.addEventListener("click", (e) => {
  e.preventDefault();
  dialog.close();
});
