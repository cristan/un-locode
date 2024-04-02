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
        expect(validateMessage).equals("https://unlocode.info/CNBAZ: (Bazhou): Invalid subdivision code 13! Please change the region to HE. It could also be that Bazhou District in SC or Bazhou in GZ or SX or Bazhou;Pa-chou in GZ or Bazhou in NM or GD or QH is meant.")
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
    it ("nothing is logged when there's a good result at the coordinates, just not the first result", async () => {
        const csvEntry = {
            "city": "Bacao",
            "country": "CN",
            "location": "BCO",
            "subdivisionCode": "GZ",
            "subdivisionName": "Guizhou Sheng",
            "coordinates": "2528N 10547E",
            "date": "1401",
            "unlocode": "CNBCO"
        }

        const nominatimResult = {
            "scrapeType":"byRegion",
            "result":[
                {"place_id":207502998,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":4916974078,"lat":"26.811","lon":"109.416","category":"place","type":"village","place_rank":19,"importance":0.27501,"addresstype":"village","name":"Bacao","display_name":"Bacao, Tianzhu, Qiandongnan, Guizhou, China","address":{"village":"Bacao","county":"Tianzhu","region":"Qiandongnan","state":"Guizhou","ISO3166-2-lvl4":"CN-GZ","country":"China","country_code":"cn"},"boundingbox":["26.7910000","26.8310000","109.3960000","109.4360000"],"subdivisionCode":"GZ","sourceUrl":"https://www.openstreetmap.org/node/4916974078#map=12/26.811/109.416"},
                {"place_id":207514486,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":4273376574,"lat":"25.4722","lon":"105.784","category":"place","type":"village","place_rank":19,"importance":0.27501,"addresstype":"village","name":"Bacao","display_name":"Bacao, Anshun, Guizhou, China","address":{"village":"Bacao","city":"Anshun","state":"Guizhou","ISO3166-2-lvl4":"CN-GZ","country":"China","country_code":"cn"},"boundingbox":["25.4522000","25.4922000","105.7640000","105.8040000"],"subdivisionCode":"GZ","sourceUrl":"https://www.openstreetmap.org/node/4273376574#map=12/25.4722/105.784"
                }
            ]
        }

        const validateMessage = await validateCoordinates(csvEntry, nominatimResult)
        expect(validateMessage).undefined
    })
    it ("the coordinates point to a real place, but there's a much bigger one too, which might be the one they mean", async () => {
        const csvEntry = {
            "city": "Shatian",
            "country": "CN",
            "location": "STI",
            "subdivisionCode": "GD",
            "subdivisionName": "Guangdong Sheng",
            "coordinates": "2359N 11354E",
            "date": "1401",
            "unlocode": "CNSTI"
        }

        const nominatimResult = {
            "scrapeType":"byRegion",
            "result":[
                {"place_id":205785137,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"relation","osm_id":5664242,"lat":"22.9223476","lon":"113.6129572","category":"boundary","type":"administrative","place_rank":16,"importance":0.37242196006679895,"addresstype":"town","name":"Shatian Town","display_name":"Shatian Town, Dongguan, Guangdong Province, China","address":{"town":"Shatian Town","city":"Dongguan","state":"Guangdong Province","ISO3166-2-lvl4":"CN-GD","country":"China","country_code":"cn"},"boundingbox":["22.8077575","22.9952075","113.5364764","113.6509520"],"subdivisionCode":"GD","sourceUrl":"https://www.openstreetmap.org/relation/5664242"},
                {"place_id":197681606,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":2065846911,"lat":"24.4498957","lon":"112.5055354","category":"place","type":"village","place_rank":19,"importance":0.27501,"addresstype":"village","name":"Shatian","display_name":"Shatian, Qingyuan City, Guangdong Province, China","address":{"village":"Shatian","city":"Qingyuan City","state":"Guangdong Province","ISO3166-2-lvl4":"CN-GD","country":"China","country_code":"cn"},"boundingbox":["24.4298957","24.4698957","112.4855354","112.5255354"],"subdivisionCode":"GD","sourceUrl":"https://www.openstreetmap.org/node/2065846911#map=12/24.4498957/112.5055354"},
                {"place_id":207748310,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":2065846845,"lat":"21.9084502","lon":"110.7026725","category":"place","type":"village","place_rank":19,"importance":0.27501,"addresstype":"village","name":"Shatian","display_name":"Shatian, Maoming City, Guangdong Province, China","address":{"village":"Shatian","city":"Maoming City","state":"Guangdong Province","ISO3166-2-lvl4":"CN-GD","country":"China","country_code":"cn"},"boundingbox":["21.8884502","21.9284502","110.6826725","110.7226725"],"subdivisionCode":"GD","sourceUrl":"https://www.openstreetmap.org/node/2065846845#map=12/21.9084502/110.7026725"},{"place_id":206399262,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":8093021406,"lat":"22.2034779","lon":"112.8524101","category":"place","type":"hamlet","place_rank":20,"importance":0.25000999999999995,"addresstype":"hamlet","name":"Shatian","display_name":"Shatian, Taishan, Jiangmen, Guangdong Province, China","address":{"hamlet":"Shatian","county":"Taishan","city":"Jiangmen","state":"Guangdong Province","ISO3166-2-lvl4":"CN-GD","country":"China","country_code":"cn"},"boundingbox":["22.1834779","22.2234779","112.8324101","112.8724101"],"subdivisionCode":"GD","sourceUrl":"https://www.openstreetmap.org/node/8093021406#map=12/22.2034779/112.8524101"},{"place_id":205293114,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":8750182300,"lat":"22.1666753","lon":"111.1879384","category":"place","type":"hamlet","place_rank":20,"importance":0.25000999999999995,"addresstype":"hamlet","name":"Shatian","display_name":"Shatian, Gaozhou City, Maoming City, Guangdong Province, China","address":{"hamlet":"Shatian","county":"Gaozhou City","city":"Maoming City","state":"Guangdong Province","ISO3166-2-lvl4":"CN-GD","country":"China","country_code":"cn"},"boundingbox":["22.1466753","22.1866753","111.1679384","111.2079384"],"subdivisionCode":"GD","sourceUrl":"https://www.openstreetmap.org/node/8750182300#map=12/22.1666753/111.1879384"},{"place_id":383077924,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":11680375557,"lat":"23.4096933","lon":"111.4186946","category":"place","type":"hamlet","place_rank":20,"importance":0.25000999999999995,"addresstype":"hamlet","name":"Shatian","display_name":"Shatian, Jiangchuan, Fengkai County, Zhaoqing City, Guangdong Province, China","address":{"hamlet":"Shatian","town":"Jiangchuan","county":"Fengkai County","city":"Zhaoqing City","state":"Guangdong Province","ISO3166-2-lvl4":"CN-GD","country":"China","country_code":"cn"},"boundingbox":["23.3896933","23.4296933","111.3986946","111.4386946"],"subdivisionCode":"GD","sourceUrl":"https://www.openstreetmap.org/node/11680375557#map=12/23.4096933/111.4186946"},{"place_id":207159372,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":8316066287,"lat":"23.9983203","lon":"113.9217169","category":"place","type":"town","place_rank":18,"importance":0.22887635671362175,"addresstype":"town","name":"Shatian","display_name":"Shatian, Xinfeng County, Shaoguan, Guangdong Province, China","address":{"town":"Shatian","city":"Xinfeng County","region":"Shaoguan","state":"Guangdong Province","ISO3166-2-lvl4":"CN-GD","country":"China","country_code":"cn"},"boundingbox":["23.9583203","24.0383203","113.8817169","113.9617169"],"subdivisionCode":"GD","sourceUrl":"https://www.openstreetmap.org/node/8316066287#map=12/23.9983203/113.9217169"},{"place_id":206773464,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":3154256875,"lat":"22.8694187","lon":"114.5464066","category":"place","type":"town","place_rank":18,"importance":0.22887635671362175,"addresstype":"town","name":"Shatian","display_name":"Shatian, Huizhou, Guangdong Province, China","address":{"town":"Shatian","city":"Huizhou","state":"Guangdong Province","ISO3166-2-lvl4":"CN-GD","country":"China","country_code":"cn"},"boundingbox":["22.8294187","22.9094187","114.5064066","114.5864066"],"subdivisionCode":"GD","sourceUrl":"https://www.openstreetmap.org/node/3154256875#map=12/22.8694187/114.5464066"},{"place_id":199992387,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":687192299,"lat":"24.1353247","lon":"116.440256","category":"place","type":"village","place_rank":19,"importance":0.27501,"addresstype":"village","name":"砂田","display_name":"砂田, Meizhou, Guangdong Province, China","address":{"village":"砂田","city":"Meizhou","state":"Guangdong Province","ISO3166-2-lvl4":"CN-GD","country":"China","country_code":"cn"},"boundingbox":["24.1153247","24.1553247","116.4202560","116.4602560"],"subdivisionCode":"GD","sourceUrl":"https://www.openstreetmap.org/node/687192299#map=12/24.1353247/116.440256"},{"place_id":384275488,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":11729754504,"lat":"23.5831289","lon":"111.8139807","category":"place","type":"hamlet","place_rank":20,"importance":0.1333433333333333,"addresstype":"hamlet","name":"Shatian","display_name":"Shatian, Fengkai County, Zhaoqing City, Guangdong Province, China","address":{"hamlet":"Shatian","county":"Fengkai County","city":"Zhaoqing City","state":"Guangdong Province","ISO3166-2-lvl4":"CN-GD","country":"China","country_code":"cn"},"boundingbox":["23.5631289","23.6031289","111.7939807","111.8339807"],"subdivisionCode":"GD","sourceUrl":"https://www.openstreetmap.org/node/11729754504#map=12/23.5831289/111.8139807"}
            ]
        }

        const validateMessage = await validateCoordinates(csvEntry, nominatimResult)
        const expected = "https://unlocode.info/CNSTI: (Shatian): The coordinates do point to Shatian, but it's a small town and you have the bigger town Shatian Town at 2255N 11337E (122 km away; source: https://www.openstreetmap.org/relation/5664242). Please doublecheck if this is pointing to the correct location."
        expect(validateMessage).equals(expected)
    })
    it ("the entry doesn't have a region in Nominatim", async () => {
        const csvEntry = {
            "city": "Auern",
            "country": "AT",
            "location": "ARN",
            "subdivisionCode": "4",
            "subdivisionName": "Oberösterreich",
            "coordinates": "4759N 01407E",
            "date": "1101",
            "unlocode": "ATARN"
        }

         const nominatimResult = {
            // It couldn't find it by region
            "scrapeType":"byCity",
             "result":[
                 {"place_id":144762788,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":240119835,"lat":"48.1390796","lon":"15.6944672","category":"place","type":"hamlet","place_rank":20,"importance":0.25000999999999995,"addresstype":"hamlet","name":"Auern","display_name":"Auern, Gemeinde Pyhra, Bezirk St. Pölten, Lower Austria, 3143, Austria","address":{"hamlet":"Auern","city":"Gemeinde Pyhra","county":"Bezirk St. Pölten","state":"Lower Austria","ISO3166-2-lvl4":"AT-3","postcode":"3143","country":"Austria","country_code":"at"},"boundingbox":["48.1190796","48.1590796","15.6744672","15.7144672"],"subdivisionCode":"3","sourceUrl":"https://www.openstreetmap.org/node/240119835#map=12/48.1390796/15.6944672"},
                 // The correct result, but without region, because this isn't set in OpenStreetMap
                 {"place_id":89686151,"licence":"Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright","osm_type":"node","osm_id":240120105,"lat":"47.9787604","lon":"14.1179411","category":"place","type":"hamlet","place_rank":20,"importance":0.25000999999999995,"addresstype":"hamlet","name":"Auern","display_name":"Auern, Nußbach, Bezirk Kirchdorf, 4542, Austria","address":{"hamlet":"Auern","village":"Nußbach","county":"Bezirk Kirchdorf","postcode":"4542","country":"Austria","country_code":"at"},"boundingbox":["47.9587604","47.9987604","14.0979411","14.1379411"],"sourceUrl":"https://www.openstreetmap.org/node/240120105#map=12/47.9787604/14.1179411"}
             ]
        }

        const validateMessage = await validateCoordinates(csvEntry, nominatimResult)
        expect(validateMessage).undefined
    })
})

// TODO: This is correct: it's not in HT
//  https://unlocode.info/BSGTC: (Green Turtle Cay): No Green Turtle Cay found in HT! Green Turtle Cay (undefined) does exist at the provided coordinates, so the region should probably be changed to undefined..
//  However, this isn't correct:
//  https://unlocode.info/ATARN: (Auern): No Auern found in 4! Auern (undefined) does exist at the provided coordinates, so the region should probably be changed to undefined. It could also be that Auern in 3 is meant.
//  That one is just fine: it doesn't doesn't have a region in Nominatim. Let's ignore both cases.