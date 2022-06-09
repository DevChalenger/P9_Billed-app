/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  let onNavigate;
  let billsApp;
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "e@e",
      })
    );
    onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    billsApp = new Bills({
      document,
      onNavigate,
      mockStore,
      localStorage: window.localStorage,
    });
  });
  describe("When I am on Bills Page", () => {
    it("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      //Checking if windowIcon have the class "active-icon"
      expect(windowIcon).toHaveClass("active-icon");
    });
    it("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      //Checking if the dates is sorted
      expect(dates).toEqual(datesSorted);
    });
    describe("When i am clicking on the 'New Bill' button", () => {
      it("Should redirect me to the new bill page", () => {
        const handleClickNewBill = jest.fn(() => {
          billsApp.handleClickNewBill();
        });
        const getNewBillButton = screen.getByTestId("btn-new-bill");

        getNewBillButton.addEventListener("click", handleClickNewBill);
        userEvent.click(getNewBillButton);

        expect(handleClickNewBill).toHaveBeenCalled();
        expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
        expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      });
    });
    describe("When i am clicking on the eye icon", () => {
      it("Should show me the justificatory", () => {
        document.body.innerHTML = BillsUI({ data: bills });
        $.fn.modal = jest.fn();
        const getEyeIconButton = screen.getAllByTestId("icon-eye");
        getEyeIconButton.forEach((iconButton) => {
          const handleClickIconEye = jest.fn(() => {
            billsApp.handleClickIconEye(iconButton);
          });
          iconButton.addEventListener("click", handleClickIconEye);
          userEvent.click(iconButton);
          expect(handleClickIconEye).toHaveBeenCalled();
        });
        expect($.fn.modal).toHaveBeenCalledWith("show");
      });
    });
    describe("When i navigate on bills page", () => {
      it("should fetches bills from mock API GET", () => {
        const root = document.createElement("div");
        root.setAttribute("id", "root");

        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.Bills);
        const tableBody = screen.getByTestId("tbody");
        expect(tableBody).toBeTruthy();
        expect(tableBody).toContainHTML("<tr>");
        expect(tableBody).toContainHTML("pending");
        expect(tableBody).toContainHTML("refused");
        expect(tableBody).toContainHTML("accepted");
      });
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      it("should fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      it("should fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
