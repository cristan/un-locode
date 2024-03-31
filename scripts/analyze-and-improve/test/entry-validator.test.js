import {validateCoordinates} from "../util/entry-validator.js";
import { expect } from 'chai';

describe("EntryValidator", () => {
    it("warn about no region being set when Nominatim finds a result in the wrong region", async () => {
        const csvEntry = {
            "city": "Cavo",
            "country": "IT",
            "location": "CVX",
            "subdivisionCode": "",
            "coordinates": "4251N 01025E",
            "date": "1101",
            "unlocode": "ITCVX"
        }
        // 2 results: 1 with "subdivisionCode":"MN" and 1 other "subdivisionCode":"LI". Nominatim returns the wrong one first which wouldn't have happened if subdivisionCode had been set to LI
        const nominatimResult = {
            "scrapeType":"byCity",
            "result":[
                {"place_id":94886140,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":6174935537,"lat":"45.0251381","lon":"11.2268793","category":"place","type":"hamlet","place_rank":20,"importance":0.25000999999999995,"addresstype":"hamlet","name":"Cavo","display_name":"Cavo, Carbonara di Po, Borgocarbonara, Mantua, Lombardy, 46020, Italy","address":{"hamlet":"Cavo","village":"Carbonara di Po","municipality":"Borgocarbonara","county":"Mantua","ISO3166-2-lvl6":"IT-MN","state":"Lombardy","ISO3166-2-lvl4":"IT-25","postcode":"46020","country":"Italy","country_code":"it"},"boundingbox":["45.0051381","45.0451381","11.2068793","11.2468793"],"subdivisionCode":"MN","sourceUrl":"https://www.openstreetmap.org/node/6174935537"},
                {"place_id":101383207,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":984555005,"lat":"42.8618513","lon":"10.419662","category":"place","type":"village","place_rank":19,"importance":0.22735449175290195,"addresstype":"village","name":"Cavo","display_name":"Cavo, Rio, Livorno, Tuscany, 57038, Italy","address":{"village":"Cavo","municipality":"Rio","county":"Livorno","ISO3166-2-lvl6":"IT-LI","state":"Tuscany","ISO3166-2-lvl4":"IT-52","postcode":"57038","country":"Italy","country_code":"it"},"boundingbox":["42.8418513","42.8818513","10.3996620","10.4396620"],"subdivisionCode":"LI","sourceUrl":"https://www.openstreetmap.org/node/984555005"}
            ]
        }
        const validateMessage = await validateCoordinates(csvEntry, nominatimResult)
        expect(validateMessage).equals("https://unlocode.info/ITCVX: (Cavo): There are 2 different results for Cavo in IT. Let's set the region to LI to avoid the confusion. Source: https://www.openstreetmap.org/node/984555005")
    })
})