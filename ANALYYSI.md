## 1. Mitä tekoäly teki hyvin?

Tekoäly on todella hyvä ja tehokas löytämään kirjoitus -ja logiikkavirheitä koodista.
Se osaa yleensä tehdä yksittäisiä komponentteja tehokkaasti.
Esimerkiksi se osasi tässä projektissa kasata rungon hyvin ja tehdä muutokset, jotta rajapinta saatiin käyttämään in-memory toetokannan sijasta postgreSQL tietokantaa.
Se osaa kyllä antaa nopeasti hyviäkin ratkaisuja konkreettisin esimerkein sen sijasta että etsisi esimerkiksi ratkaisuja Stackoverflowsta tai muualta Googlettamalla.
Se osaa myös monesti antaa useita ratkaisuvaihtoehtoja ongelmiin.

## 2. Mitä tekoäly teki huonosti?

Tässä esimerkiksi ensimmäisessä toimivassa versiossa ei otettu ollenkaan huomioon sitä että huoneita tulisi jopa rajaton määrä, eli sillä ei ole niin hyvää
todellisuudeN hahmottamisen kykyä.
Se ei myöskään ole aina aivan perillä tehdyistä muutoksista, vaikka olisikin pääsy koodieditorissa suoraan projektin tiedostoihin.
Monesti sen antamat ratkaisut ongelmiin eivät ole niitä parhaimpia vaan kehittäjä joutuu niistä sorvaamaan omanlaisiansa ratkaisuja.

## 3. Mitkä olivat tärkeimmät parannukset tekoälyn tuottamaan koodiin ja miksi?

Ensimmäiseksi muutin koodin niin, että huoneet ovat valmiiksi luotuja järjestelmään, sen sijaan että ne luotaisiin varauksen yhteydessä. Tämä vastaa paremmin tosielämän käyttötarkoitusta.

Myöhemmin lisäsin järjestelmään käyttäjien hallinnan ja sen, kuka voi luoda huoneita. Tämä oli turvallisuutta parantava ominaisuus ja otti huomioon todellisen käyttöympäristön.

Loin kattavat testit ja niihin käytettävän testidatan. Nämä auttoivat minua havaitsemaan ja paikallistamaan virheet ja varmistamaan koodin toimivuuden.
Tähän auttoi myös laaja virheenkäsittely.

Pidin koodin selkeänä ja rivit maltillisina. Käytin myös kommentteja koodissa, jotta pysyin paremmin perillä siitä mitä olin tehnyt ja mitä suunnitellut tekeväni.

Vaihdoin alkuperäisen in-memory-tietokannan PostgreSQL-tietokantaan. Tämä teki toiminnoista yksinkertaisempia ja näin ollen supisti rivimäärää.
Optimoin myös kyselyitä, jotta yhdellä kyselyllä haetaan tietoja kahdesta taulusta. Tämä tehostaa tietojen hakua ja vähentää tietokantakyselyiden määrää, parantaa suorituskykyä ja tekee sovelluksesta skaalautuvamman. Säilytin kuitenkin in-memory-version omassa branchissään kehityksen ja testauksen helpottamiseksi.