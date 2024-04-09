import {getCityName} from "../util/nominatim-downloader.js";
import { expect } from 'chai';

describe("Nominatim downloader", () => {
    it("Names behind brackets are removed", () => {
        expect(getCityName({city:"Fox River (=riviere-Au-Renard)"})).equals("Fox River")
    })
})