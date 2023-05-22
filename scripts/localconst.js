export const SFLOCALCONSTS = {
    CACHE_FILE: "CompendiumCache.json",
    SPELL_CACHE_FILE: "spellsbylevel_cache.json",
    GENERAL_CACHE_FILE: "general_cache.json",
    MONSTER_CACHE_FILE_FORMAT: "##creaturetype##_creature_cache.json",
    ITEM_CACHE_FILE: "item_cache.json",
    CACHE_FOLDER: "dnd-randomizer",
    ENCOUNTER_DIFFICULTY_XP_TABLES: {
        "easy": [25, 50, 75, 125, 250, 300, 350, 450, 550, 600, 800, 1000, 1100, 1250, 1400, 1600, 2000, 2100, 2400, 2800],
        'medium': [50, 100, 150, 250, 500, 600, 750, 900, 1100, 1200, 1600, 2000, 2200, 2500, 2800, 3200, 3900, 4200, 4900, 5700],
        'hard': [75, 150, 225, 375, 750, 900, 1100, 1400, 1600, 1900, 2400, 3000, 3400, 3800, 4300, 4800, 5900, 6300, 7300, 8500],
        'deadly': [100, 200, 400, 500, 1100, 1400, 1700, 2100, 2400, 2800, 3600, 4500, 5100, 5700, 6400, 7200, 8800, 9500, 10900, 12700],
    },
    ENCOUNTER_MONSTER_MULTIPLIERS: {
        "0": 0,
        "1": 1,
        "2": 1.5,
        "3": 2,
        "7": 2.5,
        "11": 3,
        "15": 4,
    },
    ENCOUNTER_XP_CHALLENGE_RATING_MAPPING: {
        "0": 10,
        ".125": 25,
        ".25": 50,
        ".5": 100,
        "1": 200,
        "2": 450,
        "3": 700,
        "4": 1100,
        "5": 1800,
        "6": 2300,
        "7": 2900,
        "8": 3900,
        "9": 5000,
        "10": 5900,
        "11": 7200,
        "12": 8400,
        "13": 10000,
        "14": 11500,
        "15": 13000,
        "16": 15000,
        "17": 18000,
        "18": 20000,
        "19": 22000,
        "20": 25000,
        "21": 33000,
        "22": 41000,
        "23": 50000,
        "24": 62000,
        "25": 75000,
        "26": 90000,
        "27": 105000,
        "28": 120000,
        "29": 135000,
        "30": 155000,
    },
    ENCOUNTER_INDIVIDUAL_TREASURE_CR4: {
        "01-30": ["5d6", "", "", "", ""],
        "31-60": ["", "4d6", "", "", ""],
        "61-70": ["", "", "3d6", "", ""],
        "71-95": ["", "", "", "2d6", ""],
        "96-100": ["", "", "", "", "1d6"],
    },
    ENCOUNTER_INDIVIDUAL_TREASURE_CR10: {
        "01-30": ["4d6 x 100", "", "1d6 x 10", "", ""],
        "31-60": ["", "6d6 x 10", "", "2d6 x 10", ""],
        "61-70": ["", "", "3d6 x 10", "2d6 x 10", ""],
        "71-95": ["", "", "", "4d6 x 10", ""],
        "96-100": ["", "", "", "2d6 x 10", "3d6"],
    },
    ENCOUNTER_INDIVIDUAL_TREASURE_CR16: {
        "01-20": ["", "4d6 x 100", "", "1d6 x 100", ""],
        "21-35": ["", "", "1d6 x 100", "1d6 x 100", ""],
        "36-75": ["", "", "", "2d6 x 100", "1d6 x 10"],
        "76-100": ["", "", "", "2d6 x 100", "2d6 x 10"],
    },
    ENCOUNTER_INDIVIDUAL_TREASURE_CR17_PLUS: {
        "01-15": ["", "", "2d6 x 1000", "8d6 x 100", ""],
        "16-55": ["", "", "", "1d6 x 1000", "1d6 x 100"],
        "56-100": ["", "", "", "1d6 x 1000", "2d6 x 100"],
    },
    ENCOUNTER_TREASURE_HORDE_CR4: {
        "01-06": ["", ""],
        "07-16": ["2d6 10 gp gems", ""],
        "17-26": ["2d4 25 gp art objects", ""],
        "27-36": ["2d6 50 gp gems", ""],
        "37-44": ["2d6 10 gp gems", "Roll 1d6 times on Magic Item Table A."],
        "45-52": ["2d4 25 gp art objects", "Roll 1d6 times on Magic Item Table A."],
        "53-60": ["2d6 50 gp gems", "Roll 1d6 times on Magic Item Table A."],
        "61-65": ["2d6 10 gp gems", "Roll 1d4 times on Magic Item Table B."],
        "66-70": ["2d4 25 gp art objects", "Roll 1d4 times on Magic Item Table B."],
        "71-75": ["2d6 50 gp gems", "Roll 1d4 times on Magic Item Table B."],
        "76-78": ["2d6 10 gp gems", "Roll 1d4 times on Magic Item Table C."],
        "79-80": ["2d4 25 gp art objects", "Roll 1d4 times on Magic Item Table C."],
        "81-85": ["2d6 50 gp gems", "Roll 1d4 times on Magic Item Table C."],
        "86-92": ["2d4 25 gp art objects", "Roll 1d4 times on Magic Item Table F."],
        "93-97": ["2d6 50 gp gems", "Roll 1d4 times on Magic Item Table F."],
        "98-99": ["2d4 25 gp art objects", "Roll 1d1 on Magic Item Table G."],
        "100": ["2d6 50 gp gems", "Roll 1d1 on Magic Item Table G."],
    },
    ENCOUNTER_TREASURE_HORDE_CR10: {
        "01-04": ["", ""],
        "05-10": ["2d4 25 gp art objects", ""],
        "11-16": ["3d6 50 gp gems", ""],
        "17-22": ["3d6 100 gp gems", ""],
        "23-28": ["2d4 250 gp art objects", ""],
        "29-32": ["2d4 25 gp art objects", "Roll 1d6 times on Magic Item Table A."],
        "33-36": ["3d6 50 gp gems", "Roll 1d6 times on Magic Item Table A."],
        "37-40": ["3d6 100 gp gems", "Roll 1d6 times on Magic Item Table A."],
        "41-44": ["2d4 250 gp art objects", "Roll 1d6 times on Magic Item Table A."],
        "45-49": ["2d4 25 gp art objects", "Roll 1d4 times on Magic Item Table B."],
        "50-54": ["3d6 50 gp gems", "Roll 1d4 times on Magic Item Table B."],
        "55-59": ["3d6 100 gp gems", "Roll 1d4 times on Magic Item Table B."],
        "60-63": ["2d4 250 gp art objects", "Roll 1d4 times on Magic Item Table B."],
        "64-66": ["2d4 25 gp art objects", "Roll 1d4 times on Magic Item Table C."],
        "67-69": ["3d6 50 gp gems", "Roll 1d4 times on Magic Item Table C."],
        "70-72": ["3d6 100 gp gems", "Roll 1d4 times on Magic Item Table C."],
        "73-74": ["2d4 250 gp art objects", "Roll 1d4 times on Magic Item Table C."],
        "75-76": ["2d4 25 gp art objects", "Roll 1d1 on Magic Item Table D."],
        "77-78": ["3d6 50 gp gems", "Roll 1d1 on Magic Item Table D."],
        "79": ["3d6 100 gp gems", "Roll 1d1 on Magic Item Table D."],
        "80": ["2d4 250 gp art objects", "Roll 1d1 on Magic Item Table D."],
        "81-84": ["2d4 25 gp art objects", "Roll 1d4 times on Magic Item Table F."],
        "85-88": ["3d6 50 gp gems", "Roll 1d4 times on Magic Item Table F."],
        "89-91": ["3d6 100 gp gems", "Roll 1d4 times on Magic Item Table F."],
        "92-94": ["2d4 250 gp art objects", "Roll 1d4 times on Magic Item Table F."],
        "95-96": ["3d6 100 gp gems", "Roll 1d4 times on Magic Item Table G."],
        "97-98": ["2d4 250 gp art objects", "Roll 1d4 times on Magic Item Table G."],
        "99": ["3d6 100 gp gems", "Roll 1d1 on Magic Item Table H."],
        "100": ["2d4 250 gp art objects", "Roll 1d1 on Magic Item Table H."],
    },
    ENCOUNTER_TREASURE_HORDE_CR16: {
        "01-03": ["", ""],
        "04-06": ["2d4 250 gp art objects", ""],
        "07-09": ["2d4 750 gp art objects", ""],
        "10-12": ["3d6 500 gp gems", ""],
        "13-15": ["3d6 1,000 gp gems", ""],
        "16-19": ["2d4 250 gp art objects", "Roll 1d4 times on Magic Item Table A and 1d6 times on Magic Item Table B."],
        "20-23": ["2d4 750 gp art objects", "Roll 1d4 times on Magic Item Table A and 1d6 times on Magic Item Table B."],
        "24-26": ["3d6 500 gp gems", "Roll 1d4 times on Magic Item Table A and 1d6 times on Magic Item Table B."],
        "27-29": ["3d6 1,000 gp gems", "Roll 1d4 times on Magic Item Table A and 1d6 times on Magic Item Table B."],
        "30-35": ["2d4 250 gp art objects", "Roll 1d6 times on Magic Item Table C."],
        "36-40": ["2d4 750 gp art objects", "Roll 1d6 times on Magic Item Table C."],
        "41-45": ["3d6 500 gp gems", "Roll 1d6 times on Magic Item Table C."],
        "46-50": ["3d6 1,000 gp gems", "Roll 1d6 times on Magic Item Table C."],
        "51-54": ["2d4 250 gp art objects", "Roll 1d4 times on Magic Item Table D."],
        "55-58": ["2d4 750 gp art objects", "Roll 1d4 times on Magic Item Table D."],
        "59-62": ["3d6 500 gp gems", "Roll 1d4 times on Magic Item Table D."],
        "63-66": ["3d6 1,000 gp gems", "Roll 1d4 times on Magic Item Table D."],
        "67-68": ["2d4 250 gp art objects", "Roll 1d1 on Magic Item Table E."],
        "69-70": ["2d4 750 gp art objects", "Roll 1d1 on Magic Item Table E."],
        "71-72": ["3d6 500 gp gems", "Roll 1d1 on Magic Item Table E."],
        "73-74": ["3d6 1,000 gp gems", "Roll 1d1 on Magic Item Table E."],
        "75-76": ["2d4 250 gp art objects", "Roll 1d1 on Magic Item Table F and 1d4 times on Magic Item Table G."],
        "77-78": ["2d4 750 gp art objects", "Roll 1d1 on Magic Item Table F and 1d4 times on Magic Item Table G."],
        "79-80": ["3d6 500 gp gems", "Roll 1d1 on Magic Item Table F and 1d4 times on Magic Item Table G."],
        "81-82": ["3d6 1,000 gp gems", "Roll 1d1 on Magic Item Table F and 1d4 times on Magic Item Table G."],
        "83-85": ["2d4 250 gp art objects", "Roll 1d4 times on Magic Item Table H."],
        "86-88": ["2d4 750 gp art objects", "Roll 1d4 times on Magic Item Table H."],
        "89-90": ["3d6 500 gp gems", "Roll 1d4 times on Magic Item Table H."],
        "91-92": ["3d6 1,000 gp gems", "Roll 1d4 times on Magic Item Table H."],
        "93-94": ["2d4 250 gp art objects", "Roll 1d1 on Magic Item Table I."],
        "95-96": ["2d4 750 gp art objects", "Roll 1d1 on Magic Item Table I."],
        "97-98": ["3d6 500 gp gems", "Roll 1d1 on Magic Item Table I."],
        "99-100": ["3d6 1,000 gp gems", "Roll 1d1 on Magic Item Table I."],
    },
    ENCOUNTER_TREASURE_HORDE_CR17_PLUS: {
        "01-04": ["", ""],
        "05-10": ["2d4 25 gp art objects", ""],
        "11-16": ["3d6 50 gp gems", ""],
        "17-22": ["3d6 100 gp gems", ""],
        "23-28": ["2d4 250 gp art objects", ""],
        "29-32": ["2d4 25 gp art objects", "Roll 1d6 times on Magic Item Table A."],
        "33-36": ["3d6 50 gp gems", "Roll 1d6 times on Magic Item Table A."],
        "37-40": ["3d6 100 gp gems", "Roll 1d6 times on Magic Item Table A."],
        "41-44": ["2d4 250 gp art objects", "Roll 1d6 times on Magic Item Table A."],
        "45-49": ["2d4 25 gp art objects", "Roll 1d4 times on Magic Item Table B."],
        "50-54": ["3d6 50 gp gems", "Roll 1d4 times on Magic Item Table B."],
        "55-59": ["3d6 100 gp gems", "Roll 1d4 times on Magic Item Table B."],
        "60-63": ["2d4 250 gp art objects", "Roll 1d4 times on Magic Item Table B."],
        "64-66": ["2d4 25 gp art objects", "Roll 1d4 times on Magic Item Table C."],
        "67-69": ["3d6 50 gp gems", "Roll 1d4 times on Magic Item Table C."],
        "70-72": ["3d6 100 gp gems", "Roll 1d4 times on Magic Item Table C."],
        "73-74": ["2d4 250 gp art objects", "Roll 1d4 times on Magic Item Table C."],
        "75-76": ["2d4 25 gp art objects", "Roll 1d1 on Magic Item Table D."],
        "77-78": ["3d6 50 gp gems", "Roll 1d1 on Magic Item Table D."],
        "79": ["3d6 100 gp gems", "Roll 1d1 on Magic Item Table D."],
        "80": ["2d4 250 gp art objects", "Roll 1d1 on Magic Item Table D."],
        "81-84": ["2d4 25 gp art objects", "Roll 1d4 times on Magic Item Table F."],
        "85-88": ["3d6 50 gp gems", "Roll 1d4 times on Magic Item Table F."],
        "89-91": ["3d6 100 gp gems", "Roll 1d4 times on Magic Item Table F."],
        "92-94": ["2d4 250 gp art objects", "Roll 1d4 times on Magic Item Table F."],
        "95-96": ["3d6 100 gp gems", "Roll 1d4 times on Magic Item Table G."],
        "97-98": ["2d4 250 gp art objects", "Roll 1d4 times on Magic Item Table G."],
        "99": ["3d6 100 gp gems", "Roll 1d1 on Magic Item Table H."],
        "100": ["2d4 250 gp art objects", "Roll 1d1 on Magic Item Table H."],
    },
    ENCOUNTER_TREASURE_10GP_GEMSTONES: {
        "1": "Azurite",
        "2": "Banded agate",
        "3": "Blue quartz",
        "4": "Eye agate",
        "5": "Hematite",
        "6": "Lapis lazuli",
        "7": "Malachite",
        "8": "Moss agate",
        "9": "Obsidian",
        "10": "Rhodochrosite",
        "11": "Tiger eye",
        "12": "Turquoise",
    },
    ENCOUNTER_TREASURE_50GP_GEMSTONES: {
        "1": "Bloodstone",
        "2": "Carnelian",
        "3": "Chalcedony",
        "4": "Chrysoprase",
        "5": "Citrine",
        "6": "Jasper",
        "7": "Moonstone",
        "8": "Onyx",
        "9": "Quartz",
        "10": "Sardonyx",
        "11": "Star rose quartz",
        "12": "Zircon",
    },
    ENCOUNTER_TREASURE_100GP_GEMSTONES: {
        "1": "Amber",
        "2": "Amethyst",
        "3": "Chrysoberyl",
        "4": "Coral",
        "5": "Garnet",
        "6": "Jade",
        "7": "Jet",
        "8": "Pearl",
        "9": "Spinel",
        "10": "Tourmaline",
    },
    ENCOUNTER_TREASURE_500GP_GEMSTONES: {
        "1": "Alexandrite",
        "2": "Aquamarine",
        "3": "Black pearl",
        "4": "Blue spinel",
        "5": "Peridot",
        "6": "Topaz",
    },
    ENCOUNTER_TREASURE_1000GP_GEMSTONES: {
        "1": "Black opal",
        "2": "Blue sapphire",
        "3": "Emerald",
        "4": "Fire opal",
        "5": "Opal",
        "6": "Star ruby",
        "7": "Star sapphire",
        "8": "Yellow sapphire",
    },
    ENCOUNTER_TREASURE_5000GP_GEMSTONES: {
        "1": "Black sapphire",
        "2": "Diamond",
        "3": "Jacinth",
        "4": "Ruby",
    },
    ENCOUNTER_TREASURE_25GP_ART_OBJECTS: {
        "1": "Silver ewer",
        "2": "Carved bone statuette",
        "3": "Small gold bracelet",
        "4": "Cloth-of-gold vestments",
        "5": "Black velvet mask stitched with silver thread",
        "6": "Copper chalice with silver filigree",
        "7": "Pair of engraved bone dice",
        "8": "Small mirror set in a painted wooden frame",
        "9": "Embroidered silk handkerchief",
        "10": "Gold locket with a painted portrait inside",
    },
    ENCOUNTER_TREASURE_250GP_ART_OBJECTS: {
        "1": "Gold ring set with bloodstones",
        "2": "Carved ivory statuette",
        "3": "Large gold bracelet",
        "4": "Silver necklace with a gemstone pendant",
        "5": "Bronze crown",
        "6": "Silk robe with gold embroidery",
        "7": "Large well-made tapestry",
        "8": "Brass mug with jade inlay",
        "9": "Box of turquoise animal figurines",
        "10": "Gold bird cage with electrum filigree",
    },
    ENCOUNTER_TREASURE_750GP_ART_OBJECTS: {
        "1": "Silver chalice set with moonstones",
        "2": "Silver-plated steel longsword with jet set in hilt",
        "3": "Carved harp of exotic wood with ivory inlay and zircon gems",
        "4": "Small gold idol",
        "5": "Gold dragon comb set with red garnets as eyes",
        "6": "Bottle stopper cork embossed with gold leaf and set with amethysts",
        "7": "Ceremonial electrum dagger with a black pearl in the pommel",
        "8": "Silver and gold brooch",
        "9": "Obsidian statuette with gold fittings and inlay",
        "10": "Painted gold war mask",
    },
    ENCOUNTER_TREASURE_2500GP_ART_OBJECTS: {
        "1": "Fine gold chain set with a fire opal",
        "2": "Old masterpiece painting",
        "3": "Embroidered silk and velvet mantle set with numerous moonstones",
        "4": "Platinum bracelet set with a sapphire",
        "5": "Embroidered glove set with jewel chips",
        "6": "Jeweled anklet",
        "7": "Gold music box",
        "8": "Gold circlet set with four aquamarines",
        "9": "Eye patch with a mock eye set in blue sapphire and moonstone",
        "10": "A necklace string of small pink pearls",
    },
    ENCOUNTER_TREASURE_7500GP_ART_OBJECTS: {
        "1": "Jeweled gold crown",
        "2": "Jeweled platinum ring",
        "3": "Small gold statuette set with rubies",
        "4": "Gold cup set with emeralds",
        "5": "Gold jewelry box with platinum filigree",
        "6": "Painted gold child’s sarcophagus",
        "7": "Jade game board with solid gold playing pieces",
        "8": "Bejeweled ivory drinking horn with gold filigree",
    },
    MAGIC_ITEM_TABLE_A: {
        "01-50": "Potion of healing",
        "51-60": "Spell scroll (cantrip)",
        "61-70": "Potion of climbing",
        "71-90": "Spell scroll (1st level)",
        "91-94": "Spell scroll (2nd level)",
        "95-98": "Potion of healing (greater)",
        "99": "Bag of holding",
        "100": "Driftglobe",
    },
    MAGIC_ITEM_TABLE_B: {
        "01-15": "Potion of healing (greater)",
        "16-22": "Potion of fire breath",
        "23-29": "Potion of resistance",
        "30-34": "Ammunition, +1",
        "35-39": "Potion of animal friendship",
        "40-44": "Potion of hill giant strength",
        "45-49": "Potion of growth",
        "50-54": "Potion of water breathing",
        "55-59": "Spell scroll (2nd level)",
        "60-64": "Spell scroll (3rd level)",
        "65-67": "Bag of holding",
        "68-70": "Keoghtom’s ointment",
        "71-73": "Oil of slipperiness",
        "74-75": "Dust of disappearance",
        "76-77": "Dust of dryness",
        "78-79": "Dust of sneezing and choking",
        "80-81": "Elemental gem",
        "82-83": "Philter of love",
        "84": "Alchemy jug",
        "85": "Cap of water breathing",
        "86": "Cloak of the manta ray",
        "87": "Driftglobe",
        "88": "Goggles of night",
        "89": "Helm of comprehending languages",
        "90": "Immovable rod",
        "91": "Lantern of revealing",
        "92": "Mariner’s armor",
        "93": "Mithral armor",
        "94": "Potion of poison",
        "95": "Ring of swimming",
        "96": "Robe of useful items",
        "97": "Rope of climbing",
        "98": "Saddle of the cavalier",
        "99": "Wand of magic detection",
        "100": "Wand of secrets",
    },
    MAGIC_ITEM_TABLE_C: {
        "01-15": "Potion of healing (superior)",
        "16-22": "Spell scroll (4th level)",
        "23-27": "Ammunition, +2",
        "28-32": "Potion of clairvoyance",
        "33-37": "Potion of diminution",
        "38-42": "Potion of gaseous form",
        "43-47": "Potion of frost giant strength",
        "48-52": "Potion of stone giant strength",
        "53-57": "Potion of heroism",
        "58-62": "Potion of invulnerability",
        "63-67": "Potion of mind reading",
        "68-72": "Spell scroll (5th level)",
        "73-75": "Elixir of health",
        "76-78": "Oil of etherealness",
        "79-81": "Potion of fire giant strength",
        "82-84": "Quaal’s feather token",
        "85-87": "Scroll of protection",
        "88-89": "Bag of beans",
        "90-91": "Bead of force",
        "92": "Chime of opening",
        "93": "Decanter of endless water",
        "94": "Eyes of minute seeing",
        "95": "Folding boat",
        "96": "Heward’s handy haversack",
        "97": "Horseshoes of speed",
        "98": "Necklace of fireballs",
        "99": "Periapt of health",
        "100": "Sending stones",
    },
    MAGIC_ITEM_TABLE_D: {
        "01-20": "Potion of healing (supreme)",
        "21-30": "Potion of invisibility",
        "31-40": "Potion of speed",
        "41-50": "Spell scroll (6th level)",
        "51-57": "Spell scroll (7th level)",
        "58-62": "Ammunition, +3",
        "63-67": "Oil of sharpness",
        "68-72": "Potion of flying",
        "73-77": "Potion of cloud giant strength",
        "78-82": "Potion of longevity",
        "83-87": "Potion of vitality",
        "88-92": "Spell scroll (8th level)",
        "93-95": "Horseshoes of a zephyr",
        "96-98": "Nolzur’s marvelous pigments",
        "99": "Bag of devouring",
        "100": "Portable hole",
    },
    MAGIC_ITEM_TABLE_E: {
        "01-30": "Spell scroll (8th level)",
        "31-55": "Potion of storm giant strength",
        "56-70": "Potion of healing (supreme)",
        "71-85": "Spell scroll (9th level)",
        "86-93": "Universal solvent",
        "94-98": "Arrow of slaying",
        "99-100": "Sovereign glue",
    },
    MAGIC_ITEM_TABLE_F: {
        "01-15": "Weapon, +1",
        "16-18": "Shield, +1",
        "19-21": "Sentinel shield",
        "22-23": "Amulet of proof against detection and location",
        "24-25": "Boots of elvenkind",
        "26-27": "Boots of striding and springing",
        "28-29": "Bracers of archery",
        "30-31": "Brooch of shielding",
        "32-33": "Broom of flying",
        "34-35": "Cloak of elvenkind",
        "36-37": "Cloak of protection",
        "38-39": "Gauntlets of ogre power",
        "40-41": "Hat of disguise",
        "42-43": "Javelin of lightning",
        "44-45": "Pearl of power",
        "46-47": "Rod of the pact keeper, +1",
        "48-49": "Slippers of spider climbing",
        "50-51": "Staff of the adder",
        "52-53": "Staff of the python",
        "54-55": "Sword of vengeance",
        "56-57": "Trident of fish command",
        "58-59": "Wand of magic missiles",
        "60-61": "Wand of the war mage, +1",
        "62-63": "Wand of web",
        "64-65": "Weapon of warning",
        "66": "Adamantine armor (chain mail)",
        "67": "Adamantine armor (chain shirt)",
        "68": "Adamantine armor (scale mail)",
        "69": "Bag of tricks (gray)",
        "70": "Bag of tricks (rust)",
        "71": "Bag of tricks (tan)",
        "72": "Boots of the winterlands",
        "73": "Circlet of blasting",
        "74": "Deck of illusions",
        "75": "Eversmoking bottle",
        "76": "Eyes of charming",
        "77": "Eyes of the eagle",
        "78": "Figurine of wondrous power (silver raven)",
        "79": "Gem of brightness",
        "80": "Gloves of missile snaring",
        "81": "Gloves of swimming and climbing",
        "82": "Gloves of thievery",
        "83": "Headband of intellect",
        "84": "Helm of telepathy",
        "85": "Instrument of the bards (Doss lute)",
        "86": "Instrument of the bards (Fochlucan bandore)",
        "87": "Instrument of the bards (Mac-Fuimidh cittern)",
        "88": "Medallion of thoughts",
        "89": "Necklace of adaptation",
        "90": "Periapt of wound closure",
        "91": "Pipes of haunting",
        "92": "Pipes of the sewers",
        "93": "Ring of jumping",
        "94": "Ring of mind shielding",
        "95": "Ring of warmth",
        "96": "Ring of water walking",
        "97": "Quiver of Ehlonna",
        "98": "Stone of good luck (luckstone)",
        "99": "Wind fan",
        "100": "Winged boots",
    },
    MAGIC_ITEM_TABLE_G: {
        "01-11": "Weapon, +2",
        "12-14": "Figurine of wondrous power (roll d8)",
        "15": "Adamantine armor (breastplate)",
        "16": "Adamantine armor (splint)",
        "17": "Amulet of health",
        "18": "Armor of vulnerability",
        "19": "Arrow-catching shield",
        "20": "Belt of dwarvenkind",
        "21": "Belt of hill giant strength",
        "22": "Berserker axe",
        "23": "Boots of levitation",
        "24": "Boots of speed",
        "25": "Bowl of commanding water elementals",
        "26": "Bracers of defense",
        "27": "Brazier of commanding fire elementals",
        "28": "Cape of the mountebank",
        "29": "Censer of controlling air elementals",
        "30": "Armor, +1 chain mail",
        "31": "Armor of resistance (chain mail)",
        "32": "Armor, +1 chain shirt",
        "33": "Armor of resistance (chain shirt)",
        "34": "Cloak of displacement",
        "35": "Cloak of the bat",
        "36": "Cube of force",
        "37": "Daern’s instant fortress",
        "38": "Dagger of venom",
        "39": "Dimensional shackles",
        "40": "Dragon slayer",
        "41": "Elven chain",
        "42": "Flame tongue",
        "43": "Gem of seeing",
        "44": "Giant slayer",
        "45": "Glamoured studded leather",
        "46": "Helm of teleportation",
        "47": "Horn of blasting",
        "48": "Horn of Valhalla (silver or brass)",
        "49": "Instrument of the bards (Canaith mandolin)",
        "50": "Instrument of the bards (Cli lyre)",
        "51": "Ioun stone (awareness)",
        "52": "Ioun stone (protection)",
        "53": "Ioun stone (reserve)",
        "54": "Ioun stone (sustenance)",
        "55": "Iron bands of Bilarro",
        "56": "Armor, +1 leather",
        "57": "Armor of resistance (leather)",
        "58": "Mace of disruption",
        "59": "Mace of smiting",
        "60": "Mace of terror",
        "61": "Mantle of spell resistance",
        "62": "Necklace of prayer beads",
        "63": "Periapt of proof against poison",
        "64": "Ring of animal influence",
        "65": "Ring of evasion",
        "66": "Ring of feather falling",
        "67": "Ring of free action",
        "68": "Ring of protection",
        "69": "Ring of resistance",
        "70": "Ring of spell storing",
        "71": "Ring of the ram",
        "72": "Ring of X-ray vision",
        "73": "Robe of eyes",
        "74": "Rod of rulership",
        "75": "Rod of the pact keeper, +2",
        "76": "Rope of entanglement",
        "77": "Armor, +1 scale mail",
        "78": "Armor of resistance (scale mail)",
        "79": "Shield, +2",
        "80": "Shield of missile attraction",
        "81": "Staff of charming",
        "82": "Staff of healing",
        "83": "Staff of swarming insects",
        "84": "Staff of the woodlands",
        "85": "Staff of withering",
        "86": "Stone of controlling earth elementals",
        "87": "Sun blade",
        "88": "Sword of life stealing",
        "89": "Sword of wounding",
        "90": "Tentacle rod",
        "91": "Vicious weapon",
        "92": "Wand of binding",
        "93": "Wand of enemy detection",
        "94": "Wand of fear",
        "95": "Wand of fireballs",
        "96": "Wand of lightning bolts",
        "97": "Wand of paralysis",
        "98": "Wand of the war mage, +2",
        "99": "Wand of wonder",
        "100": "Wings of flying",
    },
    MAGIC_ITEM_TABLE_H: {
        "01-10": "Weapon, +3",
        "11-12": "Amulet of the planes",
        "13-14": "Carpet of flying",
        "15-16": "Crystal ball (very rare version)",
        "17-18": "Ring of regeneration",
        "19-20": "Ring of shooting stars",
        "21-22": "Ring of telekinesis",
        "23-24": "Robe of scintillating colors",
        "25-26": "Robe of stars",
        "27-28": "Rod of absorption",
        "29-30": "Rod of alertness",
        "31-32": "Rod of security",
        "33-34": "Rod of the pact keeper, +3",
        "35-36": "Scimitar of speed",
        "37-38": "Shield, +3",
        "39-40": "Staff of fire",
        "41-42": "Staff of frost",
        "43-44": "Staff of power",
        "45-46": "Staff of striking",
        "47-48": "Staff of thunder and lightning",
        "49-50": "Sword of sharpness",
        "51-52": "Wand of polymorph",
        "53-54": "Wand of the war mage, +3",
        "55": "Adamantine armor (half plate)",
        "56": "Adamantine armor (plate)",
        "57": "Animated shield",
        "58": "Belt of fire giant strength",
        "59": "Belt of frost giant strength (or stone)",
        "60": "Armor, +1 breastplate",
        "61": "Armor of resistance (breastplate)",
        "62": "Candle of invocation",
        "63": "Armor, +2 chain mail",
        "64": "Armor, +2 chain shirt",
        "65": "Cloak of arachnida",
        "66": "Dancing sword",
        "67": "Demon armor",
        "68": "Dragon scale mail",
        "69": "Dwarven plate",
        "70": "Dwarven thrower",
        "71": "Efreeti bottle",
        "72": "Figurine of wondrous power (obsidian steed)",
        "73": "Frost brand",
        "74": "Helm of brilliance",
        "75": "Horn of Valhalla (bronze)",
        "76": "Instrument of the bards (Anstruth harp)",
        "77": "Ioun stone (absorption)",
        "78": "Ioun stone (agility)",
        "79": "Ioun stone (fortitude)",
        "80": "Ioun stone (insight)",
        "81": "Ioun stone (intellect)",
        "82": "Ioun stone (leadership)",
        "83": "Ioun stone (strength)",
        "84": "Armor, +2 leather",
        "85": "Manual of bodily health",
        "86": "Manual of gainful exercise",
        "87": "Manual of golems",
        "88": "Manual of quickness of action",
        "89": "Mirror of life trapping",
        "90": "Nine lives stealer",
        "91": "Oathbow",
        "92": "Armor, +2 scale mail",
        "93": "Spellguard shield",
        "94": "Armor, +1 splint",
        "95": "Armor of resistance (splint)",
        "96": "Armor, +1 studded leather",
        "97": "Armor of resistance (studded leather)",
        "98": "Tome of clear thought",
        "99": "Tome of leadership and influence",
        "100": "Tome of understanding",
    },
    MAGIC_ITEM_TABLE_I: {
        "01-05": "Defender",
        "06-10": "Hammer of thunderbolts",
        "11-15": "Luck blade",
        "16-20": "Sword of answering",
        "21-23": "Holy avenger",
        "24-26": "Ring of djinni summoning",
        "27-29": "Ring of invisibility",
        "30-32": "Ring of spell turning",
        "33-35": "Rod of lordly might",
        "36-38": "Staff of the magi",
        "39-41": "Vorpal sword",
        "42-43": "Belt of cloud giant strength",
        "44-45": "Armor, +2 breastplate",
        "46-47": "Armor, +3 chain mail",
        "48-49": "Armor, +3 chain shirt",
        "50-51": "Cloak of invisibility",
        "52-53": "Crystal ball (legendary version)",
        "54-55": "Armor, +1 half plate",
        "56-57": "Iron flask",
        "58-59": "Armor, +3 leather",
        "60-61": "Armor, +1 plate",
        "62-63": "Robe of the archmagi",
        "64-65": "Rod of resurrection",
        "66-67": "Armor, +1 scale mail",
        "68-69": "Scarab of protection",
        "70-71": "Armor, +2 splint",
        "72-73": "Armor, +2 studded leather",
        "74-75": "Well of many worlds",
        "76": "Magic armor (roll d12)",
        "77": "Apparatus of Kwalish",
        "78": "Armor of invulnerability",
        "79": "Belt of storm giant strength",
        "80": "Cubic gate",
        "81": "Deck of many things",
        "82": "Efreeti chain",
        "83": "Armor of resistance (half plate)",
        "84": "Horn of Valhalla (iron)",
        "85": "Instrument of the bards (Ollamh harp)",
        "86": "Ioun stone (greater absorption)",
        "87": "Ioun stone (mastery)",
        "88": "Ioun stone (regeneration)",
        "89": "Plate armor of etherealness",
        "90": "Armor of resistance (plate)",
        "91": "Ring of air elemental command",
        "92": "Ring of earth elemental command",
        "93": "Ring of fire elemental command",
        "94": "Ring of three wishes",
        "95": "Ring of water elemental command",
        "96": "Sphere of annihilation",
        "97": "Talisman of pure good",
        "98": "Talisman of the sphere",
        "99": "Talisman of ultimate evil",
        "100": "Tome of the stilled tongue",
    },
    MAGIC_ITEM_FIGURINE_OF_WONDEROUS_POWER_TABLE: {
        "1": "Figurine of wondrous power (Bronze griffon)",
        "2": "Figurine of wondrous power (Ebony fly)",
        "3": "Figurine of wondrous power (Golden lions)",
        "4": "Figurine of wondrous power (Ivory goats)",
        "5": "Figurine of wondrous power (Marble elephant)",
        "6-7": "Figurine of wondrous power (Onyx dog)",
        "8": "Figurine of wondrous power (Serpentine owl)",
    },
    MAGIC_ITEM_MAGIC_ARMOR_TABLE: {
        "1-2": "Armor, +2 half plate",
        "3-4": "Armor, +2 plate",
        "5-6": "Armor, +3 studded leather",
        "7-8": "Armor, +3 breastplate",
        "9-10": "Armor, +3 splint",
        "11": "Armor, +3 half plate",
        "12": "Armor, +3 plate",
    },
    DND5E_ENCOUNTER_TYPE_DESCRIPTIONS: {
        // Formula format ["1:.3*x","2:.1*x"] - This will create an encounter with 1 creature that is 30% of target XP and 2 creatures that are 10% target XP
        "Single BBEG": ["1:1*x"],
        "BBEG + 2 Minions": ["1:0.3*x", "2:0.1*x"],
        "2 Semi-BBEG": ["2:0.3333*x"],
        "BBEG + Monster horde": ["1:0.3*x", "5:0.04*x"],
        "BBEG + Random monster horde": ["1:0.3*x", "1:0.04*x", "1:0.04*x", "1:0.04*x", "1:0.04*x", "1:0.04*x"],
        "Monster horde": ["6:0.08333*x"],
        "Random monster horde": ["1:0.08333*x", "1:0.08333*x", "1:0.08333*x", "1:0.08333*x", "1:0.08333*x", "1:0.08333*x"],
        "Random": ["*"],
    },
    SYSTEM_VARIABLES: {
        // Object is for actor
        "CreatureType": {
            "dnd5e": "data.data.details.type.value",
            "pf2e": "data.data.details.creatureType",
        },
        // Object is for spell
        "SpellLevel": {
            "dnd5e": "labels.level",
            "pf2e": "level",
        },
        // Object is for actor
        "CreatureXP": {
            "dnd5e": "data.data.details.xp.value",
            "pf2e": "level",
        }
    },
    SYSTEM_VARIABLES_V10: {
        // Object is for actor
        "CreatureType": {
            "dnd5e": "system.details.type.value",
            "pf2e": "system.details.creatureType",
        },
        // Object is for spell
        "SpellLevel": {
            "dnd5e": "labels.level",
            "pf2e": "level",
        },
        // Object is for actor
        "CreatureXP": {
            "dnd5e": "details.xp.value",
            "pf2e": "level",
        },
        "ItemRarity": {
            "dnd5e": "system.rarity",
            "pf2e": "system.traits.rarity"
        },
        "LootActorType": {
            "dnd5e": "npc",
            "pf2e": "loot"
        }
    },
    SYSTEM_VARIABLES_V11: {
        // Object is for actor
        "CreatureType": {
            "dnd5e": "system.details.type.value",
            "pf2e": "system.details.creatureType",
        },
        // Object is for spell
        "SpellLevel": {
            "dnd5e": "labels.level",
            "pf2e": "level",
        },
        // Object is for actor
        "CreatureXP": {
            "dnd5e": "details.xp.value",
            "pf2e": "level",
        },
        "ItemRarity": {
            "dnd5e": "system.rarity",
            "pf2e": "system.traits.rarity"
        },
        "LootActorType": {
            "dnd5e": "npc",
            "pf2e": "loot"
        }
    },
    PATHFINDER_2E_ENCOUNTER_BUDGET: {
        // Key=Encounter Difficulty : Value=[XP Budget, Character Adjustment]
        "Trivial": [40, 10],
        "Low": [60, 15],
        "Moderate": [80, 20],
        "Severe": [120, 30],
        "Extreme": [160, 40],
    },
    PATHFINDER_2E_CREATURE_LEVEL_XP: {
        // Creature level in reference to PC level : Creature XP
        "-4": 10,
        "-3": 15,
        "-2": 20,
        "-1": 30,
        "0": 40,
        "1": 60,
        "2": 80,
        "3": 120,
        "4": 160,
    },
    PF2E_ENCOUNTER_TYPE_DESCRIPTIONS: {
        // Formula format ["1:2","4:-4"] - This will create an encounter with 1 creature that is 2 levels over party level and 4 creatures that are 4 levels below party level
        "Super Boss (Extreme)": { "EncounterFormula": ["1:4"], "EncounterDifficulty": "Extreme" },
        "Boss and Lackeys (Severe)": { "EncounterFormula": ["1:2", "4:-4"], "EncounterDifficulty": "Severe" },
        "Boss and Lieutenant (Severe)": { "EncounterFormula": ["1:2", "1:0"], "EncounterDifficulty": "Severe" },
        "Elite Enemies (Severe)": { "EncounterFormula": ["3:0"], "EncounterDifficulty": "Severe" },
        "Lieutenant and Lackeys (Moderate)": { "EncounterFormula": ["1:0", "4:-4"], "EncounterDifficulty": "Moderate" },
        "Mated Pair (Moderate)": { "EncounterFormula": ["2:0"], "EncounterDifficulty": "Moderate" },
        "Troop (Moderate)": { "EncounterFormula": ["1:0", "2:-2"], "EncounterDifficulty": "Moderate" },
        "Mook Squad (Moderate)": { "EncounterFormula": ["6:-4"], "EncounterDifficulty": "Low" },
    },
    PF2E_CURRENCY_TABLE: {
        //  Level:  [low, moderate, severe, extreme] amounts in gp
        "1": ["13", "18", "26", "35"],
        "2": ["23", "30", "45", "60"],
        "3": ["38", "50", "75", "100"],
        "4": ["65", "85", "130", "170"],
        "5": ["100", "135", "200", "270"],
        "6": ["150", "200", "300", "400"],
        "7": ["220", "290", "440", "580"],
        "8": ["300", "400", "600", "800"],
        "9": ["430", "570", "860", "1140"],
        "10": ["600", "800", "1200", "1600"],
        "11": ["865", "1150", "1725", "2300"],
        "12": ["1250", "1650", "2475", "3300"],
        "13": ["1875", "2500", "3750", "5000"],
        "14": ["2750", "3650", "5500", "7300"],
        "15": ["4100", "5450", "8200", "10900"],
        "16": ["6200", "8250", "12400", "16500"],
        "17": ["9600", "12800", "19200", "25600"],
        "18": ["15600", "20800", "31200", "41600"],
        "19": ["26600", "35500", "53250", "71000"],
        "20": ["36800", "49000", "73500", "9800"]
    },
    TOME_OF_BEASTS_CREATURE_ENVIRONMENT_MAPPING: {
        "Alquam, Demon Lord of Night": [
          "Any"
        ],
        "Chernomoi": [
          "Urban"
        ],
        "Manabane Scarab Swarm": [
          "Desert"
        ],
        "Moss Lurker": [
          "Forests",
          "Marshes",
          "Ruins & Underground"
        ],
        "Swamp Adder": [
          "Swamp"
        ],
        "J'ba Fofi Spider": [
          "Forests"
        ],
        "Herald of Blood": [
          "Any"
        ],
        "Wharfling Swarm": [
          "Aquatic"
        ],
        "Monolith Champion": [
          "Any"
        ],
        "Weeping Treant": [
          "Forests"
        ],
        "Eleinomae": [
          "Marshes"
        ],
        "Devilbound Gnomish Prince": [
          "Any"
        ],
        "Bagiennik": [
          "Forests",
          "Marshes"
        ],
        "Kikimora": [
          "Urban"
        ],
        "Tusked Skyfish": [
          "Hills",
          "Plains"
        ],
        "Young Mithral Dragon": [
          "Mountains"
        ],
        "Guardian": [
          "Any"
        ],
        "Thursir Giant": [
          "Any"
        ],
        "Shabti": [
          "Marshes",
          "Ruins & Underground"
        ],
        "Burrowling": [
          "Plains"
        ],
        "Cactid": [
          "Desert"
        ],
        "Xhkarsh": [
          "Any"
        ],
        "Boloti": [
          "Marshes"
        ],
        "Valkyrie": [
          "Any"
        ],
        "Jotun Giant": [
          "Hills",
          "Mountains",
          "Plains"
        ],
        "Ancient Wind Dragon": [
          "Mountains",
          "Plains"
        ],
        "Doppelrat": [
          "Ruins & Underground",
          "Urban"
        ],
        "Koralk (Harvester Devil)": [
          "Any"
        ],
        "Young Flame Dragon": [
          "Mountains",
          "Ruins & Underground"
        ],
        "Einherjar": [
          "Any"
        ],
        "Eel Hound": [
          "Aquatic"
        ],
        "Ancient Mithral Dragon": [
          "Mountains"
        ],
        "Mask Wight": [
          "Any"
        ],
        "Zmey Headling": [
          "Forests",
          "Marshes"
        ],
        "Glass Gator": [
          "Aquatic",
          "Marshes"
        ],
        "Lemurfolk (Kaguani)": [
          "Forests"
        ],
        "Asanbosam": [
          "Forests"
        ],
        "Ink Devil": [
          "Ruins & Underground",
          "Urban"
        ],
        "Feyward Tree": [
          "Any"
        ],
        "Bright Day (Baba Yaga's Horseman)": [
          "Any"
        ],
        "Monolith Footman": [
          "Any"
        ],
        "Domovoi": [
          "Desert",
          "Forests"
        ],
        "Rootlet Swarm": [
          "Desert",
          "Badlands"
        ],
        "Vine Troll Skeleton": [
          "Any"
        ],
        "Iron Ghoul": [
          "Ruins & Underground"
        ],
        "Bear King": [
          "Forests",
          "Hills"
        ],
        "Gerridae": [
          "Aquatic"
        ],
        "Child of the Briar": [
          "Forests"
        ],
        "Gug": [
          "Ruins & Underground"
        ],
        "Ancient Sea Dragon": [
          "Aquatic"
        ],
        "Deep One Hybrid Priest": [
          "Aquatic"
        ],
        "Sandman": [
          "Any"
        ],
        "Dullahan": [
          "Any"
        ],
        "Voidling": [
          "Any"
        ],
        "Shadhavar": [
          "Any"
        ],
        "Spider Thief": [
          "Any",
          "Urban"
        ],
        "Emerald Order Cult Leader": [
          "Any"
        ],
        "Ostinato": [
          "Any",
          "Ruins & Underground"
        ],
        "Sea Dragon Wyrmling": [
          "Aquatic"
        ],
        "Vine Lord": [
          "Forests"
        ],
        "Redcap": [
          "Forests",
          "Hills"
        ],
        "Orobas Devil": [
          "Any"
        ],
        "Living Wick": [
          "Ruins & Underground",
          "Urban"
        ],
        "Emerald Eye": [
          "Any"
        ],
        "Lake Troll": [
          "Aquatic"
        ],
        "Leshy": [
          "Forests"
        ],
        "Bandit Lord": [
          "Any"
        ],
        "Chort Devil": [
          "Any"
        ],
        "Scheznyki": [
          "Hills",
          "Ruins & Underground"
        ],
        "Sathaq Worm": [
          "Desert",
          "Marshes",
          "Ruins & Underground"
        ],
        "Vile Barber (Siabhra)": [
          "Any"
        ],
        "Grim Jester": [
          "Any"
        ],
        "Eala": [
          "Any"
        ],
        "Liosalfar": [
          "Any"
        ],
        "Chained Angel": [
          "Any"
        ],
        "Derro Shadow Antipaladin": [
          "Ruins & Underground"
        ],
        "Ngobou": [
          "Plains"
        ],
        "Loxoda": [
          "Forests",
          "Plains"
        ],
        "Frostveil": [
          "Hills",
          "Plains"
        ],
        "Apau Perape": [
          "Any"
        ],
        "Idolic Deity": [
          "Ruins & Underground"
        ],
        "Duskthorn Dryad": [
          "Forests"
        ],
        "Haugbui": [
          "Any"
        ],
        "Adult Rime Worm": [
          "Any"
        ],
        "Death Butterfly Swarm": [
          "Forests",
          "Plains"
        ],
        "Tendril Puppet": [
          "Forests"
        ],
        "Qwyllion": [
          "Any"
        ],
        "Star Drake": [
          "Hills",
          "Mountains"
        ],
        "Mirror Hag": [
          "Any"
        ],
        "Buraq": [
          "Any"
        ],
        "Vila": [
          "Forests"
        ],
        "Spark": [
          "Any"
        ],
        "Son of Fenris": [
          "Any"
        ],
        "Elvish Veteran Archer": [
          "Any"
        ],
        "Gnoll Havoc Runner": [
          "Desert",
          "Plains"
        ],
        "Mordant Snare": [
          "Ruins & Underground"
        ],
        "Clockwork Beetle Swarm": [
          "Any"
        ],
        "Alehouse Drake": [
          "Urban"
        ],
        "Psoglav Demon": [
          "Any"
        ],
        "Eonic Drifter": [
          "Any"
        ],
        "Clockwork Watchman": [
          "Urban"
        ],
        "Arboreal Grappler": [
          "Forests"
        ],
        "Stryx": [
          "Forests",
          "Urban"
        ],
        "Ushabti": [
          "Ruins & Underground"
        ],
        "Rust Drake": [
          "Ruins & Underground",
          "Urban"
        ],
        "Roachling Lord": [
          "Ruins & Underground",
          "Urban"
        ],
        "Witchlight": [
          "Any"
        ],
        "River King": [
          "Aquatic"
        ],
        "Aridni": [
          "Any"
        ],
        "Oozasis": [
          "Desert",
          "Marshes"
        ],
        "Wolf Reaver Dwarf": [
          "Any"
        ],
        "Sharkjaw Skeleton": [
          "Any"
        ],
        "Ghostwalk Spider": [
          "Badlands",
          "Forests"
        ],
        "Deep Drake": [
          "Ruins & Underground"
        ],
        "Void Dragon Wyrmling": [
          "Mountains"
        ],
        "Pombero": [
          "Forests"
        ],
        "Smaragdine Golem": [
          "Any"
        ],
        "Adult Void Dragon": [
          "Badlands",
          "Mountains"
        ],
        "Wormhearted Suffragan": [
          "Any"
        ],
        "Cikavak": [
          "Any"
        ],
        "Shroud": [
          "Any"
        ],
        "Deep One Archimandrite": [
          "Aquatic"
        ],
        "Firebird": [
          "Any"
        ],
        "Umbral Vampire": [
          "Any"
        ],
        "Gbahali (Postosuchus)": [
          "Plains"
        ],
        "Vapor Lynx": [
          "Marshes",
          "Plains"
        ],
        "Salt Devil": [
          "Desert"
        ],
        "Fate Eater": [
          "Any"
        ],
        "Snow Queen": [
          "Any"
        ],
        "Young Void Dragon": [
          "Mountains"
        ],
        "Horakh": [
          "Desert",
          "Plains",
          "Ruins & Underground"
        ],
        "Emperor of the Ghouls": [
          "Ruins & Underground",
          "Urban"
        ],
        "Algorith": [
          "Any"
        ],
        "Ramag": [
          "Plains",
          "Urban"
        ],
        "Lantern Dragonette": [
          "Forests"
        ],
        "Bone Swarm": [
          "Any"
        ],
        "Kongamato": [
          "Marshes",
          "Plains"
        ],
        "Selang": [
          "Badlands"
        ],
        "Ash Drake": [
          "Mountains",
          "Urban"
        ],
        "Blood Hag": [
          "Any"
        ],
        "Deep One": [
          "Aquatic"
        ],
        "Lunar Devil": [
          "Any"
        ],
        "Mi-Go": [
          "Any"
        ],
        "Adult Mithral Dragon": [
          "Mountains"
        ],
        "Deathcap Myconid": [
          "Forests",
          "Ruins & Underground"
        ],
        "Corrupted Ogre Chieftain": [
          "Badlands",
          "Hills",
          "Ruins & Underground"
        ],
        "Sandwyrm": [
          "Desert"
        ],
        "White Ape": [
          "Forests"
        ],
        "Malphas (Storm Crow)": [
          "Any"
        ],
        "Bukavac": [
          "Forests",
          "Marshes"
        ],
        "Rum Gremlin": [
          "Aquatic"
        ],
        "Miremal": [
          "Marshes"
        ],
        "Lich Hound": [
          "Any"
        ],
        "Salt Golem": [
          "Desert",
          "Aquatic"
        ],
        "Fext": [
          "Any"
        ],
        "Andrenjinyi": [
          "Any"
        ],
        "Queen of Witches": [
          "Any"
        ],
        "Lorelei": [
          "Aquatic"
        ],
        "Forest Hunter": [
          "Any"
        ],
        "Skitterhaunt": [
          "Desert",
          "Badlands",
          "Ruins & Underground"
        ],
        "Fidele Angel": [
          "Any"
        ],
        "Bereginyas": [
          "Mountains"
        ],
        "Firegeist": [
          "Any"
        ],
        "Soul Eater": [
          "Any"
        ],
        "Hound of the Night": [
          "Hills",
          "Plains",
          "Ruins & Underground"
        ],
        "Ghost Knight": [
          "Any"
        ],
        "Ychen Bannog": [
          "Forests",
          "Hills",
          "Mountains"
        ],
        "Greater Death Butterfly Swarm": [
          "Forests",
          "Plains"
        ],
        "Azza Gremlin": [
          "Any",
          "Mountains",
          "Urban"
        ],
        "Dogmole Juggernaut": [
          "Hills",
          "Mountains",
          "Ruins & Underground"
        ],
        "Desert Giant": [
          "Desert"
        ],
        "Qorgeth, Demon Lord of the Devouring Worm": [
          "Any"
        ],
        "Nihileth": [
          "Any"
        ],
        "Rotting Wind": [
          "Any"
        ],
        "Bouda": [
          "Any"
        ],
        "Beli": [
          "Any"
        ],
        "Corpse Mound": [
          "Any"
        ],
        "Mamura": [
          "Badlands",
          "Ruins & Underground"
        ],
        "Shadow Beast": [
          "Badlands",
          "Forests",
          "Ruins & Underground"
        ],
        "Broodiken": [
          "Any"
        ],
        "Derro Fetal Savant": [
          "Ruins & Underground"
        ],
        "Shoggoth": [
          "Any"
        ],
        "Gilded Devil": [
          "Any"
        ],
        "Kot Bayun": [
          "Hills",
          "Mountains",
          "Ruins & Underground"
        ],
        "Lord of the Hunt": [
          "Any"
        ],
        "Hulking Whelp": [
          "Any"
        ],
        "Possessed Pillar": [
          "Desert",
          "Urban"
        ],
        "Ravenfolk Doom Croaker": [
          "Forests",
          "Hills",
          "Urban"
        ],
        "Imperial Ghoul": [
          "Ruins & Underground"
        ],
        "Enchantress": [
          "Any"
        ],
        "Anubian": [
          "Any"
        ],
        "Ia'Affrat the Insatiable": [
          "Any"
        ],
        "Spawn of Arbeyach": [
          "Any"
        ],
        "Bone Crab": [
          "Aquatic"
        ],
        "Serpopard": [
          "Marshes",
          "Plains"
        ],
        "Dissimortuum": [
          "Any"
        ],
        "Giant Ant Queen": [
          "Any"
        ],
        "Drowned Maiden": [
          "Aquatic"
        ],
        "Millitaur": [
          "Forests"
        ],
        "War Ostrich": [
          "Desert",
          "Plains"
        ],
        "Hoard Golem": [
          "Any"
        ],
        "Blemmyes": [
          "Hills",
          "Mountains"
        ],
        "Map Mimic": [
          "Ruins & Underground"
        ],
        "Temple Dog": [
          "Any",
          "Urban"
        ],
        "Owl Harpy": [
          "Desert",
          "Forests",
          "Urban"
        ],
        "Clockwork Weaving Spider": [
          "Urban"
        ],
        "Ravenfolk Warrior": [
          "Forests",
          "Hills",
          "Urban"
        ],
        "Dream Eater": [
          "Ruins & Underground",
          "Urban"
        ],
        "Bearfolk": [
          "Forests"
        ],
        "Nightgarm": [
          "Any"
        ],
        "Mechuiti, Demon Lord of Apes": [
          "Any"
        ],
        "Cambium": [
          "Ruins & Underground",
          "Urban"
        ],
        "Baba Yaga's Horseman, Base": [
          "Any"
        ],
        "Kalke": [
          "Any"
        ],
        "Elder Shadow Drake": [
          "Forests"
        ],
        "Adult Cave Dragon": [
          "Ruins & Underground"
        ],
        "Clockwork Myrmidon": [
          "Forests",
          "Plains",
          "Urban"
        ],
        "Cavelight Moss": [
          "Ruins & Underground"
        ],
        "Skein Witch": [
          "Any"
        ],
        "Zmey": [
          "Forests"
        ],
        "Duelist": [
          "Any"
        ],
        "Stygian Fat-Tailed Scorpion": [
          "Desert",
          "Forests",
          "Plains",
          "Ruins & Underground"
        ],
        "Tosculi Drone": [
          "Desert",
          "Hills",
          "Plains"
        ],
        "Adult Wind Dragon": [
          "Mountains",
          "Plains"
        ],
        "Mbielu": [
          "Aquatic",
          "Marshes",
          "Plains"
        ],
        "Young Cave Dragon": [
          "Ruins & Underground"
        ],
        "Rubezahl": [
          "Any"
        ],
        "Risen Reaver": [
          "Any"
        ],
        "Ala": [
          "Any"
        ],
        "Clockwork Huntsman": [
          "Forests",
          "Urban"
        ],
        "Tophet": [
          "Any",
          "Urban"
        ],
        "Tosculi Hive-Queen": [
          "Desert",
          "Hills",
          "Plains"
        ],
        "Tosculi Elite Bow Raider": [
          "Desert",
          "Hills",
          "Plains"
        ],
        "Red Hag": [
          "Any"
        ],
        "Ancient Void Dragon": [
          "Badlands",
          "Mountains"
        ],
        "Stuhac": [
          "Hills",
          "Mountains"
        ],
        "Kobold Alchemist": [
          "Ruins & Underground",
          "Urban"
        ],
        "Kishi Demon": [
          "Any"
        ],
        "Nihilethic Zombie": [
          "Aquatic",
          "Ruins & Underground"
        ],
        "Al-Aeshma Genie": [
          "Any"
        ],
        "Oculo Swarm": [
          "Ruins & Underground"
        ],
        "Mahoru": [
          "Aquatic"
        ],
        "Herald of Darkness": [
          "Any"
        ],
        "Flame Dragon Wyrmling": [
          "Mountains",
          "Ruins & Underground"
        ],
        "Jaculus": [
          "Forests"
        ],
        "Morphoi": [
          "Aquatic"
        ],
        "Scorpion Cultist": [
          "Desert"
        ],
        "Automata Devil": [
          "Any"
        ],
        "Rift Swine": [
          "Any"
        ],
        "Dau": [
          "Desert"
        ],
        "Swarm of Scarab Beetles": [
          "Any",
          "Ruins & Underground"
        ],
        "Sand Hag": [
          "Desert"
        ],
        "Ice Maiden": [
          "Any"
        ],
        "Noctiny": [
          "Any"
        ],
        "Garroter Crab": [
          "Aquatic"
        ],
        "Nkosi": [
          "Plains"
        ],
        "Dragon Eel": [
          "Aquatic",
          "Ruins & Underground"
        ],
        "Black Knight Commander": [
          "Any"
        ],
        "Carrion Beetle": [
          "Any"
        ],
        "Mindrot Thrall": [
          "Any"
        ],
        "Gypsosphinx": [
          "Desert",
          "Plains",
          "Ruins & Underground"
        ],
        "Adult Sea Dragon": [
          "Aquatic"
        ],
        "Trollkin Reaver": [
          "Any"
        ],
        "Young Wind Dragon": [
          "Mountains",
          "Plains"
        ],
        "Putrid Haunt": [
          "Marshes"
        ],
        "Spinosaurus": [
          "Forests",
          "Marshes"
        ],
        "Avatar of Boreas": [
          "Any"
        ],
        "Queen of Night and Magic": [
          "Any"
        ],
        "Dorreq": [
          "Badlands"
        ],
        "Edimmu": [
          "Desert"
        ],
        "Fellforged": [
          "Any"
        ],
        "Night Scorpion": [
          "Desert",
          "Forests",
          "Plains",
          "Ruins & Underground"
        ],
        "Arcane Guardian": [
          "Any"
        ],
        "Clurichaun": [
          "Urban"
        ],
        "Flab Giant": [
          "Hills",
          "Mountains"
        ],
        "Corrupting Ooze": [
          "Any"
        ],
        "Wampus Cat": [
          "Forests",
          "Hills"
        ],
        "Erina Defender": [
          "Forests",
          "Hills",
          "Plains"
        ],
        "Vampire Warlock": [
          "Any"
        ],
        "Nichny": [
          "Any"
        ],
        "Shadow Fey": [
          "Any"
        ],
        "Treacle": [
          "Forests",
          "Plains",
          "Urban"
        ],
        "Arbeyach, Prince of Swarms": [
          "Any"
        ],
        "Venomous Mummy": [
          "Desert",
          "Ruins & Underground"
        ],
        "Rime Worm Grub": [
          "Any"
        ],
        "Slow Storm": [
          "Any"
        ],
        "Spawn of Akyishigal": [
          "Any"
        ],
        "Dune Mimic": [
          "Desert",
          "Plains"
        ],
        "Library Automaton": [
          "Urban"
        ],
        "Elemental Locus": [
          "Any"
        ],
        "Wolf Spirit Swarm": [
          "Forests",
          "Plains"
        ],
        "Steam Golem": [
          "Any"
        ],
        "Wharfling": [
          "Aquatic"
        ],
        "Koschei": [
          "Any"
        ],
        "Fear Smith (Fiarsídhe)": [
          "Any"
        ],
        "Vesiculosa": [
          "Desert",
          "Badlands"
        ],
        "Dust Goblin": [
          "Desert",
          "Badlands",
          "Ruins & Underground"
        ],
        "Goat-Man": [
          "Badlands",
          "Forests",
          "Hills"
        ],
        "Bonepowder Ghoul": [
          "Ruins & Underground"
        ],
        "Ratfolk": [
          "Ruins & Underground",
          "Urban"
        ],
        "Sluagh Swarm": [
          "Any"
        ],
        "Lemurfolk Greyfur": [
          "Forests"
        ],
        "Naina": [
          "Any"
        ],
        "Sand Spider": [
          "Desert",
          "Plains"
        ],
        "Theullai": [
          "Any"
        ],
        "Alseid": [
          "Forests"
        ],
        "Giant Ant": [
          "Any"
        ],
        "Rusalka": [
          "Aquatic"
        ],
        "Amphiptere": [
          "Forests"
        ],
        "Bucca": [
          "Any"
        ],
        "Gnarljak": [
          "Ruins & Underground",
          "Urban"
        ],
        "Tosculi Warrior": [
          "Desert",
          "Hills",
          "Plains"
        ],
        "Rat King": [
          "Ruins & Underground",
          "Urban"
        ],
        "Zanskaran Viper": [
          "Marshes"
        ],
        "Degenerate Titan": [
          "Plains",
          "Ruins & Underground"
        ],
        "Bone Collective": [
          "Any"
        ],
        "Sarcophagus Slime": [
          "Ruins & Underground"
        ],
        "Savager": [
          "Forests",
          "Plains"
        ],
        "Camazotz, Demon Lord of Bats and Fire": [
          "Any"
        ],
        "Ratatosk": [
          "Any",
          "Forests"
        ],
        "Flutterflesh": [
          "Any"
        ],
        "Prismatic Beetle Swarm": [
          "Forests"
        ],
        "Black Night (Baba Yaga's Horseman)": [
          "Any"
        ],
        "Folk of Leng": [
          "Any"
        ],
        "Behtu": [
          "Forests"
        ],
        "Berstuc": [
          "Any"
        ],
        "City Watch Captain": [
          "Urban"
        ],
        "Hundun": [
          "Any"
        ],
        "Kobold Trapsmith": [
          "Ruins & Underground",
          "Urban"
        ],
        "Dwarven Ringmage": [
          "Any"
        ],
        "Totivillus, Scribe of Hell": [
          "Any"
        ],
        "Beggar Ghoul": [
          "Ruins & Underground",
          "Urban"
        ],
        "Mammon, Archduke of Greed": [
          "Any"
        ],
        "Likho": [
          "Forests"
        ],
        "Crystalline Devil": [
          "Ruins & Underground",
          "Urban"
        ],
        "Wind Dragon Wyrmling": [
          "Hills",
          "Mountains",
          "Plains"
        ],
        "Dragonleaf Tree": [
          "Forests",
          "Urban"
        ],
        "Mavka": [
          "Any"
        ],
        "Titanoboa": [
          "Forests"
        ],
        "Eye Golem": [
          "Any"
        ],
        "Urochar (Strangling Watcher)": [
          "Ruins & Underground"
        ],
        "Fire Dancer Swarm": [
          "Any"
        ],
        "Kobold Chieftain": [
          "Ruins & Underground",
          "Urban"
        ],
        "Dipsa": [
          "Marshes"
        ],
        "Chronalmental": [
          "Any"
        ],
        "Imy-ut Ushabti": [
          "Any"
        ],
        "Angler Worm": [
          "Ruins & Underground"
        ],
        "Young Spinosaurus": [
          "Forests",
          "Marshes"
        ],
        "Adult Flame Dragon": [
          "Mountains",
          "Ruins & Underground"
        ],
        "Akyishigal, Demon Lord of Cockroaches": [
          "Any"
        ],
        "Subek": [
          "Aquatic"
        ],
        "Suturefly": [
          "Forests",
          "Marshes"
        ],
        "Bastet Temple Cat": [
          "Urban"
        ],
        "Star-Spawn of Cthulhu": [
          "Any"
        ],
        "Alseid Grovekeeper": [
          "Forests"
        ],
        "Eater of Dust (Yakat-Shi)": [
          "Any"
        ],
        "Xanka": [
          "Any"
        ],
        "Red-Banded Line Spider": [
          "Any"
        ],
        "Crimson Drake": [
          "Forests"
        ],
        "Dogmole": [
          "Forests",
          "Hills",
          "Mountains"
        ],
        "Forest Marauder": [
          "Badlands",
          "Forests"
        ],
        "Cave Dragon Wyrmling": [
          "Ruins & Underground"
        ],
        "Hraesvelgr the Corpse Swallower": [
          "Any"
        ],
        "Shellycoat": [
          "Ruins & Underground"
        ],
        "Myling": [
          "Any"
        ],
        "Sap Demon": [
          "Forests"
        ],
        "Spectral Guardian": [
          "Any"
        ],
        "Water Leaper": [
          "Aquatic"
        ],
        "Malakbel": [
          "Any"
        ],
        "Nkosi Pridelord": [
          "Plains"
        ],
        "Zimwi": [
          "Any"
        ],
        "Skin Bat": [
          "Any"
        ],
        "Angatra": [
          "Forests"
        ],
        "Darakhul Ghoul": [
          "Ruins & Underground"
        ],
        "Ancient Titan": [
          "Any"
        ],
        "Isonade": [
          "Aquatic"
        ],
        "Mirager": [
          "Desert",
          "Badlands"
        ],
        "Krake Spawn": [
          "Aquatic"
        ],
        "Paper Drake": [
          "Urban"
        ],
        "Coral Drake": [
          "Aquatic"
        ],
        "Young Sea Dragon": [
          "Aquatic",
          "Mountains"
        ],
        "Fraughashar": [
          "Any"
        ],
        "Sand Silhouette": [
          "Desert"
        ],
        "Lindwurm": [
          "Forests",
          "Hills"
        ],
        "Chelicerae": [
          "Badlands"
        ],
        "Gearforged Templar": [
          "Any"
        ],
        "Moonlit King": [
          "Any"
        ],
        "Gray Thirster": [
          "Desert"
        ],
        "Clockwork Beetle": [
          "Any"
        ],
        "Deathwisp": [
          "Any"
        ],
        "Red Sun (Baba Yaga's Horseman)": [
          "Any"
        ],
        "Ratfolk Rogue": [
          "Ruins & Underground",
          "Urban"
        ],
        "Accursed Defiler": [
          "Desert",
          "Badlands"
        ],
        "Erina Scrounger": [
          "Forests",
          "Hills",
          "Plains"
        ],
        "Mallqui": [
          "Desert",
          "Mountains",
          "Plains",
          "Urban"
        ],
        "Roachling Skirmisher": [
          "Ruins & Underground",
          "Urban"
        ],
        "Empty Cloak": [
          "Any"
        ],
        "Cobbleswarm": [
          "Ruins & Underground",
          "Urban"
        ],
        "Spider of Leng": [
          "Hills",
          "Mountains"
        ],
        "Far Darrig": [
          "Forests",
          "Plains"
        ],
        "Abominable Beauty": [
          "Any"
        ],
        "Ravenala": [
          "Forests"
        ],
        "Drakon": [
          "Coastal"
        ],
        "Clockwork Hound": [
          "Forests",
          "Urban"
        ],
        "Vaettir": [
          "Any"
        ],
        "Mngwa": [
          "Badlands",
          "Forests",
          "Plains"
        ],
        "Ancient Flame Dragon": [
          "Mountains",
          "Ruins & Underground"
        ],
        "Spire Walker": [
          "Any"
        ],
        "Clockwork Abomination": [
          "Any"
        ],
        "Uraeus": [
          "Any",
          "Ruins & Underground"
        ],
        "Zaratan": [
          "Aquatic"
        ],
        "Ravenfolk Scout": [
          "Forests",
          "Hills",
          "Urban"
        ]
      }
      
};