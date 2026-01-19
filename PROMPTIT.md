Minä: 
    Tavoite 
    Tehtäväsi on toteuttaa yksinkertainen kokoushuoneiden varausrajapinta (API). 
    Palvelun tulee tarjota käyttäjille seuraavat toiminnot: 
    ● Varauksen luonti: Varaa huone tietylle aikavälille. 
    ● Varauksen peruutus: Poista varaus. 
    ● Varausten katselu: Listaa kaikki tietyn huoneen varaukset. 
    Toimintalogiikka (business rules): 
    ● Varaukset eivät saa mennä päällekkäin (kaksi henkilöä ei voi varata samaa huonetta 
    samaan aikaan). 
    ● Varaukset eivät voi sijoittua menneisyyteen. 
    ● Aloitusajan täytyy olla ennen lopetusaikaa. 
    Tekniset reunaehdot: 
    ● Voit käyttää mitä tahansa yleistä ohjelmointikieltä, joka on sinulle tuttu (Python, 
    JavaScript/TypeScript, Java, C# tai vastaava). 
    ● Voit käyttää muistinvaraista tietokantaa (in-memory database), jotta ympäristön 
    pystytys pysyy yksinkertaisena (esim. PostgreSQL tai MySQL-asennusta ei vaadita). 
    Muuta huomioitavaa: 
    ● Kuten oikeissakin työtehtävissä, tehtävänanto ei välttämättä sisällä kaikkea tarvittavaa 
    informaatiota. Koska käytettävissä ei ole “asiakasta” jolta kysyä lisätietoja, niin tehtävän 
    läpiviemiseksi saat tehdä itse oletuksia, kunhan dokumentoit tekemäsi oletukset. 

ChatGPT:
    Alla on **yksi mahdollinen toteutus** yksinkertaisesta kokoushuoneiden varaus-API:sta.
    Valitsin **Node.js + Express** -ratkaisun, koska se on kevyt, yleinen ja sinulle ennestään tuttu.

    ---

    ## Oletukset (dokumentoitu kuten pyydettiin)

    1. **Aikavyöhyke:** Kaikki ajat käsitellään **ISO 8601 UTC -aikana** (`YYYY-MM-DDTHH:mm:ssZ`).
    2. **Huoneet:** Huoneet tunnistetaan `roomId`-stringillä (esim. `"room-1"`). Erillistä huonetaulua ei ole.
    3. **Käyttäjät:** Ei autentikointia – kuka tahansa voi luoda/perua varauksia.
    4. **Tallennus:** Kaikki data on **in-memory** (palvelun restartti tyhjentää varaukset).
    5. **Päällekkäisyys:** Varaus menee päällekkäin, jos aikavälit leikkaavat edes osittain.

    ---

    ## API-toiminnot

    ### 1. Luo varaus

    `POST /reservations`

    ```json
    {
    "roomId": "room-1",
    "startTime": "2026-02-01T10:00:00Z",
    "endTime": "2026-02-01T11:00:00Z"
    }
    ```

    ### 2. Peruuta varaus

    `DELETE /reservations/:id`

    ### 3. Listaa huoneen varaukset

    `GET /rooms/:roomId/reservations`

    ---

    ## Toteutus (Node.js + Express)

    ```js
    const express = require("express");
    const app = express();

    app.use(express.json());

    // In-memory "database"
    let reservations = [];
    let idCounter = 1;

    // Helpers
    function isOverlapping(startA, endA, startB, endB) {
    return startA < endB && startB < endA;
    }

    // Create reservation
    app.post("/reservations", (req, res) => {
    const { roomId, startTime, endTime } = req.body;

    if (!roomId || !startTime || !endTime) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // Business rules
    if (start >= end) {
        return res.status(400).json({ error: "Start time must be before end time" });
    }

    if (start < now) {
        return res.status(400).json({ error: "Reservation cannot be in the past" });
    }

    const overlapping = reservations.find(r =>
        r.roomId === roomId &&
        isOverlapping(start, end, r.startTime, r.endTime)
    );

    if (overlapping) {
        return res.status(409).json({ error: "Room already booked for this time" });
    }

    const reservation = {
        id: idCounter++,
        roomId,
        startTime: start,
        endTime: end
    };

    reservations.push(reservation);
    res.status(201).json(reservation);
    });

    // Cancel reservation
    app.delete("/reservations/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = reservations.findIndex(r => r.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Reservation not found" });
    }

    reservations.splice(index, 1);
    res.status(204).send();
    });

    // List room reservations
    app.get("/rooms/:roomId/reservations", (req, res) => {
    const { roomId } = req.params;

    const roomReservations = reservations
        .filter(r => r.roomId === roomId)
        .sort((a, b) => a.startTime - b.startTime);

    res.json(roomReservations);
    });

    // Start server
    app.listen(3000, () => {
    console.log("Meeting room reservation API running on port 3000");
    });
    ```

    ---

    ## Miksi tämä ratkaisu on “työelämäkelpoinen”

    * ✔ Selkeä **business-logiikka** (ei päällekkäisyyksiä, ei menneisyyttä)
    * ✔ REST-tyylinen API
    * ✔ Helppo laajentaa (auth, tietokanta, useat huoneet)
    * ✔ Testattavissa helposti (esim. Postman / Jest)

    ---

    Jos haluat, voin:

    * ✨ Muuntaa tämän **TypeScriptiksi**
    * 🧪 Lisätä **yksikkötestit**
    * ☁️ Näyttää, miten tämä deployataan **AWS Lambda + API Gateway**
    * 📄 Kirjoittaa tämän **README.md-muotoon** teknistä tehtävää varten

    Sanot vaan 👍

Minä:
    onko tämä paras tehdä juuri node.js + express? eikö TS olisi parempi?

ChatGPT:
    Lyhyt vastaus: **TypeScript on parempi**, *Node.js + Express + TypeScript* on yleensä paras yhdistelmä tämän tyyppiseen tehtävään.

    Pidempänä ja perustellusti 👇

    ---

    ## Miksi TypeScript on parempi kuin “pelkkä” Node.js (JS)

    ### 1. Tyyppiturva (iso etu teknisessä tehtävässä)

    TypeScript:

    * estää virheitä **jo käännösvaiheessa**
    * tekee API-sopimuksista selkeämpiä
    * näyttää arvioijalle, että osaat ajatella **ylläpidettävää backend-koodia**

    Esim:

    ```ts
    interface Reservation {
    id: number;
    roomId: string;
    startTime: Date;
    endTime: Date;
    }
    ```

    → Et voi vahingossa palauttaa vääränlaista dataa.

    ---

    ### 2. Luettavuus & itse-dokumentoivuus

    Kun joku lukee koodiasi (rekrytoija):

    * näkee heti, **mitä endpoint odottaa**
    * näkee heti, **mitä funktio palauttaa**
    * ei tarvitse arvailla

    Tämä on **iso plussa junior → mid -tason arvioinnissa**.

    ---

    ### 3. Todellinen työelämä

    Rehellisesti:

    * Pelkkä JS backendissä = harvinaista
    * **Node + TS** = erittäin yleinen

    Jos tehtävän ideana on simuloida oikeaa työtilannetta → **TS on oikea valinta**.

    ---

    ## Entä Express vs muut?

    ### Express on täysin ok tässä

    * yksinkertainen
    * ei turhaa magiaa
    * helppo arvioida

    **Vaihtoehdot:**

    * Fastify → parempi suorituskyky, enemmän konffia
    * NestJS → enterprise-tason, mutta *ylilyönti* tähän tehtävään

    ➡️ **Express + TS näyttää fiksulta ja maltilliselta valinnalta**

    ---

    ## Suositeltu stack tähän tehtävään

    **Paras tasapaino:**

    * Node.js
    * Express
    * TypeScript
    * In-memory storage (array / Map)
    * Ei ORM:ää (liikaa tähän)

    Tämä viestii:

    > “Ymmärrän tuotantokoodin periaatteet, mutta en ylikoodaa.”

    ---

    ## Milloin JS olisi ok?

    JS on ok, jos:

    * tehtäväaika on hyvin rajattu
    * TS ei ole ennestään tuttu

    Mutta **sinun taustalla** (Node, AWS, CI/CD, web-dev):
    ➡️ **TS on ehdottomasti parempi signaali**

    ---

    ## Haluatko seuraavaksi?

    Voin:

    * 🔧 muuttaa äskeisen ratkaisun **TypeScript + Express** -versioksi
    * 📁 antaa **hakemistorakenteen**, joka näyttää “työelämältä”
    * ✍️ kirjoittaa **perustelun READMEen** miksi valitsit TS:n

    Sano vain mihin mennään 👌

Minä:
    olisi mukava palautella mieleen TypeScriptiä, sillä siinä omat tuevallisuustekijänsä ja muutenkin suunnitelmissa omia projekteja päivittää JS -> TS. muutatko ratkaisun TS + Express versioksi?

ChatGPT:
    Erittäin hyvä ajatus 👍
    Tämä on **täydellinen pieni projekti** TypeScriptin “lihaksen” palauttamiseen ja samalla saat mallin, jota voit käyttää omissa JS → TS -migraatioissa.

    Alla on **siisti, työelämäkelpoinen TS + Express -versio** samasta ratkaisusta, selkeästi jaoteltuna.

    ---

    # Kokoushuonevaraus API – TypeScript + Express

    ## Projektirakenne (suositus)

    ```
    meeting-room-api/
    ├─ src/
    │  ├─ app.ts
    │  ├─ routes/
    │  │  └─ reservations.ts
    │  ├─ models/
    │  │  └─ Reservation.ts
    │  └─ db/
    │     └─ inMemoryDb.ts
    ├─ package.json
    ├─ tsconfig.json
    └─ README.md
    ```

    ---

    ## 1️⃣ Reservation-malli (`src/models/Reservation.ts`)

    ```ts
    export interface Reservation {
    id: number;
    roomId: string;
    startTime: Date;
    endTime: Date;
    }
    ```

    ➡️ Tämä on **TypeScriptin ydinvoitto**: selkeä dataformaatti kaikkialla.

    ---

    ## 2️⃣ In-memory “tietokanta” (`src/db/inMemoryDb.ts`)

    ```ts
    import { Reservation } from "../models/Reservation";

    export const reservations: Reservation[] = [];
    ```

    ---

    ## 3️⃣ Reitit ja liiketoimintalogiikka (`src/routes/reservations.ts`)

    ```ts
    import { Router, Request, Response } from "express";
    import { reservations } from "../db/inMemoryDb";
    import { Reservation } from "../models/Reservation";

    const router = Router();
    let idCounter = 1;

    function isOverlapping(
    startA: Date,
    endA: Date,
    startB: Date,
    endB: Date
    ): boolean {
    return startA < endB && startB < endA;
    }

    // POST /reservations
    router.post("/", (req: Request, res: Response) => {
    const { roomId, startTime, endTime } = req.body as {
        roomId?: string;
        startTime?: string;
        endTime?: string;
    };

    if (!roomId || !startTime || !endTime) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start >= end) {
        return res.status(400).json({
        error: "Start time must be before end time"
        });
    }

    if (start < now) {
        return res.status(400).json({
        error: "Reservation cannot be in the past"
        });
    }

    const overlapping = reservations.find(r =>
        r.roomId === roomId &&
        isOverlapping(start, end, r.startTime, r.endTime)
    );

    if (overlapping) {
        return res.status(409).json({
        error: "Room already booked for this time"
        });
    }

    const reservation: Reservation = {
        id: idCounter++,
        roomId,
        startTime: start,
        endTime: end
    };

    reservations.push(reservation);
    res.status(201).json(reservation);
    });

    // DELETE /reservations/:id
    router.delete("/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = reservations.findIndex(r => r.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Reservation not found" });
    }

    reservations.splice(index, 1);
    res.status(204).send();
    });

    // GET /rooms/:roomId/reservations
    router.get("/rooms/:roomId/reservations", (req: Request, res: Response) => {
    const { roomId } = req.params;

    const roomReservations = reservations
        .filter(r => r.roomId === roomId)
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    res.json(roomReservations);
    });

    export default router;
    ```

    💡 Huomaa:

    * `Reservation`-tyyppi käytössä kaikkialla
    * request body on **tyypitetty**
    * ei `any`-tyyppejä

    ---

    ## 4️⃣ Sovelluksen entry point (`src/app.ts`)

    ```ts
    import express from "express";
    import reservationsRouter from "./routes/reservations";

    const app = express();

    app.use(express.json());
    app.use("/reservations", reservationsRouter);

    const PORT = 3000;
    app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    });
    ```

    ---

    ## 5️⃣ TypeScript-konfiguraatio (`tsconfig.json`)

    ```json
    {
    "compilerOptions": {
        "target": "ES2020",
        "module": "CommonJS",
        "rootDir": "src",
        "outDir": "dist",
        "strict": true,
        "esModuleInterop": true
    }
    }
    ```

    ➡️ `strict: true` = **hyvä TypeScript-kuntoilu**

    ---

    ## 6️⃣ package.json (oleellinen osa)

    ```json
    {
    "scripts": {
        "dev": "ts-node-dev src/app.ts",
        "build": "tsc",
        "start": "node dist/app.js"
    },
    "dependencies": {
        "express": "^4.18.2"
    },
    "devDependencies": {
        "@types/express": "^4.17.21",
        "ts-node-dev": "^2.0.0",
        "typescript": "^5.3.3"
    }
    }
    ```

    ---

    ## Miksi tämä on erinomainen TS-harjoitus sinulle

    * näet **JS → TS** erot käytännössä
    * opit tyypittämään:

    * request bodyt
    * domain-mallit
    * helper-funktiot
    * sama rakenne toimii suoraan:

    * AWS Lambda
    * Fastify
    * NestJS

    ---

    ## Seuraavat luonnolliset stepit (suosittelen)

    1. 🔁 Muunna yksi oma vanha JS-projekti tällä mallilla TS:ksi
    2. 🧪 Lisää **Jest-testit** business-logiikalle
    3. ☁️ Pakkaa tämä **Lambda + API Gateway** -muotoon
    4. 📦 Korvaa in-memory DB myöhemmin RDS:llä

    Jos haluat, seuraavaksi voin:

    * auttaa **JS → TS migraatiostrategiassa**
    * tehdä tästä **AWS-yhteensopivan**
    * lisätä **testit**
    * kirjoittaa **README:n palautusta varten**

    Sanot vaan 💪

Minä:
    lisäätkö testit tähän luotuun varausjärjestelmään

ChatGPT:
    Ehdottomasti 👍
    Lisätään **Jest-testit** niin, että ne testaavat **liiketoimintalogiikkaa oikeasti hyödyllisellä tavalla**, eivätkä ole pelkkiä “endpoint ping” -testejä.

    Teen tämän **työelämäkelpoisella tavalla**:

    * testataan API:a HTTP-tasolla
    * ei testata Expressiä itseään
    * testataan **business rules** (päällekkäisyys, menneisyys, aikajärjestys)

    ---

    # Testausstrategia (miksi näin)

    Valitsen:

    * **Jest** → de facto -standardi
    * **Supertest** → HTTP-kutsut Express-appiin ilman oikeaa serveriä

    Tämä:

    * simuloi oikeaa käyttöä
    * on helppo ymmärtää rekrytoijalle
    * on helppo laajentaa

    ---

    ## 1️⃣ Asennukset

    ```bash
    npm install --save-dev jest ts-jest @types/jest supertest @types/supertest
    ```

    ---

    ## 2️⃣ Jest-konfiguraatio (`jest.config.js`)

    ```js
    module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/*.test.ts"]
    };
    ```

    ---

    ## 3️⃣ Pieni refaktorointi: app exportattavaksi

    ### `src/app.ts`

    ```ts
    import express from "express";
    import reservationsRouter from "./routes/reservations";

    const app = express();

    app.use(express.json());
    app.use("/reservations", reservationsRouter);

    export default app;
    ```

    ### `src/server.ts` (uusi tiedosto)

    ```ts
    import app from "./app";

    const PORT = 3000;
    app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    });
    ```

    ➡️ **Tämä on tärkeä testattavuuspattern**
    (app ≠ server)

    ---

    ## 4️⃣ Testikansio

    ```
    src/
    ├─ __tests__/
    │  └─ reservations.test.ts
    ```

    ---

    ## 5️⃣ Testit (`src/__tests__/reservations.test.ts`)

    ```ts
    import request from "supertest";
    import app from "../app";
    import { reservations } from "../db/inMemoryDb";

    describe("Meeting room reservation API", () => {

    beforeEach(() => {
        reservations.length = 0; // reset in-memory DB
    });

    test("creates a reservation successfully", async () => {
        const response = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T10:00:00Z",
            endTime: "2099-01-01T11:00:00Z"
        });

        expect(response.status).toBe(201);
        expect(response.body.roomId).toBe("room-1");
    });

    test("rejects overlapping reservations", async () => {
        await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T10:00:00Z",
            endTime: "2099-01-01T11:00:00Z"
        });

        const response = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T10:30:00Z",
            endTime: "2099-01-01T11:30:00Z"
        });

        expect(response.status).toBe(409);
    });

    test("allows same time reservation in different rooms", async () => {
        await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T10:00:00Z",
            endTime: "2099-01-01T11:00:00Z"
        });

        const response = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-2",
            startTime: "2099-01-01T10:00:00Z",
            endTime: "2099-01-01T11:00:00Z"
        });

        expect(response.status).toBe(201);
    });

    test("rejects reservation in the past", async () => {
        const response = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2000-01-01T10:00:00Z",
            endTime: "2000-01-01T11:00:00Z"
        });

        expect(response.status).toBe(400);
    });

    test("rejects invalid time range", async () => {
        const response = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T11:00:00Z",
            endTime: "2099-01-01T10:00:00Z"
        });

        expect(response.status).toBe(400);
    });

    test("deletes reservation successfully", async () => {
        const createResponse = await request(app)
        .post("/reservations")
        .send({
            roomId: "room-1",
            startTime: "2099-01-01T10:00:00Z",
            endTime: "2099-01-01T11:00:00Z"
        });

        const reservationId = createResponse.body.id;

        const deleteResponse = await request(app)
        .delete(`/reservations/${reservationId}`);

        expect(deleteResponse.status).toBe(204);
    });
    });
    ```

    ---

    ## 6️⃣ package.json – test script

    ```json
    {
    "scripts": {
        "test": "jest"
    }
    }
    ```

    ---

    ## Mitä tämä kertoo arvioijalle 🚀

    * ✔ osaat testata **API:ta realistisesti**
    * ✔ ymmärrät **in-memory DB:n resetoinnin**
    * ✔ testaat oikeita **business ruleja**
    * ✔ TypeScript + testaus = tuotantovalmiin ajattelun merkki

    Tämä on **erittäin vahva** signaali junior/mid-backend-rooleihin.

    ---

    ## Haluatko vielä seuraavaksi?

    Voin:

    * 🧠 erottaa business-logiikan **service-layeriin** (vielä parempi testattavuus)
    * 📊 lisätä testikattavuuden (coverage)
    * ☁️ näyttää miten nämä testit ajetaan CI/CD:ssä
    * ✍️ kirjoittaa **README:n testiosion** palautusta varten

    Sano vain, jatketaanko 💪
