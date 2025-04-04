-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2025. Ápr 04. 11:27
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `sorozatnaplo`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `felhasznalok`
--

CREATE TABLE `felhasznalok` (
  `azon` int(3) NOT NULL,
  `nev` varchar(30) NOT NULL,
  `jelszo` longtext NOT NULL,
  `email` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `felhasznalok`
--

INSERT INTO `felhasznalok` (`azon`, `nev`, `jelszo`, `email`) VALUES
(5, 'teszt', '$2b$10$C6sxnijYVNYQICk8UStRDecpXzQM9sFq81liFsBZqtnVHENxAiYVi', 'test@gmail.com');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `naplok`
--

CREATE TABLE `naplok` (
  `azon` int(4) NOT NULL,
  `felhasznalo_azon` int(3) NOT NULL,
  `sorozat_azon` int(2) NOT NULL,
  `evad` int(11) NOT NULL,
  `epizod` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `naplok`
--

INSERT INTO `naplok` (`azon`, `felhasznalo_azon`, `sorozat_azon`, `evad`, `epizod`) VALUES
(12, 5, 10, 1, 2);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `sorozatok`
--

CREATE TABLE `sorozatok` (
  `azon` int(2) NOT NULL,
  `cim` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- A tábla adatainak kiíratása `sorozatok`
--

INSERT INTO `sorozatok` (`azon`, `cim`) VALUES
(10, 'teszt sorozat');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `felhasznalok`
--
ALTER TABLE `felhasznalok`
  ADD PRIMARY KEY (`azon`);

--
-- A tábla indexei `naplok`
--
ALTER TABLE `naplok`
  ADD PRIMARY KEY (`azon`),
  ADD KEY `felhasznalo_azon` (`felhasznalo_azon`),
  ADD KEY `sorozat_azon` (`sorozat_azon`);

--
-- A tábla indexei `sorozatok`
--
ALTER TABLE `sorozatok`
  ADD PRIMARY KEY (`azon`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `felhasznalok`
--
ALTER TABLE `felhasznalok`
  MODIFY `azon` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT a táblához `naplok`
--
ALTER TABLE `naplok`
  MODIFY `azon` int(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT a táblához `sorozatok`
--
ALTER TABLE `sorozatok`
  MODIFY `azon` int(2) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `naplok`
--
ALTER TABLE `naplok`
  ADD CONSTRAINT `naplok_ibfk_1` FOREIGN KEY (`felhasznalo_azon`) REFERENCES `felhasznalok` (`azon`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `naplok_ibfk_2` FOREIGN KEY (`sorozat_azon`) REFERENCES `sorozatok` (`azon`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
