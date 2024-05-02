// Sometimes you basically have the same unlocode twice. In pretty much all of these cases, this is a mistake.

export const ALIASES = {
    SKJAO: "SKJSV", // Jasova => Jasová
    AOVPE: "AONGV", // Ongiva => Ondjiva
    NLBNK: "NLBUK", // Bunnink => Bunnik
    NLBEW: "NLBLW", // Beiswijk => Bleiswijk
    ZAGNB: "ZAGAA", // Gans Bay => Gansbaai
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
    PKQCT: "PKBQM", // Qasim International Container Terminal/Karachi => Muhammad Bin Qasim/Karachi

    // No mistakes, but entries which are parts of another entry
    ZAGTY: "ZAELS", // Gately is in East London (Oos-Londen)
    MYLPK: "MYPKG", // Is the Northport of Port Klang
}
