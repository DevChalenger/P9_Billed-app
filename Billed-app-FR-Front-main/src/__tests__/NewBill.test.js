/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES } from "../constants/routes.js";
import BillsUI from "../views/BillsUI.js";
import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  let onNavigate;
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
  });
  describe("When I am on NewBill Page", () => {
    let newBill;
    beforeEach(() => {
      document.body.innerHTML = NewBillUI();
      newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
    });
    describe("When I fill fields and I click on button 'Envoyer'", () => {
      let typeExpense;
      let nameExpense;
      let dateExpense;
      let amountExpense;
      let noTaxedExpense;
      let taxedExpense;
      let formFile;
      beforeEach(() => {
        typeExpense = screen.getByTestId("expense-type");
        nameExpense = screen.getByTestId("expense-name");
        dateExpense = screen.getByTestId("datepicker");
        amountExpense = screen.getByTestId("amount");
        noTaxedExpense = screen.getByTestId("vat");
        taxedExpense = screen.getByTestId("pct");
        formFile = screen.getByTestId("file");
      });
      it("should check input field is required", () => {
        expect(typeExpense).toBeRequired();
        expect(nameExpense).not.toBeRequired();
        expect(dateExpense).toBeRequired();
        expect(amountExpense).toBeRequired();
        expect(noTaxedExpense).not.toBeRequired();
        expect(taxedExpense).toBeRequired();
        expect(formFile).toBeRequired();
      });
      it("should check if the file of the justificatory is correct", () => {
        //Get Input file

        const extention = ["jpg", "jpeg", "png"];
        let fileExtension;

        //Jpg
        const fileNameJpg = new File(["file"], "file.jpg", {
          type: "image/jpg",
        });

        //Jpeg
        const fileNameJpeg = new File(["file"], "file.jpeg", {
          type: "image/jpeg",
        });

        //Png
        const fileNamePng = new File(["file"], "file.png", {
          type: "image/png",
        });

        //Pdf
        const fileNamePdf = new File(["file"], "file.pdf", {
          type: "file/pdf",
        });

        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        formFile.addEventListener("change", handleChangeFile);

        expect(formFile.files.length).toBe(0);

        //Check if is jpg
        fireEvent.change(formFile, { target: { files: [fileNameJpg] } });
        fileExtension = formFile.files[0].name.split(".").pop();
        expect(handleChangeFile).toHaveBeenCalled();
        expect(extention.includes(fileExtension)).toBeTruthy();

        //Check if is png
        fireEvent.change(formFile, { target: { files: [fileNamePng] } });
        fileExtension = formFile.files[0].name.split(".").pop();
        expect(handleChangeFile).toHaveBeenCalled();
        expect(extention.includes(fileExtension)).toBeTruthy();

        //Check if is jpeg
        fireEvent.change(formFile, { target: { files: [fileNameJpeg] } });
        fileExtension = formFile.files[0].name.split(".").pop();
        expect(handleChangeFile).toHaveBeenCalled();
        expect(extention.includes(fileExtension)).toBeTruthy();

        //Check if is not valid
        fireEvent.change(formFile, { target: { files: [fileNamePdf] } });
        fileExtension = formFile.files[0].name.split(".").pop();
        expect(handleChangeFile).toHaveBeenCalled();
        expect(extention.includes(fileExtension)).not.toBeTruthy();
      });
      it("should send the data of form to the server", () => {
        const formNewBill = screen.getByTestId("form-new-bill");
        const eventFormNewBill = jest.fn((e) => {
          newBill.handleSubmit(e);
        });
        formNewBill.addEventListener("submit", eventFormNewBill);
        fireEvent.submit(formNewBill);
        expect(formNewBill).toBeTruthy();
        expect(eventFormNewBill).toHaveBeenCalled();
      });
      describe("When an error occurs on API", () => {
        beforeEach(() => {
          jest.spyOn(mockStore, "bills");

          const root = document.createElement("div");
          root.setAttribute("id", "root");
          document.body.appendChild(root);
          router();
        });
        it("should fetches messages from an API and fails with 404 message error", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error("Erreur 404"));
              },
            };
          });

          await new Promise(process.nextTick);

          document.body.innerHTML = BillsUI({ error: "Erreur 404" });
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

          await new Promise(process.nextTick);

          document.body.innerHTML = BillsUI({ error: "Erreur 500" });
          const message = screen.getByText(/Erreur 500/);
          expect(message).toBeTruthy();
        });
      });
    });
  });
});
