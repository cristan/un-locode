import {getDownloadCityName} from "../util/nominatim-downloader.js";
import { expect } from 'chai';

describe("Nominatim downloader", () => {
    it("Names behind brackets are removed", () => {
        expect(getDownloadCityName({city:"Fox River (=riviere-Au-Renard)"})).equals("Fox River")
    })

    it("Everything before slash is kept and Apt is renamed to Airport", () => {
        expect(getDownloadCityName({city:"Jorge Newbury Apt/Buenos Aires"})).equals("Jorge Newbury Airport")
    })

})