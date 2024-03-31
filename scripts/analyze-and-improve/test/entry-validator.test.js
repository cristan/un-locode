import {validateCoordinates} from "../util/entry-validator.js";
import { expect } from 'chai';

describe("EntryValidator", () => {
    it("no region is set and Nominatim picks the result in the wrong region", async () => {
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
    it ("the wrong region is set (a close location is found in another region) - existing wrong location", async () => {
        const csvEntry = {
            "city": "Filo",
            "country": "IT",
            "location": "CFL",
            "subdivisionCode": "CR",
            "subdivisionName": "Cremona",
            "coordinates": "4435N 01155E",
            "unlocode": "ITCFL"
        }
        // 3 results in regions AR, RA, MB
        // The second one (Molino di Filo) is close enough, but has another region as the CSV entry (RA). Therefore, the entry should probably have that as the subdivisionCode.
        const nominatimResult = {
            "scrapeType":"byCity",
            "result":[
                {"place_id":101237498,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":1434672351,"lat":"43.28271","lon":"11.826516","category":"place","type":"hamlet","place_rank":20,"importance":0.400690081410952,"addresstype":"hamlet","name":"Via del Filo","display_name":"Via del Filo, Foiano della Chiana, Arezzo, Tuscany, 52045, Italy","address":{"hamlet":"Via del Filo","village":"Foiano della Chiana","county":"Arezzo","ISO3166-2-lvl6":"IT-AR","state":"Tuscany","ISO3166-2-lvl4":"IT-52","postcode":"52045","country":"Italy","country_code":"it"},"boundingbox":["43.2627100","43.3027100","11.8065160","11.8465160"],"subdivisionCode":"AR","sourceUrl":"https://www.openstreetmap.org/node/1434672351"},
                {"place_id":97521132,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":2331746827,"lat":"44.5917181","lon":"11.9526807","category":"place","type":"village","place_rank":19,"importance":0.27501,"addresstype":"village","name":"Molino di Filo","display_name":"Molino di Filo, Alfonsine, Unione dei comuni della Bassa Romagna, Ravenna, Emilia-Romagna, 48011, Italy","address":{"village":"Molino di Filo","town":"Alfonsine","municipality":"Unione dei comuni della Bassa Romagna","county":"Ravenna","ISO3166-2-lvl6":"IT-RA","state":"Emilia-Romagna","ISO3166-2-lvl4":"IT-45","postcode":"48011","country":"Italy","country_code":"it"},"boundingbox":["44.5717181","44.6117181","11.9326807","11.9726807"],"subdivisionCode":"RA","sourceUrl":"https://www.openstreetmap.org/node/2331746827"},
                {"place_id":96118282,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":4946937027,"lat":"45.6979964","lon":"9.2355086","category":"place","type":"hamlet","place_rank":20,"importance":0.25000999999999995,"addresstype":"hamlet","name":"Molino Filo","display_name":"Molino Filo, Verano Brianza, Monza and Brianza, Lombardy, 20843, Italy","address":{"hamlet":"Molino Filo","village":"Verano Brianza","county":"Monza and Brianza","ISO3166-2-lvl6":"IT-MB","state":"Lombardy","ISO3166-2-lvl4":"IT-25","postcode":"20843","country":"Italy","country_code":"it"},"boundingbox":["45.6779964","45.7179964","9.2155086","9.2555086"],"subdivisionCode":"MB","sourceUrl":"https://www.openstreetmap.org/node/4946937027"}
            ]
        }
        const validateMessage = await validateCoordinates(csvEntry, nominatimResult)
        const expected = "https://unlocode.info/ITCFL: (Filo): No Filo found in CR! Molino di Filo (RA) does exist at the provided coordinates, so the region should probably be changed to RA. It could also be that Via del Filo in AR or Molino Filo in MB is meant."
        expect(validateMessage).equals(expected)
    })
})