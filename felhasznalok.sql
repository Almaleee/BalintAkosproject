CREATE TABLE felhasznalok (
	azon INT(3) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	nev VARCHAR(30) NOT NULL,
	jelszo longtext NOT NULL,
	email VARCHAR(25) NOT NULL
	
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE utf8mb4_hungarian_ci;