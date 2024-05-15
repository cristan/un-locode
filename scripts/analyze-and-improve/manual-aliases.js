// Sometimes you basically have the same unlocode twice. In almost all of these cases, one is correct and the other is incorrectly spelled.

export const ALIASES = {
    SKJAO: "SKJSV", // Jasova => Jasová
    AOVPE: "AONGV", // Ongiva => Ondjiva
    NLBNK: "NLBUK", // Bunnink => Bunnik
    NLBEW: "NLBLW", // Beiswijk => Bleiswijk
    ZAGNB: "ZAGAA", // Gans Bay => Gansbaai
    PKQCT: "PKBQM", // Qasim International Container Terminal/Karachi => Muhammad Bin Qasim/Karachi
    USLMW: "USXHQ", // Lakemills => Lake Mills
    USDFN: "USDU5", // Both called "De Funiak Springs"
    ARPNL: "ARBHI", // Puerto Nacional/Bahia Blanca => Bahía Blanca
    ATWDD: "ATWSS", // Weissenstein ob der Drau => Weissenstein
    AUCAL: "AUCUD", // Caloundra Head => Caloundra
    AUWEH: "AUWPA", // Wetherhill => Wetherill Park
    BGGOV: "BGGOZ", // Gorna Oryahovica => Gorna Oryakhovitsa (which should probably be named Gorna Oryahovitsa)
    BGIPR: "BGISP", // Isperikh => Isperih
    RUKDT: "RUOKR", // Kronshtadt => Kronstadt
    CZRPR: "CZRVR", // Roznov pod Radhosthem => Roznov pod Radhostem
    ECSDO: "ECSGO", // Santo Domingo de los Colorados => Santo Domingo
    ESBAZ: "ESBLZ", // Bazalote => Balazote
    ESCBB: "ESCLL", // Castilbisbal => Castellbisbal
    ESCRI: "ESZBA", // Cierbena => Zierbena
    ESEGD: "ESGAO", // El Gador => Gádor
    ESFJN: "ESFUZ", // Fuentejalon => Fuendejalón
    ESYAN: "ESGIS", // Gayanes => Gaianes
    ESGJI: "ESG9F", // Granja de San Idelfonso => La Granja de San Idelfonso
    ESGDX: "ES3SS", // Guadasuar => Guadassuar
    ESLJM: "ESZBV", // La Ametlla del Vall => L'Ametlla del Vallès
    ESLSF: "ESFQV", // Les Franquesese => Les Franqueses del Vallès
    ESLJQ: "ESZGT", // Les Presses => Les Preses
    ESLHP: "ESYOM", // Llombay => Llombai (wrong coordinates in the un/locode one)
    ESMXX: "ESM8Z", // Maraleda => Moraleda de Zafayona
    ESMXH: "ESMRL", // Maraleja => Moraleja
    ESMDB: "ESVOL", // Massies de Voltregà => Las Masías de Voltregá
    ESMFH: "ESGIB", // Menjibar => Mengibar
    ESMBC: "ESMOE", // Mollerusa => Mollerussa
    ESMJU: "ESHUV", // Muelva => Huelva
    ESPDZ: "ESLPD", // Pedraneras => Las Pedroñeras
    ESPNR: "ESPVO", // Penarrolla => Peñarroya Pueblonuevo
    ESPBN: "ESPBG", // Pueblo Nuevo del Guadian => Pueblonuevo del Guadiana
    ESPSM: "ESESM", // Puerto de Santa Maria => El Puerto de Santa María
    ESRDP: "ESPGO", // Renedo de Pielago => Pielagos (though the real name is Renedo de Piélagos)
    ESSDB: "ESADQ", // San Andreas de La Barca => San Andrés de la Barca (though the real name is Sant Andreu de la Barca)
    ESSBG: "ESZLU", // San Bartolome D/Grau => Sant Bartomeu del Grau
    ESSJM: "ESJDM", // San Juan D Moro => Sant Joan De Moró
    ESSJN: "ESSJX", // San Juan de Nivea => San Juan de Nieva
    ESSJF: "ESSJL", // San Juan Le Fonts => Sant Joan Les Fonts
    INWGC: "INWRA", // Warrangal => Warangal
    ESSQU: "ESSQV", // San Quirico Del Vall => Sant Quirze del Valles
    ESZLR: "ESSQV", // Sant Quirze Valles => Sant Quirze del Valles
    ESSSR: "ESZLT", // San Sebastian D/L Reyes => San Sebastian de los Reyes
    INVIG: "INVTZ", // Vizagapatanam => Visakhapatnam
    INUMB: "INUMG", // Umbergoan => Umbergaon
    INTRZ: "INTRI", // Tiruchirapalli => Tiruchirappalli
    GBLEW: "GBEDG", // Edgeware => Edgware? One is in Harrow (HRW) and the other is in London, City of (LND), but I'm pretty sure it's the same thing.
    GBKRA: "GBKKD", // Kilkardy => Kirkcaldy
    GBGDF: "GBDRF", // Great Driffield => Driffield
    GBOAK: "GBOKM", // Oakhamness => Oakham
    GBMBN: "GBWIM", // Wimeborne => Wimborne Minster

    // No mistakes, but entries which are parts of another entry
    ZAGTY: "ZAELS", // Gately is in East London (Oos-Londen)
    MYLPK: "MYPKG", // Is the Northport of Port Klang
}
