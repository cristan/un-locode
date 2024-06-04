// Entries which have been deleted by now, but the old (already deleted) entry is still used in the wild

export const DELETIONS_STILL_IN_USE = {
    CNTAG: "CNTAC", // Taicang Port
    VNCMP: "VNTOT", // Cai Mep
    CNQYN: "CNQGY", // Qingyuan
    THSPR: "THSAP", // Samut Prakan
    CNTIZ: "CNTZO", // Taizhou

    //TODO: currently buggy, doesn't generate the coordinates of Hong Kong.
    HITHK: "HKHKG", // Terminal code of Hong Kong Int'l Terminals (so not even a UNLOCODE) => Hong Kong
}