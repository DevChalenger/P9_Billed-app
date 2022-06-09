/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES } from "../constants/routes.js";
import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js";
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
      })
    );
    onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
  });
  describe("When I am on NewBill Page", () => {
    let newBill;
    beforeEach(() => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
    });
    describe("When I do fill fields in correct format and I click on button 'Envoyer'", () => {
      it("should check if the file of the justificatory is correct", () => {
        //
        const formFile = screen.getByTestId("file");
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
    });
  });
});
