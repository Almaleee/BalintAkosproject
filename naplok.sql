CREATE TABLE naplok (
	azon INT(4) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	felhasznalo_azon INT(3) NOT NULL,
	sorozat_azon INT(2) NOT NULL,
	evad INT NOT NULL,
	epizod INT NOT NULL,
	FOREIGN KEY (felhasznalo_azon) REFERENCES felhasznalok(azon)
	 ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (sorozat_azon) REFERENCES sorozatok(azon)
	 ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_hungarian_ci;