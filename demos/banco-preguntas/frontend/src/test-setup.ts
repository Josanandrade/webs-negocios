import "@testing-library/jest-dom/vitest";

// jsdom no implementa <dialog>.showModal()/close().
HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};
HTMLDialogElement.prototype.close = function () {
  this.open = false;
};
