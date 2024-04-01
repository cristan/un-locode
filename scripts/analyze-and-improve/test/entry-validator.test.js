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
    it ("incorrect region is set and multiple close results found", async () => {
        const csvEntry ={
            "city":"Bazhou",
            "country":"CN",
            "location":"BAZ",
            "subdivisionCode":"13",
            "coordinates":"3906N 11623E",
            "date":"0901",
            "unlocode":"CNBAZ"
        }
        const nominatimResult = {
            "scrapeType":"byCity",
            "result":[
                {"place_id":208125672,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":244076793,"lat":"31.8537757","lon":"106.764686","category":"place","type":"city","place_rank":16,"importance":0.47202402984906083,"addresstype":"city","name":"Bazhou District","display_name":"Bazhou District, Dongcheng Subdistrict, Bazhou District, Bazhong, Sichuan, China","address":{"city":"Bazhou District","town":"Dongcheng Subdistrict","district":"Bazhou District","region":"Bazhong","state":"Sichuan","ISO3166-2-lvl4":"CN-SC","country":"China","country_code":"cn"},"boundingbox":["31.6937757","32.0137757","106.6046860","106.9246860"],"subdivisionCode":"SC","sourceUrl":"https://www.openstreetmap.org/node/244076793"},
                {"place_id":196417110,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":244076670,"lat":"39.1120884","lon":"116.3922323","category":"place","type":"city","place_rank":16,"importance":0.4603023926675614,"addresstype":"city","name":"Bazhou","display_name":"Bazhou, Langfang, Hebei, China","address":{"city":"Bazhou","state":"Hebei","ISO3166-2-lvl4":"CN-HE","country":"China","country_code":"cn"},"boundingbox":["38.9520884","39.2720884","116.2322323","116.5522323"],"subdivisionCode":"HE","sourceUrl":"https://www.openstreetmap.org/node/244076670"},
                {"place_id":196053555,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"relation","osm_id":2989320,"lat":"39.0776239","lon":"116.6039332","category":"boundary","type":"administrative","place_rank":12,"importance":0.4603023926675614,"addresstype":"district","name":"Bazhou City","display_name":"Bazhou City, Langfang, Hebei, China","address":{"district":"Bazhou City","city":"Langfang","state":"Hebei","ISO3166-2-lvl4":"CN-HE","country":"China","country_code":"cn"},"boundingbox":["38.9831482","39.2185897","116.2573608","116.9202487"],"subdivisionCode":"HE","sourceUrl":"https://www.openstreetmap.org/relation/2989320"},
                {"place_id":208639688,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":4916661884,"lat":"26.3271","lon":"109.131","category":"place","type":"village","place_rank":19,"importance":0.27501,"addresstype":"village","name":"Bazhou","display_name":"Bazhou, Liping, Qiandongnan, Guizhou, China","address":{"village":"Bazhou","county":"Liping","region":"Qiandongnan","state":"Guizhou","ISO3166-2-lvl4":"CN-GZ","country":"China","country_code":"cn"},"boundingbox":["26.3071000","26.3471000","109.1110000","109.1510000"],"subdivisionCode":"GZ","sourceUrl":"https://www.openstreetmap.org/node/4916661884"},
                {"place_id":196160963,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":5244395386,"lat":"37.5962947","lon":"113.6612954","category":"place","type":"village","place_rank":19,"importance":0.27501,"addresstype":"village","name":"Bazhou","display_name":"Bazhou, Jinzhong, Shanxi, China","address":{"village":"Bazhou","city":"Jinzhong","state":"Shanxi","ISO3166-2-lvl4":"CN-SX","country":"China","country_code":"cn"},"boundingbox":["37.5762947","37.6162947","113.6412954","113.6812954"],"subdivisionCode":"SX","sourceUrl":"https://www.openstreetmap.org/node/5244395386"},
                {"place_id":207780813,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":4916658172,"lat":"26.8955","lon":"109.151","category":"place","type":"village","place_rank":19,"importance":0.27501,"addresstype":"village","name":"Bazhou;Pa-chou","display_name":"Bazhou;Pa-chou, Tianzhu, Qiandongnan, Guizhou, China","address":{"village":"Bazhou;Pa-chou","county":"Tianzhu","region":"Qiandongnan","state":"Guizhou","ISO3166-2-lvl4":"CN-GZ","country":"China","country_code":"cn"},"boundingbox":["26.8755000","26.9155000","109.1310000","109.1710000"],"subdivisionCode":"GZ","sourceUrl":"https://www.openstreetmap.org/node/4916658172"},
                {"place_id":192925955,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":8481597960,"lat":"41.1248283","lon":"112.9783986","category":"place","type":"hamlet","place_rank":20,"importance":0.25000999999999995,"addresstype":"hamlet","name":"Bazhou","display_name":"Bazhou, Sanchakou, Qahar Right Front Banner, Ulanqab City, Inner Mongolia, China","address":{"hamlet":"Bazhou","town":"Sanchakou","district":"Qahar Right Front Banner","city":"Ulanqab City","state":"Inner Mongolia","ISO3166-2-lvl4":"CN-NM","country":"China","country_code":"cn"},"boundingbox":["41.1048283","41.1448283","112.9583986","112.9983986"],"subdivisionCode":"NM","sourceUrl":"https://www.openstreetmap.org/node/8481597960"},
                {"place_id":206552580,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":8093022421,"lat":"22.3476546","lon":"112.7894211","category":"place","type":"hamlet","place_rank":20,"importance":0.25000999999999995,"addresstype":"hamlet","name":"Bazhou","display_name":"Bazhou, Shuibu, Taishan, Jiangmen, Guangdong Province, China","address":{"hamlet":"Bazhou","town":"Shuibu","county":"Taishan","city":"Jiangmen","state":"Guangdong Province","ISO3166-2-lvl4":"CN-GD","country":"China","country_code":"cn"},"boundingbox":["22.3276546","22.3676546","112.7694211","112.8094211"],"subdivisionCode":"GD","sourceUrl":"https://www.openstreetmap.org/node/8093022421"},
                {"place_id":193513056,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":3755502219,"lat":"36.2133811","lon":"102.7595497","category":"place","type":"town","place_rank":18,"importance":0.24232784765903637,"addresstype":"town","name":"Bazhou","display_name":"Bazhou, Minhe Hui and Tu Autonomous County, Haidong, Qinghai, China","address":{"town":"Bazhou","county":"Minhe Hui and Tu Autonomous County","region":"Haidong","state":"Qinghai","ISO3166-2-lvl4":"CN-QH","country":"China","country_code":"cn"},"boundingbox":["36.1733811","36.2533811","102.7195497","102.7995497"],"subdivisionCode":"QH","sourceUrl":"https://www.openstreetmap.org/node/3755502219"}
            ]
        }
        const validateMessage = await validateCoordinates(csvEntry, nominatimResult)
        expect(validateMessage).equals("https://unlocode.info/CNBAZ: (Bazhou): Invalid subdivision code 13! Please change the region to HE. It could also be that Bazhou District in SC or Bazhou in GZ or Bazhou in SX or Bazhou;Pa-chou in GZ or Bazhou in NM or Bazhou in GD or Bazhou in QH is meant.")
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