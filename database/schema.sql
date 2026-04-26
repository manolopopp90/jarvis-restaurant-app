-- Restaurant App Datenbank Schema
-- Dä Seeblick - Berg SG

-- Tische
CREATE TABLE tische (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nummer INTEGER NOT NULL,
    name TEXT NOT NULL,
    kapazitaet INTEGER DEFAULT 4,
    status TEXT DEFAULT 'frei', -- frei, belegt, reserviert
    x_position INTEGER DEFAULT 0,
    y_position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kategorien (Speisen, Getränke)
CREATE TABLE kategorien (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    typ TEXT NOT NULL, -- speise, getraenk
    reihenfolge INTEGER DEFAULT 0,
    aktiv INTEGER DEFAULT 1
);

-- Speisekarte
CREATE TABLE speisen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kategorie_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    beschreibung TEXT,
    preis DECIMAL(10,2) NOT NULL,
    allergene TEXT,
    bild_url TEXT,
    aktiv INTEGER DEFAULT 1,
    FOREIGN KEY (kategorie_id) REFERENCES kategorien(id)
);

-- Bestellungen
CREATE TABLE bestellungen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tisch_id INTEGER NOT NULL,
    status TEXT DEFAULT 'offen', -- offen, in_zubereitung, fertig, abgerechnet
    gesamtbetrag DECIMAL(10,2) DEFAULT 0,
    notiz TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tisch_id) REFERENCES tische(id)
);

-- Bestellpositionen
CREATE TABLE bestellpositionen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bestellung_id INTEGER NOT NULL,
    speise_id INTEGER NOT NULL,
    anzahl INTEGER DEFAULT 1,
    preis_einzeln DECIMAL(10,2) NOT NULL,
    notiz TEXT,
    status TEXT DEFAULT 'offen', -- offen, in_zubereitung, fertig
    FOREIGN KEY (bestellung_id) REFERENCES bestellungen(id),
    FOREIGN KEY (speise_id) REFERENCES speisen(id)
);

-- Tagesumsätze
CREATE TABLE tagesumsaetze (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    datum DATE NOT NULL UNIQUE,
    umsatz DECIMAL(10,2) DEFAULT 0,
    anzahl_bestellungen INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Demo Daten
INSERT INTO tische (nummer, name, kapazitaet, x_position, y_position) VALUES
(1, 'Tisch 1', 4, 10, 10),
(2, 'Tisch 2', 4, 120, 10),
(3, 'Tisch 3', 4, 230, 10),
(4, 'Tisch 4', 6, 10, 100),
(5, 'Tisch 5', 6, 120, 100),
(6, 'Tisch 6', 2, 230, 100),
(7, 'Tisch 7', 4, 10, 190),
(8, 'Tisch 8', 4, 120, 190),
(9, 'Terrasse 1', 6, 10, 280),
(10, 'Terrasse 2', 6, 120, 280);

INSERT INTO kategorien (name, typ, reihenfolge) VALUES
('Vorspeisen', 'speise', 1),
('Hauptgerichte', 'speise', 2),
('Desserts', 'speise', 3),
('Warme Getränke', 'getraenk', 4),
('Kalte Getränke', 'getraenk', 5),
('Biere', 'getraenk', 6),
('Weine', 'getraenk', 7);

INSERT INTO speisen (kategorie_id, name, beschreibung, preis, allergene) VALUES
(1, 'Carpaccio', 'Dünn geschnittenes Rindfleisch mit Rucola', 14.50, 'A, C, G'),
(1, 'Caprese', 'Tomaten, Mozzarella, Basilikum', 11.00, 'G'),
(2, 'Schnitzel', 'Paniertes Kalbsschnitzel mit Pommes', 24.50, 'A, C, G'),
(2, 'Fischfilet', 'Gebratenes Fischfilet mit Gemüse', 22.00, 'A, D'),
(2, 'Veggie Burger', 'Hausgemachter Gemüseburger', 19.50, 'A, G'),
(3, 'Tiramisu', 'Klassisch italienisch', 8.50, 'A, C, G'),
(3, 'Crème Brûlée', 'Vanillepudding mit karamellisierter Zuckerkruste', 8.50, 'C, G'),
(4, 'Kaffee', 'Frisch gebrühter Kaffee', 4.00, NULL),
(4, 'Espresso', 'Kräftiger Espresso', 3.50, NULL),
(5, 'Mineralwasser', 'Mit oder ohne Kohlensäure', 3.50, NULL),
(5, 'Cola', 'Cola 3dl', 4.50, NULL),
(6, 'Bier vom Fass', '3dl', 5.50, 'C'),
(6, 'Flaschenbier', '3.3dl', 6.00, 'C'),
(7, 'Rotwein', '1dl', 7.00, NULL),
(7, 'Weisswein', '1dl', 7.00, NULL);
